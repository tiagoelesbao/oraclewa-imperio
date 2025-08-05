# 🚀 Guia Completo de Deploy - OracleWA

## 🌐 Melhores Servidores Gratuitos (2024)

### 1. **Railway.app** ⭐ RECOMENDADO
- **Vantagens**: Melhor para aplicações Node.js + Docker, PostgreSQL grátis, fácil deploy
- **Limites**: $5/mês de crédito (suficiente para uso moderado)
- **Domínio**: Subdomínio grátis (.railway.app)

### 2. **Render.com** 
- **Vantagens**: PostgreSQL grátis, boa performance, fácil configuração
- **Limites**: 750 horas/mês (suficiente), hiberna após inatividade
- **Domínio**: Subdomínio grátis (.onrender.com)

### 3. **Fly.io**
- **Vantagens**: Excelente performance, múltiplas regiões
- **Limites**: 3 aplicações pequenas grátis
- **Domínio**: Subdomínio grátis (.fly.dev)

## 🔧 Deploy no Railway (Recomendado)

### Passo 1: Preparar o Projeto

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Login com GitHub

2. **Criar arquivo railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "node src/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Passo 2: Configurar Variáveis de Ambiente

No Railway Dashboard, adicione:

```env
# Aplicação
NODE_ENV=production
APP_PORT=3000

# Database (Railway PostgreSQL)
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASS=${PGPASSWORD}

# Redis (Railway Redis)
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}

# Evolution API (usar URLs Railway)
EVOLUTION_API_URL=https://evolution-1.railway.app
EVOLUTION_INSTANCE_1_PORT=443
EVOLUTION_INSTANCE_2_PORT=443
EVOLUTION_INSTANCE_3_PORT=443
EVOLUTION_INSTANCE_4_PORT=443

# Chaves Evolution (gerar no painel)
EVOLUTION_API_KEY_1=sua-chave-evolution-1
EVOLUTION_API_KEY_2=sua-chave-evolution-2
EVOLUTION_API_KEY_3=sua-chave-evolution-3
EVOLUTION_API_KEY_4=sua-chave-evolution-4

# Segurança
WEBHOOK_SECRET=seu-webhook-secret-super-forte
JWT_SECRET=seu-jwt-secret-super-forte

# Rate Limit
RATE_LIMIT_PER_INSTANCE=500

# Logs
LOG_LEVEL=info
```

### Passo 3: Deploy

1. **Connect GitHub Repository**
2. **Deploy automaticamente**
3. **Configurar domínio personalizado** (opcional)

## 🤖 Evolution API - Configuração Completa

### Opção 1: Evolution API na Railway (Recomendado)

1. **Criar 4 projetos separados no Railway**:
   - `evolution-instance-1`
   - `evolution-instance-2` 
   - `evolution-instance-3`
   - `evolution-instance-4`

2. **Para cada instância, usar imagem Docker**:
```dockerfile
FROM atendai/evolution-api:latest

ENV PORT=8080
ENV DATABASE_PROVIDER=postgresql
ENV DATABASE_URL=postgresql://user:pass@host:port/db?schema=evolution1
ENV REDIS_ENABLED=true
ENV REDIS_URI=redis://host:port
ENV AUTHENTICATION_API_KEY=evolution-key-1
ENV INSTANCE_NAME=instance-1
```

### Opção 2: Evolution API Gratuita (Limitada)

Use serviços como:
- **Evolution API Cloud**: https://evolution-api.com
- **Z-API**: https://z-api.io (alternativa)

## 🔑 Chaves e Acessos Necessários

### 1. Gerar JWT Secret
```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Gerar Webhook Secret
```bash
# No terminal  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Evolution API Keys
- Gere uma chave única para cada instância
- Use formato: `EVO_INST_1_$(date +%s)`

### 4. Configurar PostgreSQL
```sql
-- Criar schemas para cada instância Evolution
CREATE SCHEMA evolution1;
CREATE SCHEMA evolution2; 
CREATE SCHEMA evolution3;
CREATE SCHEMA evolution4;
```

## 📱 Configuração WhatsApp

### 1. Preparar 4 Números WhatsApp
- **Recomendado**: WhatsApp Business
- **Requisito**: Números ativos e verificados
- **Importante**: Não usar números pessoais

### 2. Conectar Instâncias
```bash
# Após deploy, acessar cada instância
GET https://sua-app.railway.app/api/instances/status
GET https://sua-app.railway.app/api/instances/instance-1/qrcode
```

## 🔒 Configuração de Segurança Completa

### 1. Headers de Segurança (já configurado)
- Helmet.js
- CORS
- Rate Limiting

### 2. Variáveis Obrigatórias
```env
# NUNCA committar essas chaves!
WEBHOOK_SECRET=webhook_secret_super_forte_64_chars_min
JWT_SECRET=jwt_secret_super_forte_64_chars_min
EVOLUTION_API_KEY_1=evolution_key_1_unica
EVOLUTION_API_KEY_2=evolution_key_2_unica
EVOLUTION_API_KEY_3=evolution_key_3_unica
EVOLUTION_API_KEY_4=evolution_key_4_unica
```

### 3. Firewall (se aplicável)
```bash
# Permitir apenas portas necessárias
# Railway gerencia automaticamente
```

## 🌍 Configuração DNS (Domínio Próprio)

### 1. Domínio Gratuito
- **Freenom**: .tk, .ml, .ga (gratuitos)
- **No-IP**: subdomínio dinâmico

### 2. Configurar no Railway
1. Settings → Domains
2. Add Custom Domain
3. Configurar DNS: CNAME para railway

## 📊 Monitoramento

### 1. Logs
```bash
# Railway CLI
railway logs --follow

# Ou no dashboard Railway
```

### 2. Health Checks
- URL: `https://sua-app.railway.app/health`
- Intervalo: 30s

### 3. Alertas
- Railway envia alertas por email
- Configurar webhook para Slack/Discord

## 🚀 Script de Deploy Automatizado

Vou criar um script que automatiza todo o processo...

## 💡 Dicas Importantes

1. **Backup**: Configure backup automático do PostgreSQL
2. **SSL**: Railway fornece SSL automático
3. **Logs**: Monitore regularmente os logs
4. **Updates**: Mantenha dependências atualizadas
5. **Teste**: Sempre teste em ambiente de desenvolvimento primeiro

## 🆘 Troubleshooting Comum

### App não inicia
```bash
# Verificar logs
railway logs
# Verificar variáveis
railway variables
```

### Evolution API não conecta
```bash
# Testar conectividade
curl https://evolution-instance-1.railway.app/instance/connectionState
```

### WhatsApp não conecta
1. Verificar QR Code válido
2. Usar WhatsApp limpo (sem sessão ativa)
3. Verificar logs da Evolution API

## 📞 URLs Finais Configuradas

Após deploy completo, suas URLs serão:

```
# Webhook Order Expired
https://sua-app.railway.app/api/webhook/order-expired

# Webhook Order Paid  
https://sua-app.railway.app/api/webhook/order-paid

# Dashboard API
https://sua-app.railway.app/api/

# Health Check
https://sua-app.railway.app/health
```

Use essas URLs no seu painel Império!