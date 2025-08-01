# 🚀 Deploy Manual no Railway - Windows

## ✅ Chaves Já Geradas!

**Suas chaves geradas pelo script (salve em local seguro):**

```env
WEBHOOK_SECRET=1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
JWT_SECRET=821c79a12ae3d39559406040127beb33a27bbe185fd3e3ba7dd340a5177bdeb6
EVOLUTION_API_KEY_1=EVO_INST_1_1753830009
EVOLUTION_API_KEY_2=EVO_INST_2_1753830009
EVOLUTION_API_KEY_3=EVO_INST_3_1753830009
EVOLUTION_API_KEY_4=EVO_INST_4_1753830009
```

## 📋 Passo 1: Criar Repositório GitHub

1. **Acesse GitHub.com** e faça login
2. **New Repository**:
   - Nome: `oraclewa-imperio`
   - Public ✅
   - Initialize with README ❌

3. **Upload dos arquivos**:
   - Vá na pasta `oraclewa`
   - Selecione todos os arquivos
   - Arraste para o GitHub ou use "uploading an existing file"

## 📋 Passo 2: Deploy no Railway

### 2.1 Acesse Railway
1. Vá para: https://railway.app
2. **Sign in with GitHub**
3. Autorize o Railway a acessar seus repositórios

### 2.2 Criar Novo Projeto
1. **New Project**
2. **Deploy from GitHub repo**
3. Selecione: `oraclewa-imperio`
4. **Deploy Now**

### 2.3 Adicionar Banco de Dados
1. No dashboard do projeto → **+ New**
2. **Add PostgreSQL** → Confirmar
3. **+ New** → **Add Redis** → Confirmar

### 2.4 Configurar Variáveis de Ambiente

No projeto principal (não PostgreSQL/Redis):
1. **Settings** → **Variables**
2. **Add** cada variável:

```env
NODE_ENV=production
APP_PORT=3000

# Database (conecta automaticamente)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASS=${{Postgres.PGPASSWORD}}

# Redis (conecta automaticamente)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# Evolution API (temporário - local)
EVOLUTION_API_URL=http://localhost
EVOLUTION_INSTANCE_1_PORT=8081
EVOLUTION_INSTANCE_2_PORT=8082
EVOLUTION_INSTANCE_3_PORT=8083
EVOLUTION_INSTANCE_4_PORT=8084

# Suas chaves geradas
WEBHOOK_SECRET=1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
JWT_SECRET=821c79a12ae3d39559406040127beb33a27bbe185fd3e3ba7dd340a5177bdeb6
EVOLUTION_API_KEY_1=EVO_INST_1_1753830009
EVOLUTION_API_KEY_2=EVO_INST_2_1753830009
EVOLUTION_API_KEY_3=EVO_INST_3_1753830009
EVOLUTION_API_KEY_4=EVO_INST_4_1753830009

# Rate Limit
RATE_LIMIT_PER_INSTANCE=500

# Logs
LOG_LEVEL=info
```

### 2.5 Deploy
1. **Deployments** → **Deploy**
2. Aguarde o build terminar
3. **Settings** → **Domains** → Copie a URL gerada

## 🎯 Sua URL Final

Após o deploy, você terá uma URL como:
```
https://oraclewa-imperio-production.railway.app
```

## 📱 URLs dos Webhooks para o Painel Império

Configure no seu painel:

**Webhook 1 - Order Expired:**
```
URL: https://sua-url.railway.app/api/webhook/order-expired
Authorization: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
Assinaturas: ✅ order.expired
```

**Webhook 2 - Order Paid:**
```
URL: https://sua-url.railway.app/api/webhook/order-paid
Authorization: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
Assinaturas: ✅ order.paid
```

## 🤖 Próximos Passos - Evolution API

### Opção 1: Evolution na Railway (Mais Trabalho)
- Criar 4 projetos separados
- Configurar cada um
- Mais controle, mas mais complexo

### Opção 2: Evolution Externa (Recomendado para início)
Use um serviço já pronto:

**Z-API (Recomendado):**
1. Acesse: https://z-api.io
2. Crie conta gratuita
3. Crie 4 instâncias
4. Obtenha as URLs e tokens
5. Atualize as variáveis no Railway

**Exemplo Z-API:**
```env
# Atualizar no Railway
EVOLUTION_API_URL=https://api.z-api.io
EVOLUTION_INSTANCE_1_PORT=443
EVOLUTION_INSTANCE_2_PORT=443
EVOLUTION_INSTANCE_3_PORT=443
EVOLUTION_INSTANCE_4_PORT=443

# Tokens do Z-API
EVOLUTION_API_KEY_1=seu-token-zapi-1
EVOLUTION_API_KEY_2=seu-token-zapi-2
EVOLUTION_API_KEY_3=seu-token-zapi-3
EVOLUTION_API_KEY_4=seu-token-zapi-4
```

## 🧪 Testar o Sistema

1. **Teste Health Check:**
```
GET https://sua-url.railway.app/health
```

2. **Teste Webhook (com Postman):**
```bash
POST https://sua-url.railway.app/api/webhook/order-expired
Headers:
  Content-Type: application/json
  X-AUTH-WEBHOOK: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630

Body:
{
  "event": "order.expired",
  "data": {
    "order": {
      "id": "TEST123",
      "total": 100.00,
      "customer": {
        "name": "Teste Silva",
        "phone": "5511999999999"
      }
    }
  }
}
```

## 🎉 Quando Estiver Funcionando

Você terá:
- ✅ Sistema OracleWA rodando na nuvem
- ✅ URLs dos webhooks funcionando
- ✅ Banco PostgreSQL e Redis configurados
- ✅ Chaves de segurança geradas
- ✅ Pronto para receber webhooks do painel Império

**Próximo passo**: Configurar as 4 instâncias WhatsApp (Z-API ou Evolution própria)

## 🆘 Se Algo Der Errado

1. **Logs no Railway**: Dashboard → Deployments → View Logs
2. **Variáveis**: Verifique se todas estão configuradas
3. **Health Check**: Teste se a URL responde
4. **Discord/Telegram**: Me chame se precisar de ajuda!

🚀 **Vamos lá! O sistema está 99% pronto!**