#!/bin/bash

echo "🚨 CORREÇÃO URGENTE - INSTÂNCIA IMPERIO1 EM LOOP"
echo "================================================"

# Comandos diretos para executar no Hetzner

echo "📋 PASSO 1: Conecte ao servidor Hetzner"
echo "ssh root@148.113.20.71"
echo ""

echo "📋 PASSO 2: Pare o container problemático"
echo "docker stop evolution-imperio-container"
echo ""

echo "📋 PASSO 3: Limpe os dados corrompidos da instância"
echo "docker exec -it evolution-imperio-container rm -rf /evolution/instances/imperio1"
echo ""

echo "📋 PASSO 4: Reinicie o container"
echo "docker start evolution-imperio-container"
echo ""

echo "📋 PASSO 5: Aguarde 30 segundos e crie nova instância"
echo "sleep 30"
echo ""

echo "📋 PASSO 6: Crie nova instância limpa"
cat << 'EOF'
curl -X POST "http://localhost:8080/instance/create" \
  -H "apikey: Imperio2024@EvolutionSecure" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "imperio-recovery",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS",
    "webhook": {
      "url": "https://oraclewa-imperio-production.up.railway.app/webhook",
      "enabled": true,
      "events": [
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "MESSAGES_DELETE",
        "CONNECTION_UPDATE"
      ]
    }
  }'
EOF

echo ""
echo "📋 PASSO 7: Teste se está funcionando"
cat << 'EOF'
curl -X GET "http://localhost:8080/instance/connectionState/imperio-recovery" \
  -H "apikey: Imperio2024@EvolutionSecure"
EOF

echo ""
echo "⚠️ IMPORTANTE:"
echo "1. NÃO use a instância 'imperio1' - está corrompida"
echo "2. Use 'imperio-recovery' para recuperação"
echo "3. Use 'broadcast-imperio' para broadcast (separado)"
echo "4. Monitore logs por 5 minutos após correção"