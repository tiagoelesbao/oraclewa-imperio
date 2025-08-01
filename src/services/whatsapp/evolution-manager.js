import axios from 'axios';
import logger from '../../utils/logger.js';
import { getRedisClient } from '../redis/client.js';

const instances = [];
let currentInstanceIndex = 0;

export const initializeWhatsAppInstances = async () => {
  try {
    // Configuração para Evolution API unificada
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    
    // Nomes das instâncias conforme criadas no Evolution
    const instanceNames = ['imperio1', 'imperio2', 'imperio3'];
    
    // Cliente axios único para Evolution API
    const evolutionClient = axios.create({
      baseURL: evolutionUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      timeout: 30000
    });

    for (const instanceName of instanceNames) {
      try {
        const instance = {
          id: instanceName,
          name: instanceName,
          client: evolutionClient,
          status: 'initializing',
          messageCount: 0,
          lastMessageTime: null
        };

        instances.push(instance);
        logger.info(`WhatsApp instance ${instanceName} configured`);
      } catch (error) {
        logger.error(`Failed to initialize instance ${instanceName}:`, error);
      }
    }

    await checkInstancesStatus();
    setInterval(checkInstancesStatus, 60000); // Check every minute
    setInterval(resetMessageCounts, 3600000); // Reset counts every hour

    logger.info('Evolution API instances initialized');
  } catch (error) {
    logger.error('Failed to initialize Evolution API instances:', error);
    throw error;
  }
};

const checkInstancesStatus = async () => {
  for (const instance of instances) {
    try {
      const response = await instance.client.get(`/instance/connectionState/${instance.name}`);
      const state = response.data?.instance?.state;
      
      instance.status = state === 'open' ? 'connected' : 'disconnected';
      
      if (instance.status === 'disconnected') {
        logger.warn(`Instance ${instance.name} is disconnected`);
        // Tentar reconectar automaticamente
        try {
          await instance.client.get(`/instance/connect/${instance.name}`);
          logger.info(`Attempting to reconnect ${instance.name}`);
        } catch (reconnectError) {
          logger.error(`Failed to reconnect ${instance.name}:`, reconnectError.message);
        }
      }
    } catch (error) {
      instance.status = 'error';
      logger.error(`Failed to check status for instance ${instance.name}:`, error.message);
    }
  }
};

const resetMessageCounts = () => {
  for (const instance of instances) {
    instance.messageCount = 0;
    logger.info(`Reset message count for instance ${instance.name}`);
  }
};

export const getNextAvailableInstance = async () => {
  const redis = process.env.SKIP_DB !== 'true' ? getRedisClient() : null;
  const rateLimit = parseInt(process.env.RATE_LIMIT_PER_INSTANCE || '500');
  
  let attempts = 0;
  while (attempts < instances.length) {
    const instance = instances[currentInstanceIndex];
    currentInstanceIndex = (currentInstanceIndex + 1) % instances.length;
    
    if (instance.status === 'connected' && instance.messageCount < rateLimit) {
      instance.messageCount++;
      instance.lastMessageTime = new Date();
      
      // Only update Redis stats if available
      if (process.env.SKIP_DB !== 'true' && redis) {
        await redis.hincrby('instance_stats', instance.name, 1);
      }
      
      return instance;
    }
    
    attempts++;
  }
  
  throw new Error('No available WhatsApp instances');
};

export const sendMessage = async (phoneNumber, message, instanceName = null, messageOptions = null) => {
  try {
    let instance;
    
    if (instanceName) {
      instance = instances.find(i => i.name === instanceName);
      if (!instance) {
        throw new Error(`Instance ${instanceName} not found`);
      }
    } else {
      instance = await getNextAvailableInstance();
    }
    
    // Formatar número para padrão brasileiro
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    
    let response;
    
    // Temporariamente desabilitando botões para evitar erros
    // TODO: Implementar formato correto de botões para Evolution API
    
    // Mensagem de texto simples (formato correto Evolution API)
    response = await instance.client.post('/message/sendText/' + instance.name, {
      number: formattedPhone,
      textMessage: {
        text: message
      }
    });
    
    // Log se havia botões planejados
    if (messageOptions?.buttons || messageOptions?.replyButtons) {
      logger.info('Buttons were planned but sent as text message to avoid API errors', {
        buttons: messageOptions.buttons,
        replyButtons: messageOptions.replyButtons
      });
    }
    
    logger.info(`Message sent successfully via ${instance.name} to ${phoneNumber}`, {
      hasButtons: !!(messageOptions?.buttons || messageOptions?.replyButtons)
    });
    
    return {
      success: true,
      instanceName: instance.name,
      messageId: response.data?.key?.id || response.data?.id,
      response: response.data
    };
  } catch (error) {
    logger.error('Failed to send message:', error);
    throw error;
  }
};

export const sendMessageWithMedia = async (phoneNumber, message, mediaUrl, instanceName = null) => {
  try {
    let instance;
    
    if (instanceName) {
      instance = instances.find(i => i.name === instanceName);
      if (!instance) {
        throw new Error(`Instance ${instanceName} not found`);
      }
    } else {
      instance = await getNextAvailableInstance();
    }
    
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    
    const response = await instance.client.post('/message/sendMedia/' + instance.name, {
      number: formattedPhone,
      mediaMessage: {
        mediatype: 'image',
        media: mediaUrl,
        caption: message
      }
    });
    
    logger.info(`Media message sent successfully via ${instance.name} to ${phoneNumber}`);
    return {
      success: true,
      instanceName: instance.name,
      messageId: response.data?.key?.id || response.data?.id,
      response: response.data
    };
  } catch (error) {
    logger.error('Failed to send media message:', error);
    throw error;
  }
};

export const getInstancesStatus = () => {
  return instances.map(instance => ({
    name: instance.name,
    status: instance.status,
    messageCount: instance.messageCount,
    lastMessageTime: instance.lastMessageTime
  }));
};

export const getQRCode = async (instanceName) => {
  try {
    const instance = instances.find(i => i.name === instanceName);
    if (!instance) {
      throw new Error(`Instance ${instanceName} not found`);
    }
    
    const response = await instance.client.get(`/instance/connect/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get QR code for ${instanceName}:`, error);
    throw error;
  }
};

export default {
  initializeWhatsAppInstances,
  sendMessage,
  sendMessageWithMedia,
  getNextAvailableInstance,
  getInstancesStatus,
  getQRCode
};