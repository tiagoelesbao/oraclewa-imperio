import logger from '../../../utils/logger.js';
import { sendMessage } from '../../whatsapp/evolution-manager.js';

export const processMessage = async (job) => {
  const { phoneNumber, message, messageOptions, type, customerId, metadata } = job.data;
  
  try {
    logger.info(`Processing message job ${job.id}`, {
      type,
      phoneNumber: phoneNumber.slice(0, -4) + '****',
      hasButtons: !!(messageOptions?.buttons || messageOptions?.replyButtons)
    });
    
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