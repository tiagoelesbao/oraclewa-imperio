# 🛡️ Estratégias Anti-Ban WhatsApp Business

## 📊 Implementações Realizadas

### 1. **Sistema de Aquecimento de Números (Warmup)**
- **7 dias de aquecimento gradual** para números novos
- Escalonamento: 20 → 40 → 80 → 160 → 320 → 640 → 1000 msgs/dia
- Rastreamento automático do período de aquecimento

### 2. **Rate Limiting Inteligente**
- **Limite diário**: 1000 mensagens (número aquecido)
- **Limite horário**: 60 mensagens/hora
- **Delay entre mensagens**: 15-45 segundos (aleatório)
- **Horário comercial**: 9h às 20h apenas

### 3. **Controle de Destinatários**
- **Cooldown de 24h** entre campanhas para mesmo número
- Evita spam repetitivo para mesmos contatos
- Registro de último contato com cada destinatário

### 4. **Variação de Mensagens**
- 3 variações para cada tipo de mensagem
- 70% de chance de usar variação (30% template padrão)
- Evita detecção de padrões repetitivos

### 5. **Load Balancing**
- Distribuição automática entre múltiplas instâncias
- Monitoramento de status de conexão
- Reconexão automática em caso de desconexão

## 🚀 Como Usar

### Verificar Status dos Números
```bash
curl https://oraclewa-imperio-production.up.railway.app/api/instances/status
```

### Monitorar Webhooks
```bash
curl https://oraclewa-imperio-production.up.railway.app/api/webhook/status
```

## ⚙️ Configurações Recomendadas

### Variáveis de Ambiente
```env
# Limites conservadores para evitar bans
RATE_LIMIT_PER_INSTANCE=500
DELAY_BETWEEN_MESSAGES=30000
BUSINESS_HOURS_START=9
BUSINESS_HOURS_END=20
```

## 📋 Boas Práticas

1. **Números Novos**
   - Sempre iniciar com período de aquecimento
   - Enviar mensagens para contatos que interagem
   - Aumentar volume gradualmente

2. **Conteúdo das Mensagens**
   - Evitar links encurtados
   - Não usar palavras suspeitas (grátis, promoção em excesso)
   - Personalizar com nome do cliente

3. **Timing**
   - Respeitar horário comercial
   - Evitar envios em massa simultâneos
   - Distribuir ao longo do dia

4. **Monitoramento**
   - Verificar logs diariamente
   - Observar taxa de entrega
   - Parar imediatamente se houver bloqueios

## 🔴 Sinais de Alerta

- Status "connecting" persistente
- Mensagens não sendo entregues
- Erro de autenticação
- Múltiplos contatos reportando não recebimento

## 🆘 Em Caso de Ban

1. **Não tente reconectar imediatamente**
2. **Aguarde 24-48h antes de nova tentativa**
3. **Use novo número com aquecimento completo**
4. **Revise práticas de envio**

## 📈 Métricas de Sucesso

- Taxa de entrega > 95%
- Sem bans por > 30 dias
- Resposta de clientes > 10%
- Uptime das instâncias > 99%