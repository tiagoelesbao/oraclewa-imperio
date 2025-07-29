import logger from '../../../utils/logger.js';
import { sendMessage } from '../../whatsapp/manager.js';
import { createMessageLog } from '../../../database/models/MessageLog.js';

export const processMessage = async (job) => {
  const { phoneNumber, message, type, customerId, metadata } = job.data;
  
  try {
    logger.info(`Processing message job ${job.id}`, {
      type,
      phoneNumber: phoneNumber.slice(0, -4) + '****'
    });
    
    const result = await sendMessage(phoneNumber, message);
    
    await createMessageLog({
      phoneNumber,
      message,
      type,
      customerId,
      status: 'sent',
      instanceId: result.instanceId,
      messageId: result.messageId,
      metadata: {
        ...metadata,
        jobId: job.id,
        attempts: job.attemptsMade
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
        attempts: job.attemptsMade
      }
    });
    
    throw error;
  }
};