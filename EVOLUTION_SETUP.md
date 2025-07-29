# 🤖 Evolution API - Configuração Completa

## 🎯 Melhor Estratégia: Evolution API no Railway

### Por que Railway para Evolution API?
- ✅ Suporte nativo ao Docker
- ✅ PostgreSQL e Redis inclusos
- ✅ SSL automático (HTTPS)
- ✅ Deploy simples
- ✅ Monitoramento integrado

## 📋 Passo a Passo - 4 Instâncias Evolution

### 1. Preparação Inicial

Você precisará criar **4 projetos separados** no Railway:
- `oraclewa-evolution-1`
- `oraclewa-evolution-2`
- `oraclewa-evolution-3`
- `oraclewa-evolution-4`

### 2. Configuração de Cada Instância

Para **cada instância**, siga:

#### 2.1. Criar Projeto no Railway
1. Acesse https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Ou "Empty Project" para usar Docker

#### 2.2. Configurar Docker (Método Recomendado)

Crie um repositório para cada instância com:

**Dockerfile** (para instância 1):
```dockerfile
FROM atendai/evolution-api:latest

# Variáveis de ambiente serão configuradas no Railway
ENV PORT=8080
```

**docker-compose.yml** (referência local):
```yaml
version: '3.8'
services:
  evolution:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - DATABASE_PROVIDER=postgresql
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_ENABLED=true
      - REDIS_URI=${REDIS_URL}
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
      - INSTANCE_NAME=${INSTANCE_NAME}
      - DEL_INSTANCE=false
      - DEL_TEMP_INSTANCES=true
      - WEBSOCKET_ENABLED=true
      - WEBHOOK_GLOBAL_URL=${WEBHOOK_URL}
      - WEBHOOK_GLOBAL_ENABLED=true
```

### 3. Variáveis de Ambiente (Para cada instância)

No Railway Dashboard de cada projeto, configure:

#### Instância 1:
```env
# Database (PostgreSQL addon do Railway)
DATABASE_PROVIDER=postgresql
DATABASE_URL=${DATABASE_URL}

# Redis (Redis addon do Railway)
REDIS_ENABLED=true
REDIS_URI=${REDIS_URL}

# Authentication
AUTHENTICATION_API_KEY=EVO_INST_1_1735590847

# Instance Config
INSTANCE_NAME=instance-1
PORT=8080

# Webhooks (opcional)
WEBHOOK_GLOBAL_ENABLED=false

# Features
DEL_INSTANCE=false
DEL_TEMP_INSTANCES=true
WEBSOCKET_ENABLED=true

# CORS
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE
CORS_CREDENTIALS=true
```

#### Instância 2, 3, 4:
- Mesma configuração, alterando apenas:
  - `AUTHENTICATION_API_KEY` (usar chaves únicas)
  - `INSTANCE_NAME` (instance-2, instance-3, instance-4)

### 4. Adicionais Necessários em Cada Projeto

Para cada projeto Evolution no Railway:

1. **Adicionar PostgreSQL**:
   - No dashboard → "Add PostgreSQL"
   - Automaticamente configura `DATABASE_URL`

2. **Adicionar Redis**:
   - No dashboard → "Add Redis" 
   - Automaticamente configura `REDIS_URL`

3. **Deploy**:
   - Conectar repositório GitHub ou usar "Deploy from Docker"
   - Railway faz deploy automático

### 5. URLs Geradas

Após deploy, você terá 4 URLs como:
```
https://oraclewa-evolution-1-production.railway.app
https://oraclewa-evolution-2-production.railway.app  
https://oraclewa-evolution-3-production.railway.app
https://oraclewa-evolution-4-production.railway.app
```

### 6. Configurar no OracleWA Principal

No seu projeto principal (OracleWA), configure o `.env`:

```env
# Evolution API URLs (Railway)
EVOLUTION_API_URL=https://oraclewa-evolution
EVOLUTION_INSTANCE_1_PORT=443
EVOLUTION_INSTANCE_2_PORT=443
EVOLUTION_INSTANCE_3_PORT=443
EVOLUTION_INSTANCE_4_PORT=443

# URLs completas (para o código)
EVOLUTION_INSTANCE_1_URL=https://oraclewa-evolution-1-production.railway.app
EVOLUTION_INSTANCE_2_URL=https://oraclewa-evolution-2-production.railway.app
EVOLUTION_INSTANCE_3_URL=https://oraclewa-evolution-3-production.railway.app
EVOLUTION_INSTANCE_4_URL=https://oraclewa-evolution-4-production.railway.app

# Chaves da Evolution (usar as mesmas configuradas em cada instância)
EVOLUTION_API_KEY_1=EVO_INST_1_1735590847
EVOLUTION_API_KEY_2=EVO_INST_2_1735590848
EVOLUTION_API_KEY_3=EVO_INST_3_1735590849
EVOLUTION_API_KEY_4=EVO_INST_4_1735590850
```

## 🔧 Alternativa: Evolution API Cloud (Mais Simples)

Se preferir não gerenciar as instâncias:

### Opção 1: Z-API
- Site: https://z-api.io
- Gratuito: 2000 mensagens/mês
- Fácil configuração

### Opção 2: Chat-API  
- Site: https://chat-api.com
- Trial gratuito
- API compatível

### Opção 3: WhatsApp Business API Official
- Mais complexo
- Requer aprovação Facebook
- Para grandes volumes

## 🔍 Teste das Instâncias

Após configurar, teste cada instância:

```bash
# Teste de conectividade
curl https://oraclewa-evolution-1-production.railway.app/instance/connectionState \
  -H "apikey: EVO_INST_1_1735590847"

# Gerar QR Code
curl https://oraclewa-evolution-1-production.railway.app/instance/connect \
  -H "apikey: EVO_INST_1_1735590847"

# Enviar mensagem de teste
curl -X POST https://oraclewa-evolution-1-production.railway.app/message/sendText \
  -H "apikey: EVO_INST_1_1735590847" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Teste OracleWA"
  }'
```

## 🔐 Segurança das Instâncias

### 1. Chaves Únicas
- Cada instância deve ter uma `AUTHENTICATION_API_KEY` única
- Nunca reutilizar chaves

### 2. CORS Restrito (Produção)
```env
CORS_ORIGIN=https://sua-app-principal.railway.app
```

### 3. Webhook Seguro (se usar)
```env
WEBHOOK_GLOBAL_URL=https://sua-app.railway.app/api/evolution/webhook
WEBHOOK_GLOBAL_ENABLED=true
```

## 📊 Monitoramento

### 1. Health Check
Cada instância terá endpoint:
```
GET /instance/connectionState
```

### 2. Logs no Railway
- Dashboard → Deployments → View Logs

### 3. Métricas
- CPU/Memory usage no Railway dashboard

## 💰 Custos Railway

**Estimativa para 4 instâncias Evolution:**
- Cada instância: ~$1-2/mês
- PostgreSQL: Incluído no plano
- Redis: Incluído no plano
- **Total**: ~$4-8/mês para todas as instâncias

**Plano gratuito Railway:**
- $5 de crédito mensal
- Suficiente para 2-3 instâncias pequenas

## 🚨 Troubleshooting

### Instância não conecta
1. Verificar `DATABASE_URL` e `REDIS_URL`
2. Conferir `AUTHENTICATION_API_KEY`
3. Logs no Railway dashboard

### QR Code não gera
1. Instância deve estar "open" 
2. Verificar se não há sessão ativa
3. Restart da instância

### Mensagem não envia
1. WhatsApp deve estar conectado
2. Verificar rate limits
3. Conferir número formatado

## 📋 Checklist Final

- [ ] 4 projetos Evolution criados no Railway
- [ ] PostgreSQL e Redis adicionados em cada
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URLs funcionando (teste de conectividade)
- [ ] Chaves configuradas no OracleWA principal
- [ ] QR Codes gerados para cada instância
- [ ] WhatsApp conectado em cada instância
- [ ] Teste de envio funcionando

Agora suas 4 instâncias Evolution estarão funcionando na nuvem! 🚀