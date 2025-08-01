import logger from '../../../utils/logger.js';
import { sendMessage } from '../../whatsapp/evolution-manager.js';
import { createMessageLog } from '../../../database/models/MessageLog.js';

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
    
    await createMessageLog({
      phoneNumber,
      message,
      type,
      customerId,
      status: 'sent',
      instanceId: result.instanceName,
      messageId: result.messageId,
      metadata: {
        ...metadata,
        jobId: job.id,
        attempts: job.attemptsMade,
        messageOptions
      }
    });
    
    logger.info(`Message sent successfully for job ${job.id}`);
    return result;
  } catch (error) {
    logger.error(`Failed to process message job ${job.id}:`, error);
    
    await createMessageLog({
      phoneNumber,
      message,
      type,
      customerId,
      status: 'failed',
      error: error.message,
      metadata: {
        ...metadata,
        jobId: job.id,
        attempts: job.attemptsMade,
        messageOptions
      }
    });
    
    throw error;
  }
};