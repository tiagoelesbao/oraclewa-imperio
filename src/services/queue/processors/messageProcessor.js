import logger from '../../../utils/logger.js';
import { sendMessage } from '../../whatsapp/evolution-manager.js';
import TypingSimulator from '../../whatsapp/typing-simulator.js';

export const processMessage = async (job) => {
  const { phoneNumber, message, messageOptions, type, customerId, metadata } = job.data;
  
  try {
    logger.info(`🤖 Processing message with HUMAN SIMULATION`, {
      type,
      phoneNumber: phoneNumber.slice(0, -4) + '****',
      messageLength: message.length,
      hasButtons: !!(messageOptions?.buttons || messageOptions?.replyButtons)
    });
    
    // SIMULAÇÃO DE COMPORTAMENTO HUMANO
    const isTemplate = TypingSimulator.isTemplateMessage(message);
    const shouldSimulate = process.env.DISABLE_TYPING_SIMULATION !== 'true';
    
    if (shouldSimulate) {
      logger.info(`✍️ Iniciando simulação de digitação humana...`);
      await TypingSimulator.simulateTyping(message, phoneNumber);
    } else {
      logger.info(`⚡ Simulação desabilitada - enviando diretamente`);
    }
    
    let result;
    
    // Se há botões ou opções especiais, usar função apropriada
    if (messageOptions?.buttons || messageOptions?.replyButtons) {
      result = await sendMessage(phoneNumber, message, null, messageOptions);
    } else {
      result = await sendMessage(phoneNumber, message);
    }
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true') {
      // TODO: Re-enable when database is available
      logger.info('Skipping message log (SKIP_DB=true)');
    }
    
    logger.info(`Message sent successfully for job ${job.id}`);
    return result;
  } catch (error) {
    logger.error(`Failed to process message job ${job.id}:`, error);
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true') {
      // TODO: Re-enable when database is available
      logger.error('Skipping error log (SKIP_DB=true)');
    }
    
    throw error;
  }
};