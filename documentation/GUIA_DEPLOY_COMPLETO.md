# Guia Completo de Deploy - OracleWA

Este guia consolida todas as opções de deploy do sistema OracleWA.

## 📋 Índice

1. [Deploy no Railway (Recomendado)](#deploy-no-railway)
2. [Deploy em VPS Próprio (Hetzner)](#deploy-em-vps-próprio)
3. [Configuração Evolution API](#configuração-evolution-api)
4. [Verificação e Testes](#verificação-e-testes)

---

## 🚂 Deploy no Railway

### Pré-requisitos
- Conta no [Railway](https://railway.app)
- Conta no GitHub com o código do projeto
- Cartão de crédito para billing

### Passo a Passo

#### 1. Preparar Projeto
```bash
# Clone o repositório
git clone https://github.com/tiagoelesbao/oraclewa-imperio.git
cd oraclewa-imperio

# Verificar arquivos necessários
ls railway.json package.json
```

#### 2. Deploy via Terminal
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar novo projeto
railway new oraclewa-imperio

# Deploy
railway up
```

#### 3. Configurar Variáveis de Ambiente
```bash
# Via CLI
railway vars set NODE_ENV=production
railway vars set API_KEY=sk-imperio-7h8k9m2n3p4q5r6s
railway vars set REDIS_URL=${{Redis.REDIS_URL}}
railway vars set DATABASE_URL=${{Postgres.DATABASE_URL}}
railway vars set EVOLUTION_API_URL=https://evolution-oraclewa-01-production.up.railway.app
railway vars set EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976
```

#### 4. Adicionar Serviços
```bash
# Redis
railway add redis

# PostgreSQL
railway add postgres
```

### Deploy via Interface Web

1. **Criar Projeto**
   - Acesse [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Selecione "Deploy from GitHub repo"

2. **Configurar Variáveis**
   - Vá em "Variables"
   - Adicione todas as variáveis listadas acima

3. **Deploy Evolution API**
   - Criar 4 novos serviços
   - Usar imagem: `atendai/evolution-api:v2.0.0`
   - Configurar portas e variáveis específicas

### URLs Finais
```
Sistema Principal: https://oraclewa-imperio-production.up.railway.app
Evolution API 1: https://evolution-oraclewa-01-production.up.railway.app
Evolution API 2: https://evolution-oraclewa-02-production.up.railway.app
Evolution API 3: https://evolution-oraclewa-03-production.up.railway.app
Evolution API 4: https://evolution-oraclewa-04-production.up.railway.app
```

---

## 🖥️ Deploy em VPS Próprio

### Recomendado: Hetzner Cloud

#### 1. Criar Servidor
```bash
# Especificações mínimas
- 4 vCPU
- 8GB RAM
- 80GB SSD
- Ubuntu 22.04
- Localização: Alemanha (menor latência)
```

#### 2. Configuração Inicial
```bash
# Conectar ao servidor
ssh root@seu-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y
```

#### 3. Configurar Evolution API
```bash
# Criar diretório
mkdir -p /opt/whatsapp-imperio
cd /opt/whatsapp-imperio

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:v2.0.0
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: B6D711FCDE4D4FD5936544120E713976
      DATABASE_ENABLED: true
      DATABASE_CONNECTION_URI: postgresql://user:pass@postgres:5432/evolution
      REDIS_ENABLED: true
      REDIS_URI: redis://redis:6379
      TZ: America/Sao_Paulo
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    container_name: postgres
    restart: always
    environment:
      POSTGRES_DB: evolution
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: always
    command: redis-server --requirepass yourredispassword
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Iniciar serviços
docker-compose up -d
```

#### 4. Deploy da Aplicação
```bash
# Clone o repositório
cd /opt
git clone https://github.com/tiagoelesbao/oraclewa-imperio.git
cd oraclewa-imperio

# Criar .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
API_KEY=sk-imperio-7h8k9m2n3p4q5r6s
DATABASE_URL=postgresql://user:pass@localhost:5432/oraclewa
REDIS_URL=redis://:yourredispassword@localhost:6379
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976
EOF

# Instalar dependências
npm install

# Rodar migrations
npm run migrate

# Iniciar com PM2
npm install -g pm2
pm2 start npm --name "oraclewa" -- start
pm2 save
pm2 startup
```

#### 5. Configurar Nginx
```bash
# Instalar Nginx
apt install nginx -y

# Configurar proxy reverso
cat > /etc/nginx/sites-available/oraclewa << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/oraclewa /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 6. SSL com Certbot
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Gerar certificado
certbot --nginx -d seu-dominio.com
```

---

## ⚙️ Configuração Evolution API

### Conectar WhatsApp

1. **Acessar Evolution Manager**
   ```
   https://evolution-oraclewa-01-production.up.railway.app/manager
   ```

2. **Criar Instância**
   - Nome: `imperio1`
   - Webhook: `https://oraclewa-imperio-production.up.railway.app/webhook/evolution`
   - Events: Marcar `messages.upsert`

3. **Gerar QR Code**
   - Conectar > QR Code
   - Escanear com WhatsApp Business

4. **Repetir para outras instâncias**
   - `imperio2`, `imperio3`, `imperio4`

### Configurar Webhooks

```javascript
// Configuração no Evolution
{
  "url": "https://oraclewa-imperio-production.up.railway.app/webhook/evolution",
  "webhook_by_events": false,
  "events": [
    "messages.upsert",
    "connection.update"
  ],
  "headers": {
    "x-api-key": "sk-imperio-7h8k9m2n3p4q5r6s"
  }
}
```

---

## ✅ Verificação e Testes

### 1. Verificar Status
```bash
# Railway
railway logs

# VPS
pm2 logs oraclewa
docker-compose logs -f
```

### 2. Testar API
```bash
# Health check
curl https://oraclewa-imperio-production.up.railway.app/health

# Status das instâncias
curl -H "x-api-key: sk-imperio-7h8k9m2n3p4q5r6s" \
  https://oraclewa-imperio-production.up.railway.app/instances

# Enviar mensagem teste
curl -X POST https://oraclewa-imperio-production.up.railway.app/message/send \
  -H "x-api-key: sk-imperio-7h8k9m2n3p4q5r6s" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "message": "Teste de mensagem"
  }'
```

### 3. Monitoramento
- **Railway**: Dashboard integrado
- **VPS**: Configurar Grafana + Prometheus

---

## 🚨 Troubleshooting

### Problemas Comuns

#### Evolution não conecta
```bash
# Verificar logs
docker logs evolution-api

# Reiniciar serviço
docker-compose restart evolution-api
```

#### Webhook não funciona
1. Verificar API key
2. Verificar logs de webhook
3. Testar com ngrok local

#### Mensagens não enviadas
1. Verificar limites de rate
2. Verificar horário comercial
3. Verificar número conectado

### Comandos Úteis
```bash
# Railway
railway logs --tail
railway restart

# Docker
docker-compose ps
docker-compose logs -f
docker-compose restart

# PM2
pm2 status
pm2 logs
pm2 restart oraclewa
```

---

## 📝 Checklist Final

- [ ] Sistema principal rodando
- [ ] Evolution API conectada
- [ ] WhatsApp escaneado
- [ ] Webhooks configurados
- [ ] Testes realizados
- [ ] Logs monitorados
- [ ] Backup configurado

---

**Última atualização**: 04/08/2025