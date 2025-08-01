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
    
    // Escalonamento ULTRA CONSERVADOR: 20, 40, 80, 160, 320, 500, 600
    const warmupLimits = [20, 40, 80, 160, 320, 500, 600];
    
    if (daysSinceStart >= warmupLimits.length) {
      return 600; // Número totalmente aquecido - MODO ULTRA CONSERVADOR
    }
    
    return warmupLimits[daysSinceStart];
  }

  /**
   * Verifica se pode enviar mensagem baseado nos limites
   */
  async canSendMessage(instanceName) {
    // 🚨 PARADA DE EMERGÊNCIA
    if (process.env.EMERGENCY_STOP === 'true') {
      logger.error('🚨 SISTEMA PAUSADO - EMERGENCY_STOP ativado');
      return false;
    }
    
    if (!this.redis) return true; // Sem Redis, permitir sempre
    
    const now = new Date();
    const hour = now.getHours();
    
    // Verificar horário comercial (9h às 21h)
    if (hour < 9 || hour >= 21) {
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
    
    // Verificar limite por hora - ULTRA CONSERVADOR
    const hourlyKey = `hourly_count:${instanceName}:${now.toISOString().slice(0, 13)}`;
    const hourlyCount = parseInt(await this.redis.get(hourlyKey) || '0');
    
    // Limite ultra conservador: máximo 25 msgs/hora
    if (hourlyCount >= 25) {
      logger.warn(`🚨 Limite horário ULTRA CONSERVADOR atingido para ${instanceName}: ${hourlyCount}/25`);
      return false;
    }
    
    // Verificar se precisa de pausa após mensagens consecutivas
    const pauseKey = `needs_pause:${instanceName}`;
    const needsPause = await this.redis.get(pauseKey);
    
    if (needsPause) {
      const pauseTime = Date.now() - parseInt(needsPause);
      const PAUSE_DURATION = 300000; // 5 minutos
      
      if (pauseTime < PAUSE_DURATION) {
        const remainingPause = Math.ceil((PAUSE_DURATION - pauseTime) / 60000);
        logger.warn(`⏸️ Pausa após mensagens consecutivas: aguardando ${remainingPause} minutos`);
        return false;
      } else {
        // Pausa concluída, remover flag
        await this.redis.del(pauseKey);
        logger.info(`✅ Pausa concluída para ${instanceName}, retomando envios`);
      }
    }
    
    return true;
  }

  /**
   * Registra envio de mensagem + controle de consecutivas
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
    
    // CONTROLE DE MENSAGENS CONSECUTIVAS
    const consecutiveKey = `consecutive:${instanceName}`;
    const consecutiveCount = await this.redis.incr(consecutiveKey);
    await this.redis.expire(consecutiveKey, 1800); // Expira em 30 min
    
    logger.info(`📊 Mensagem ${consecutiveCount} consecutiva para ${instanceName}`);
    
    // Se atingir 5 mensagens consecutivas, marcar para pausa
    if (consecutiveCount >= 5) {
      const pauseKey = `needs_pause:${instanceName}`;
      await this.redis.set(pauseKey, Date.now().toString());
      await this.redis.expire(pauseKey, 1800); // 30 min
      
      logger.warn(`🛑 ${instanceName} precisa de pausa após ${consecutiveCount} mensagens consecutivas`);
      
      // Reset contador para próximo ciclo
      await this.redis.del(consecutiveKey);
    }
    
    // Registrar última mensagem enviada
    await this.redis.set(`last_message:${instanceName}`, Date.now().toString());
  }

  /**
   * Obtém delay recomendado entre mensagens - MODO ULTRA CONSERVADOR
   */
  async getRecommendedDelay(instanceName) {
    // MODO ULTRA CONSERVADOR: 1 número + alto volume = delays rigorosos
    const MIN_DELAY = 60000;  // 1 minuto mínimo
    const MAX_DELAY = 120000; // 2 minutos máximo
    
    if (!this.redis) return MIN_DELAY;
    
    const lastMessageTime = await this.redis.get(`last_message:${instanceName}`);
    if (!lastMessageTime) {
      logger.info('🛡️ Primeiro envio do dia - delay conservador aplicado');
      return MIN_DELAY;
    }
    
    const timeSinceLastMessage = Date.now() - parseInt(lastMessageTime);
    
    // Se passou menos de 1 minuto, aguardar o tempo restante + extra
    if (timeSinceLastMessage < MIN_DELAY) {
      const remainingTime = MIN_DELAY - timeSinceLastMessage;
      const extraSafety = Math.random() * 30000; // 0-30s extra por segurança
      
      logger.warn(`⏱️ Delay de segurança: aguardando ${Math.round((remainingTime + extraSafety) / 1000)}s`);
      return remainingTime + extraSafety;
    }
    
    // Delay aleatório entre 1-2 minutos
    const randomDelay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    logger.info(`⏰ Delay aplicado: ${Math.round(randomDelay / 1000)}s (modo ultra conservador)`);
    
    return randomDelay;
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