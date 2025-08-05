# Configuração Técnica - OracleWA

Documentação técnica completa incluindo webhooks, sistema anti-ban e configurações avançadas.

## 📋 Índice

1. [Configuração de Webhooks](#configuração-de-webhooks)
2. [Sistema Anti-Ban](#sistema-anti-ban)
3. [Rate Limiting](#rate-limiting)
4. [Variações de Mensagem](#variações-de-mensagem)
5. [Monitoramento e Logs](#monitoramento-e-logs)
6. [Segurança](#segurança)

---

## 🔗 Configuração de Webhooks

### Webhook WooCommerce → OracleWA

#### Endpoint Principal
```
URL: https://oraclewa-imperio-production.up.railway.app/webhook/order-expired
Method: POST
Headers:
  x-api-key: sk-imperio-7h8k9m2n3p4q5r6s
  Content-Type: application/json
```

#### Payload Esperado
```json
{
  "order_id": "12345",
  "customer": {
    "phone": "5511999999999",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "items": [
    {
      "name": "Produto X",
      "quantity": 2,
      "price": 99.90
    }
  ],
  "total": 199.80,
  "currency": "BRL",
  "expired_at": "2024-08-04T10:00:00Z"
}
```

### Webhook Evolution → OracleWA

#### Configuração no Evolution
```javascript
{
  "url": "https://oraclewa-imperio-production.up.railway.app/webhook/evolution",
  "webhook_by_events": false,
  "events": [
    "messages.upsert",
    "messages.update",
    "connection.update",
    "status.instance"
  ],
  "headers": {
    "x-api-key": "sk-imperio-7h8k9m2n3p4q5r6s"
  }
}
```

#### Eventos Processados
- `messages.upsert`: Nova mensagem recebida
- `connection.update`: Status da conexão WhatsApp
- `status.instance`: Status da instância

### Validação e Segurança

```javascript
// Middleware de autenticação
const API_KEY = process.env.API_KEY;

function validateWebhook(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized' 
    });
  }
  
  next();
}
```

---

## 🛡️ Sistema Anti-Ban

### Componentes Principais

#### 1. Warmup Manager
```javascript
// Configuração de aquecimento gradual
const WARMUP_PHASES = {
  day1: { limit: 20, delay: 120 },  // 2 min entre msgs
  day2: { limit: 30, delay: 90 },   // 1.5 min
  day3: { limit: 40, delay: 60 },   // 1 min
  day4: { limit: 50, delay: 45 },   // 45 seg
  day5: { limit: 60, delay: 30 },   // 30 seg
  day6: { limit: 70, delay: 30 },   
  day7: { limit: 80, delay: 30 }    // Capacidade total
};
```

#### 2. Rate Limiting
```javascript
// Limites por instância
const RATE_LIMITS = {
  perDay: 50,        // Máximo por dia
  perHour: 5,        // Máximo por hora
  perMinute: 1,      // Máximo por minuto
  cooldown: 86400    // 24h entre mensagens pro mesmo número
};
```

#### 3. Horário Comercial
```javascript
// TEMPORARIAMENTE DESABILITADO
// const BUSINESS_HOURS = {
//   start: 9,  // 9:00
//   end: 21    // 21:00
// };
```

#### 4. Typing Simulation
```javascript
// Simula digitação humana
const TYPING_DELAYS = {
  perChar: 50,      // 50ms por caractere
  minDelay: 2000,   // Mínimo 2 segundos
  maxDelay: 5000,   // Máximo 5 segundos
  variance: 0.3     // 30% de variação
};
```

### Implementação Completa

```javascript
class AntibanManager {
  async canSendMessage(instanceName, phoneNumber) {
    // 1. Verificar warmup
    const warmupOk = await this.checkWarmup(instanceName);
    if (!warmupOk) return false;
    
    // 2. Verificar rate limits
    const rateOk = await this.checkRateLimit(instanceName);
    if (!rateOk) return false;
    
    // 3. Verificar cooldown do destinatário
    const cooldownOk = await this.checkCooldown(phoneNumber);
    if (!cooldownOk) return false;
    
    // 4. Verificar horário comercial (DESABILITADO)
    // const businessOk = this.checkBusinessHours();
    // if (!businessOk) return false;
    
    return true;
  }
}
```

---

## ⏱️ Rate Limiting

### Redis Configuration
```javascript
// Cliente Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  keyPrefix: 'oraclewa:'
});

// Chaves utilizadas
const KEYS = {
  daily: (instance) => `rate:daily:${instance}`,
  hourly: (instance) => `rate:hourly:${instance}`,
  recipient: (phone) => `cooldown:${phone}`,
  warmup: (instance) => `warmup:${instance}`
};
```

### Implementação de Limites
```javascript
async checkRateLimit(instanceName) {
  const multi = redis.multi();
  
  // Verificar limite diário
  const dailyKey = `rate:daily:${instanceName}`;
  multi.incr(dailyKey);
  multi.expire(dailyKey, 86400); // 24h
  
  // Verificar limite por hora
  const hourlyKey = `rate:hourly:${instanceName}`;
  multi.incr(hourlyKey);
  multi.expire(hourlyKey, 3600); // 1h
  
  const results = await multi.exec();
  const dailyCount = results[0][1];
  const hourlyCount = results[2][1];
  
  return dailyCount <= LIMITS.daily && 
         hourlyCount <= LIMITS.hourly;
}
```

---

## 💬 Variações de Mensagem

### Templates Disponíveis

#### Pedido Expirado
```javascript
const variations = [
  {
    template: `Oi {{name}}! 👋 Percebi que você tinha interesse em {{productList}}. 
    Que tal finalizar sua compra? O carrinho ainda está disponível! 🛒`,
    weight: 33
  },
  {
    template: `Olá {{name}}! Seus itens favoritos ainda estão esperando:
    {{productList}}
    💰 Total: R$ {{total}}
    Finalize agora e garanta!`,
    weight: 33
  },
  {
    template: `{{name}}, não deixe escapar! 
    Você estava quase lá com {{productList}} no carrinho.
    Complete sua compra e aproveite! ✨`,
    weight: 34
  }
];
```

### Sistema de Seleção
```javascript
function selectVariation(variations) {
  const total = variations.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * total;
  
  for (const variation of variations) {
    random -= variation.weight;
    if (random <= 0) return variation;
  }
  
  return variations[0];
}
```

### Personalização Dinâmica
```javascript
function renderTemplate(template, data) {
  return template
    .replace(/{{name}}/g, data.name)
    .replace(/{{productList}}/g, formatProducts(data.products))
    .replace(/{{total}}/g, formatCurrency(data.total))
    .replace(/{{link}}/g, data.checkoutUrl);
}
```

---

## 📊 Monitoramento e Logs

### Sistema de Logs
```javascript
// Winston configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});
```

### Métricas Importantes
```javascript
// Métricas a monitorar
const METRICS = {
  messages_sent: 0,
  messages_failed: 0,
  webhooks_received: 0,
  rate_limit_hits: 0,
  warmup_blocks: 0,
  average_delay: 0
};

// Exemplo de tracking
logger.info('Message sent', {
  instance: 'imperio1',
  recipient: phoneNumber.slice(0, -4) + '****',
  delay: actualDelay,
  queueSize: queue.size,
  metrics: METRICS
});
```

### Dashboard de Status
```javascript
// Endpoint de status
app.get('/status', authenticate, async (req, res) => {
  const status = {
    instances: await getInstancesStatus(),
    queue: {
      size: messageQueue.size,
      processing: messageQueue.processing
    },
    limits: await getRateLimitStatus(),
    metrics: METRICS,
    uptime: process.uptime()
  };
  
  res.json(status);
});
```

---

## 🔒 Segurança

### Autenticação API
```javascript
// Headers obrigatórios
const requiredHeaders = {
  'x-api-key': process.env.API_KEY,
  'content-type': 'application/json'
};

// Rate limiting por IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de requests
  message: 'Too many requests'
});
```

### Validação de Dados
```javascript
// Schemas Joi
const messageSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^55\d{10,11}$/)
    .required(),
  message: Joi.string()
    .min(1)
    .max(4096)
    .required(),
  mediaUrl: Joi.string().uri().optional()
});

// Sanitização
function sanitizePhone(phone) {
  return phone.replace(/\D/g, '');
}
```

### Criptografia
```javascript
// Dados sensíveis
const crypto = require('crypto');

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
```

---

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
```bash
# Sistema
NODE_ENV=production
PORT=3000
API_KEY=sk-imperio-7h8k9m2n3p4q5r6s

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://:password@host:6379

# Evolution API
EVOLUTION_API_URL=https://evolution-api.com
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976

# Limites
DAILY_MESSAGE_LIMIT=50
HOURLY_MESSAGE_LIMIT=5
MESSAGE_DELAY_MIN=30
MESSAGE_DELAY_MAX=90

# Features
ENABLE_TYPING_SIMULATION=true
ENABLE_BUSINESS_HOURS=false
ENABLE_WARMUP=true
```

### Performance Tuning
```javascript
// Pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Bull Queue options
const queueOptions = {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
};
```

---

## 📝 Checklist de Configuração

- [ ] API Key configurada e segura
- [ ] Webhooks testados e validados
- [ ] Rate limits apropriados
- [ ] Sistema anti-ban ativo
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Backup automático
- [ ] SSL/HTTPS habilitado

---

**Última atualização**: 04/08/2025
**Versão**: 1.0.0