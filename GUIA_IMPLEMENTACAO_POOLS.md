# 🚀 Guia de Implementação - Sistema de Pools

**Status Atual**: PAUSADO - Modo Emergencial Ativo  
**Situação**: 1 número operacional, pools não implementados  
**Próxima Ativação**: Após aquisição de 2-3 números adicionais  

## ⚠️ **SITUAÇÃO ATUAL (01/08/2025)**

- **Números ativos**: 1 (imperio1)
- **Pool system**: Código implementado mas inativo
- **Modo atual**: evolution-manager.js (número único)
- **Quando ativar**: Após ter 3+ números operacionais

## 📋 Checklist para Ativação (Quando tiver números)

### 1. Preparar 12 Números WhatsApp Business
```bash
# No servidor Evolution API
ssh root@94.130.149.151

# Criar as 12 instâncias
for i in {1..6}; do
  curl -X POST http://localhost:8080/instance/create \
    -H "apikey: Imperio2024@EvolutionSecure" \
    -H "Content-Type: application/json" \
    -d "{\"instanceName\": \"approved$i\", \"qrcode\": true}"
done

for i in {1..6}; do
  curl -X POST http://localhost:8080/instance/create \
    -H "apikey: Imperio2024@EvolutionSecure" \
    -H "Content-Type: application/json" \
    -d "{\"instanceName\": \"expired$i\", \"qrcode\": true}"
done
```

### 2. Atualizar Evolution Manager
```javascript
// src/services/whatsapp/evolution-manager.js
import poolManager from './pool-manager.js';

// Modificar initializeWhatsAppInstances
export const initializeWhatsAppInstances = async () => {
  // ... código existente ...
  
  // Após carregar instâncias, inicializar pool manager
  await poolManager.initialize(instances);
};

// Modificar sendMessage para usar pools
export const sendMessage = async (phoneNumber, message, messageType = null, messageOptions = null) => {
  // Usar pool manager ao invés de round-robin
  const instance = await poolManager.getInstanceForMessageType(messageType);
  
  // ... resto do código existente ...
};
```

### 3. Atualizar Webhook Controller
```javascript
// src/controllers/webhookController.js

// Passar tipo de mensagem para o sendMessage
await addMessageToQueue({
  phoneNumber: data.user.phone,
  message,
  messageOptions,
  type: 'order_paid', // ← IMPORTANTE: Identificar tipo
  messageType: 'order_paid', // ← Adicionar este campo
  // ... resto dos campos
});
```

### 4. Criar Endpoint de Status dos Pools
```javascript
// src/routes/instances.routes.js
import { Router } from 'express';
import poolManager from '../services/whatsapp/pool-manager.js';

const router = Router();

router.get('/pools/status', (req, res) => {
  const status = poolManager.getPoolsStatus();
  res.json(status);
});

export default router;
```

## 🔧 Configuração dos Números

### Fase 1: Aquecimento (Dia 1-7)
```
approved1, approved2, approved3 → ATIVOS (20-40 msgs/dia)
approved4, approved5, approved6 → AQUECIMENTO
expired1, expired2, expired3 → ATIVOS (20-40 msgs/dia)  
expired4, expired5, expired6 → AQUECIMENTO
```

### Fase 2: Produção (Dia 8+)
```
Pool Aprovadas: 3 ativos + 3 backup rotativos
Pool Expiradas: 3 ativos + 3 backup rotativos
Rotação: A cada 2 semanas
```

## 📊 Monitoramento

### Dashboard Temporário (CLI)
```bash
# Ver status dos pools
curl https://oraclewa-imperio-production.up.railway.app/api/instances/pools/status | jq

# Monitorar em tempo real
watch -n 5 'curl -s https://oraclewa-imperio-production.up.railway.app/api/instances/pools/status | jq'
```

### Alertas Críticos
```javascript
// Adicionar ao pool-manager.js
if (pool.active.length === 0) {
  // Enviar alerta urgente (email/SMS)
  logger.critical(`POOL ${poolType} SEM INSTÂNCIAS ATIVAS!`);
  // Implementar notificação
}
```

## 🚨 Plano de Contingência

### Se um pool ficar sem números:
1. Pool aprovadas usa números do pool expiradas temporariamente
2. Ativar números de backup imediatamente
3. Iniciar aquecimento de novos números
4. Reduzir volume temporariamente se necessário

### Se múltiplos bans simultâneos:
1. Pausar envios por 1h
2. Revisar últimas mensagens enviadas
3. Verificar se houve denúncias
4. Ajustar delays e limites
5. Retomar com 50% do volume

## 📈 KPIs para Acompanhar

### Diário:
- Taxa de entrega por pool
- Mensagens enviadas por número
- Health score médio
- Números em cada estado (active/warmup/cooldown)

### Semanal:
- Taxa de ban (target: < 5%)
- Custo por mensagem entregue
- Uptime dos pools
- Crescimento necessário de números

## 🎯 Metas Semana 1

1. **Dia 1**: 12 números criados e conectados
2. **Dia 2**: Pool manager integrado e testado
3. **Dia 3**: Monitoramento funcionando
4. **Dia 4-7**: Aquecimento gradual
5. **Dia 8**: Produção com volume total

## 💡 Dicas Importantes

1. **NUNCA** pule o aquecimento
2. **SEMPRE** mantenha 50% de números backup
3. **MONITORE** health scores diariamente
4. **PAUSE** ao primeiro sinal de problema
5. **DOCUMENTE** todos os incidentes

---

**Suporte**: Em caso de dúvidas na implementação, revisar:
- `/src/services/whatsapp/pool-manager.js`
- `/ESTRATEGIAS_ANTI_BAN.md`
- `/PLANEJAMENTO_ESTRATEGICO_ORACLEWA.md`