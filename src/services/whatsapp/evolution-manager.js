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
    const instanceNames = ['imperio_1', 'imperio_2', 'imperio_3', 'imperio_4'];
    
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
  const redis = getRedisClient();
  const rateLimit = parseInt(process.env.RATE_LIMIT_PER_INSTANCE || '500');
  
  let attempts = 0;
  while (attempts < instances.length) {
    const instance = instances[currentInstanceIndex];
    currentInstanceIndex = (currentInstanceIndex + 1) % instances.length;
    
    if (instance.status === 'connected' && instance.messageCount < rateLimit) {
      instance.messageCount++;
      instance.lastMessageTime = new Date();
      
      await redis.hincrby('instance_stats', instance.name, 1);
      
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
    
    const numberWithDomain = formattedPhone + '@s.whatsapp.net';
    let response;
    
    // Verificar se há botões ou opções especiais
    if (messageOptions?.buttons || messageOptions?.replyButtons) {
      // Preparar payload para mensagem com botões
      const buttonPayload = {
        number: numberWithDomain,
        delay: 1000
      };
      
      if (messageOptions.buttons) {
        // Botões de ação (copy, url)
        const buttons = [];
        
        for (const button of messageOptions.buttons) {
          if (button.type === 'copy' && button.copyCode) {
            buttons.push({
              buttonId: 'copy_pix',
              buttonText: { displayText: 'Copiar PIX' },
              type: 1
            });
          } else if (button.type === 'url' && button.url) {
            buttons.push({
              buttonId: 'access_site',
              buttonText: { displayText: button.displayText || 'Acessar Site' },
              type: 1
            });
          }
        }
        
        buttonPayload.buttonMessage = {
          text: message,
          buttons: buttons,
          headerType: 1
        };
        
        response = await instance.client.post('/message/sendButtons/' + instance.name, buttonPayload);
      } else if (messageOptions.replyButtons) {
        // Botões de resposta rápida
        const replyButtons = messageOptions.replyButtons.map(btn => ({
          buttonId: btn.id,
          buttonText: { displayText: btn.title },
          type: 1
        }));
        
        buttonPayload.buttonMessage = {
          text: message,
          buttons: replyButtons,
          headerType: 1
        };
        
        response = await instance.client.post('/message/sendButtons/' + instance.name, buttonPayload);
      }
    } else {
      // Mensagem de texto simples
      response = await instance.client.post('/message/sendText/' + instance.name, {
        number: numberWithDomain,
        text: message,
        delay: 1000
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
      number: formattedPhone + '@s.whatsapp.net',
      mediatype: 'image',
      media: mediaUrl,
      caption: message,
      delay: 1000
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