import logger from '../../utils/logger.js';
import { getRedisClient } from '../redis/client.js';

export class WhatsAppWarmupManager {
  constructor() {
    this.redis = process.env.SKIP_DB !== 'true' ? getRedisClient() : null;
  }

  /**
   * Verifica se um número está em período de aquecimento
   */
  async isNumberInWarmup(instanceName) {
    if (!this.redis) return false;
    
    const warmupKey = `warmup:${instanceName}`;
    const startDate = await this.redis.get(warmupKey);
    
    if (!startDate) return false;
    
    const daysSinceStart = Math.floor((Date.now() - parseInt(startDate)) / (1000 * 60 * 60 * 24));
    return daysSinceStart < 7;
  }

  /**
   * Obtém o limite diário baseado no período de aquecimento
   */
  async getDailyLimit(instanceName) {
    if (!this.redis) return 1000; // Limite padrão se não tiver Redis
    
    const warmupKey = `warmup:${instanceName}`;
    const startDate = await this.redis.get(warmupKey);
    
    if (!startDate) {
      // Primeira vez usando o número - iniciar aquecimento
      await this.redis.set(warmupKey, Date.now().toString());
      return 20; // Primeiro dia
    }
    
    const daysSinceStart = Math.floor((Date.now() - parseInt(startDate)) / (1000 * 60 * 60 * 24));
    
    // Escalonamento gradual: 20, 40, 80, 160, 320, 640, 1000
    const warmupLimits = [20, 40, 80, 160, 320, 640, 1000];
    
    if (daysSinceStart >= warmupLimits.length) {
      return 1000; // Número totalmente aquecido
    }
    
    return warmupLimits[daysSinceStart];
  }

  /**
   * Verifica se pode enviar mensagem baseado nos limites
   */
  async canSendMessage(instanceName) {
    if (!this.redis) return true; // Sem Redis, permitir sempre
    
    const now = new Date();
    const hour = now.getHours();
    
    // Verificar horário comercial (9h às 20h)
    if (hour < 9 || hour >= 20) {
      logger.warn(`Fora do horário comercial: ${hour}h`);
      return false;
    }
    
    // Verificar limite diário
    const dailyKey = `daily_count:${instanceName}:${now.toISOString().split('T')[0]}`;
    const dailyCount = parseInt(await this.redis.get(dailyKey) || '0');
    const dailyLimit = await this.getDailyLimit(instanceName);
    
    if (dailyCount >= dailyLimit) {
      logger.warn(`Limite diário atingido para ${instanceName}: ${dailyCount}/${dailyLimit}`);
      return false;
    }
    
    // Verificar limite por hora
    const hourlyKey = `hourly_count:${instanceName}:${now.toISOString().slice(0, 13)}`;
    const hourlyCount = parseInt(await this.redis.get(hourlyKey) || '0');
    
    if (hourlyCount >= 60) {
      logger.warn(`Limite horário atingido para ${instanceName}: ${hourlyCount}/60`);
      return false;
    }
    
    return true;
  }

  /**
   * Registra envio de mensagem
   */
  async recordMessageSent(instanceName) {
    if (!this.redis) return;
    
    const now = new Date();
    
    // Incrementar contador diário
    const dailyKey = `daily_count:${instanceName}:${now.toISOString().split('T')[0]}`;
    await this.redis.incr(dailyKey);
    await this.redis.expire(dailyKey, 86400); // Expirar em 24h
    
    // Incrementar contador horário
    const hourlyKey = `hourly_count:${instanceName}:${now.toISOString().slice(0, 13)}`;
    await this.redis.incr(hourlyKey);
    await this.redis.expire(hourlyKey, 3600); // Expirar em 1h
    
    // Registrar última mensagem enviada
    await this.redis.set(`last_message:${instanceName}`, Date.now().toString());
  }

  /**
   * Obtém delay recomendado entre mensagens
   */
  async getRecommendedDelay(instanceName) {
    if (!this.redis) return 15000; // 15 segundos padrão
    
    const lastMessageTime = await this.redis.get(`last_message:${instanceName}`);
    if (!lastMessageTime) return 15000;
    
    const timeSinceLastMessage = Date.now() - parseInt(lastMessageTime);
    
    // Se passou menos de 15 segundos, aguardar mais
    if (timeSinceLastMessage < 15000) {
      return 15000 - timeSinceLastMessage + Math.random() * 30000; // 15-45 segundos
    }
    
    // Delay aleatório entre 15-45 segundos
    return 15000 + Math.random() * 30000;
  }

  /**
   * Verifica se pode enviar para um número específico
   */
  async canMessageRecipient(phoneNumber) {
    if (!this.redis) return true;
    
    const recipientKey = `recipient:${phoneNumber}`;
    const lastContact = await this.redis.get(recipientKey);
    
    if (!lastContact) return true;
    
    // Não enviar mais de 1 campanha por dia para o mesmo número
    const hoursSinceLastContact = (Date.now() - parseInt(lastContact)) / (1000 * 60 * 60);
    
    if (hoursSinceLastContact < 24) {
      logger.warn(`Número ${phoneNumber} contactado há menos de 24h`);
      return false;
    }
    
    return true;
  }

  /**
   * Registra contato com destinatário
   */
  async recordRecipientContact(phoneNumber) {
    if (!this.redis) return;
    
    const recipientKey = `recipient:${phoneNumber}`;
    await this.redis.set(recipientKey, Date.now().toString());
    await this.redis.expire(recipientKey, 86400); // Expirar em 24h
  }
}

export default new WhatsAppWarmupManager();