# 🚀 Broadcast API Reference

## Visão Geral

O módulo Broadcast permite envio de mensagens interativas com botões através da integração ZAPI, complementando o sistema core (Baileys) com funcionalidades avançadas de campanhas e automação.

**Base URL:** `/api/broadcast`

## 📋 Endpoints Disponíveis

### 1. Enviar Mensagem Individual

**POST** `/api/broadcast/send`

Envia uma mensagem individual com botões interativos opcionais.

#### Headers
```http
Content-Type: application/json
X-API-Key: your-api-key (opcional)
```

#### Body
```json
{
  "phone": "5511999999999",
  "message": "🏆 Participe do sorteio Império Premiações!\n\n💰 Prêmio: R$ 170.000,00\n🎯 Sorteio pela Loteria Federal",
  "buttons": [
    {
      "id": "buy_now",
      "title": "🛒 Comprar Agora",
      "type": "reply"
    },
    {
      "id": "more_info", 
      "title": "📋 Mais Informações",
      "type": "reply"
    }
  ]
}
```

#### Resposta
```json
{
  "success": true,
  "messageId": "msg_12345",
  "provider": "zapi",
  "hasButtons": true
}
```

---

### 2. Enviar Broadcast (Múltiplos Destinatários)

**POST** `/api/broadcast/campaign`

Envia mensagens para múltiplos destinatários com controle de lote e rate limiting.

#### Body
```json
{
  "phones": [
    "5511999999999",
    "5511888888888",
    "5511777777777"
  ],
  "message": "🎉 PROMOÇÃO ESPECIAL IMPÉRIO!\n\n🏆 R$ 170.000 em prêmios\n⏰ Últimas vagas!",
  "buttons": [
    {
      "id": "join_now",
      "title": "✅ Participar",
      "type": "reply"
    },
    {
      "id": "join_community",
      "title": "👥 Entrar no Grupo",
      "type": "reply"
    }
  ],
  "options": {
    "delay": 2000,
    "batchSize": 15
  }
}
```

#### Resposta
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "validPhones": 3,
    "invalidPhones": 0,
    "sent": 3,
    "failed": 0
  },
  "invalidPhones": [],
  "provider": "zapi",
  "hasButtons": true
}
```

---

### 3. Enviar Template

**POST** `/api/broadcast/template`

Envia mensagem usando templates pré-definidos com substituição de variáveis.

#### Body
```json
{
  "phone": "5511999999999",
  "template": "promotional",
  "data": {
    "userName": "João",
    "availableQuotas": "150",
    "promotionDetails": "🎯 3 cotas por apenas R$ 25,00\n🔥 Desconto especial de 50%"
  }
}
```

#### Resposta
```json
{
  "success": true,
  "messageId": "msg_67890",
  "template": "promotional",
  "provider": "zapi"
}
```

---

### 4. Listar Templates

**GET** `/api/broadcast/templates`

Lista todos os templates disponíveis para uso.

#### Resposta
```json
{
  "success": true,
  "templates": [
    {
      "id": "promotional",
      "name": "Campanha Promocional",
      "hasButtons": true,
      "buttonCount": 3
    },
    {
      "id": "winner_announcement", 
      "name": "Anúncio de Ganhador",
      "hasButtons": true,
      "buttonCount": 3
    },
    {
      "id": "abandoned_cart",
      "name": "Recuperação de Carrinho",
      "hasButtons": true,
      "buttonCount": 3
    }
  ],
  "count": 6
}
```

---

### 5. Status da Conexão

**GET** `/api/broadcast/status`

Verifica o status da conexão ZAPI e saúde do módulo.

#### Resposta
```json
{
  "success": true,
  "status": {
    "connected": true,
    "provider": "zapi",
    "status": "open",
    "phone": "5511999999999"
  },
  "provider": "zapi",
  "timestamp": "2024-12-08T15:30:00.000Z"
}
```

---

### 6. Webhook Handler

**POST** `/api/broadcast/webhook`

Processa webhooks do ZAPI para cliques em botões e respostas.

#### Body (Exemplo de clique em botão)
```json
{
  "data": {
    "message": {
      "buttonsResponseMessage": {
        "selectedButtonId": "buy_now"
      }
    },
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    }
  }
}
```

#### Resposta
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

### 7. Health Check

**GET** `/api/broadcast/health`

Verifica se o módulo está funcionando.

#### Resposta
```json
{
  "success": true,
  "module": "broadcast",
  "provider": "zapi",
  "timestamp": "2024-12-08T15:30:00.000Z"
}
```

---

## 📝 Templates Disponíveis

### 1. **promotional** - Campanha Promocional
- **Variáveis:** `userName`, `availableQuotas`, `promotionDetails`
- **Botões:** Comprar Agora, Mais Informações, Entrar no Grupo

### 2. **winner_announcement** - Anúncio de Ganhador
- **Variáveis:** `winnerName`, `prizeAmount`, `contestName`, `drawDate`, `nextContestName`, `nextPrizeAmount`
- **Botões:** Participar do Próximo, Ver Comprovante, Parabenizar

### 3. **new_contest** - Novo Sorteio Disponível
- **Variáveis:** `contestName`, `prizeAmount`, `drawDate`, `totalQuotas`, `quotaPrice`, `saleStartDate`, `saleStartTime`
- **Botões:** Reservar Cota, Ver Regulamento, Lembrete de Início

### 4. **abandoned_cart** - Recuperação de Carrinho
- **Variáveis:** `userName`, `cartItems`, `cartTotal`, `expirationTime`
- **Botões:** Finalizar Compra, Modificar Carrinho, Limpar Carrinho

### 5. **vip_invite** - Convite VIP
- **Variáveis:** `userName`, `vipSlots`
- **Botões:** Aceitar Convite VIP, Ver Todos Benefícios, Talvez Mais Tarde

### 6. **contest_reminder** - Lembrete de Sorteio
- **Variáveis:** `contestName`, `drawDate`, `drawTime`, `prizeAmount`, `userQuotas`, `liveStreamLink`
- **Botões:** Comprar Mais Cotas, Assistir ao Vivo, Compartilhar Sorte

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# ZAPI Configuration
ZAPI_API_URL=https://api.z-api.io
ZAPI_TOKEN=your-zapi-token-here
ZAPI_INSTANCE_ID=your-instance-id-here

# Module Settings
BROADCAST_MODULE_ENABLED=true
BROADCAST_API_KEY=your-broadcast-api-key-here

# Rate Limiting
BROADCAST_RATE_LIMIT_REQUESTS=30
BROADCAST_RATE_LIMIT_WINDOW=60000
```

---

## 🎯 Ações Automáticas de Botões

O sistema processa automaticamente cliques nos seguintes botões:

### **buy_now**
```
🛒 Redirecionando você para a compra...

https://imperiopremioss.com/campanha/rapidinha-r-20000000-em-premiacoes?&afiliado=A0RJJ5L1QK
```

### **more_info**
```
📋 INFORMAÇÕES DETALHADAS

🏆 Prêmio: R$ 170.000,00
🎯 Sorteio: Loteria Federal
📅 Data: Em breve

📞 Dúvidas? Responda esta mensagem!
```

### **join_community**
```
👥 COMUNIDADE VIP IMPÉRIO

🔗 Entre no nosso grupo:
https://chat.whatsapp.com/EsOryU1oONNII64AAOz6TF

✨ Novidades em primeira mão!
```

### **complete_purchase**
```
✅ FINALIZAR COMPRA

🔗 Complete sua compra agora:
https://imperiopremioss.com/checkout

⏰ Não perca suas cotas!
```

---

## 📊 Rate Limiting

- **Limite padrão:** 30 requisições por minuto por IP
- **Headers de resposta:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Resposta 429:** Quando limite excedido

---

## ❌ Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Phone number is required",
  "field": "phone"
}
```

### 401 - Unauthorized
```json
{
  "error": "API key is required",
  "header": "x-api-key"
}
```

### 429 - Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "limit": 30,
  "windowMs": 60000,
  "retryAfter": 45
}
```

### 500 - Internal Server Error
```json
{
  "error": "Failed to send message",
  "details": "ZAPI connection timeout"
}
```

---

## 🔄 Integração com Sistema Core

O módulo broadcast complementa o sistema core (Baileys):

- **Core (Baileys):** Mensagens de recuperação automática
- **Broadcast (ZAPI):** Campanhas promocionais com botões
- **Fallback:** Sistema core continua funcionando independentemente

---

## 📞 Suporte

Para dúvidas e suporte técnico sobre o módulo Broadcast:

- **Logs:** Verificar logs da aplicação
- **Status:** Endpoint `/api/broadcast/status`  
- **Health:** Endpoint `/api/broadcast/health`
- **Configuração:** Arquivo `.env.broadcast.example`

---

*📅 Documentação atualizada: Dezembro 2024*
*🏆 Império Premiações - Sistema OracleWA v2.0*