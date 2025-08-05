# 🚀 Guia Completo - Evolution API Própria (Custo Zero)

## 📋 Visão Geral

Este guia configura a Evolution API própria em sua VPS/servidor, eliminando custos de terceiros e dando total controle sobre o sistema.

## 🎯 Arquitetura Final

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Railway App   │────▶│  Evolution API   │────▶│   WhatsApp      │
│   (OracleWA)    │     │  (Sua VPS)       │     │   (4 números)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 🔧 Pré-requisitos

- VPS com Ubuntu 20.04+ (mínimo 2GB RAM, 2 vCPU)
- Domínio próprio (ex: api.seudominio.com)
- 4 números WhatsApp disponíveis

## 📦 PASSO 1: Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar para aplicar mudanças
sudo reboot
```

## 🐳 PASSO 2: Instalar Evolution API

```bash
# Criar diretório
mkdir -p ~/evolution && cd ~/evolution

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:v2.0.0
    container_name: evolution_api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - SERVER_URL=https://api.seudominio.com
      - AUTHENTICATION_API_KEY=sua_chave_secreta_aqui
      - DATABASE_ENABLED=true
      - DATABASE_CONNECTION_URI=mongodb://mongo:27017/evolution
      - DATABASE_CONNECTION_DB_PREFIX_NAME=evolution
      - RABBITMQ_ENABLED=false
      - WEBSOCKET_ENABLED=true
      - CHATWOOT_ENABLED=false
      - S3_ENABLED=false
      - LOG_LEVEL=INFO
      - DEL_INSTANCE=false
      - WEBHOOK_GLOBAL_ENABLED=false
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
      - INSTANCE_EXPIRATION_TIME=false
      - TELEGRAM_ENABLED=false
    volumes:
      - evolution_data:/evolution/instances
    depends_on:
      - mongo
    networks:
      - evolution-network

  mongo:
    image: mongo:6
    container_name: evolution_mongo
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=evolution
      - MONGO_INITDB_ROOT_PASSWORD=evolution_pass_2024
      - MONGO_INITDB_DATABASE=evolution
    volumes:
      - mongo_data:/data/db
    networks:
      - evolution-network

volumes:
  evolution_data:
  mongo_data:

networks:
  evolution-network:
    driver: bridge
EOF

# Iniciar Evolution API
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

## 🔐 PASSO 3: Configurar Nginx + SSL

```bash
# Criar configuração nginx
sudo cat > /etc/nginx/sites-available/evolution-api << 'EOF'
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:8080/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/evolution-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar SSL
sudo certbot --nginx -d api.seudominio.com
```

## 📱 PASSO 4: Criar Instâncias WhatsApp

```bash
# Script para criar 4 instâncias
cat > criar_instancias.sh << 'EOF'
#!/bin/bash

API_URL="https://api.seudominio.com"
API_KEY="sua_chave_secreta_aqui"

# Criar 4 instâncias
for i in {1..4}; do
  echo "Criando instância imperio_$i..."
  
  curl -X POST "$API_URL/instance/create" \
    -H "apikey: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "instanceName": "imperio_'$i'",
      "token": "",
      "qrcode": true,
      "number": "",
      "businessId": "",
      "webhookUrl": "https://oraclewa-imperio-production.up.railway.app/api/webhook/evolution",
      "webhookByEvents": false,
      "webhookBase64": false,
      "webhookHeaders": {
        "X-AUTH-WEBHOOK": "1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630"
      },
      "webhookEvents": [
        "APPLICATION_STARTUP",
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "MESSAGES_DELETE",
        "SEND_MESSAGE",
        "CONNECTION_UPDATE"
      ]
    }'
  
  echo -e "\n\n"
  sleep 2
done
EOF

chmod +x criar_instancias.sh
./criar_instancias.sh
```

## 🔗 PASSO 5: Conectar WhatsApp

Para cada instância criada:

```bash
# Obter QR Code da instância 1
curl -X GET "https://api.seudominio.com/instance/connect/imperio_1" \
  -H "apikey: sua_chave_secreta_aqui"

# Repetir para instâncias 2, 3 e 4
```

## 🔄 PASSO 6: Atualizar Sistema OracleWA

Agora precisamos atualizar o código para trabalhar com Evolution API própria:

### 6.1 Atualizar serviço WhatsApp Manager