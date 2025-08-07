#!/bin/bash

echo "🚨 CORREÇÃO URGENTE - Conflito de Instâncias"
echo "============================================="

EVOLUTION_URL="https://oraclewa-imperio-production.up.railway.app"
API_KEY="Imperio2024@EvolutionSecure"

echo "🔍 1. Testando conectividade da API..."
STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$EVOLUTION_URL")
echo "Status HTTP: $STATUS"

if [ "$STATUS" -ne 200 ] && [ "$STATUS" -ne 404 ]; then
    echo "❌ API não está respondendo corretamente"
    echo "💡 Possível causa: Múltiplas instâncias em conflito"
fi

echo ""
echo "🧹 2. Tentando limpar instâncias problemáticas..."

# Tentar deletar broadcast problemática
echo "🗑️ Deletando instância broadcast..."
curl -X DELETE "$EVOLUTION_URL/instance/delete/broadcast-imperio-hoje" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  --max-time 10 \
  --silent --show-error

# Tentar deletar império1 em loop
echo "🗑️ Deletando instância império1 em loop..."
curl -X DELETE "$EVOLUTION_URL/instance/delete/imperio1" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  --max-time 10 \
  --silent --show-error

echo ""
echo "🔄 3. Aguardando estabilização..."
sleep 5

echo "🧪 4. Testando webhook de recuperação..."
WEBHOOK_TEST=$(curl -s -X POST "$EVOLUTION_URL/temp-order-paid" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "event": "order.paid", 
    "userId": "test-recovery",
    "userName": "Teste Sistema",
    "phone": "(11) 99999-9999",
    "total": 1.0,
    "status": "processing"
  }' \
  --max-time 15 \
  -w "%{http_code}")

if [[ "$WEBHOOK_TEST" == *"200"* ]] || [[ "$WEBHOOK_TEST" == *"success"* ]]; then
    echo "✅ Webhook funcionando!"
else
    echo "❌ Webhook ainda com problema"
    echo "Response: $WEBHOOK_TEST"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Se webhook ainda falha: Reinicie Railway novamente"  
echo "2. Recrie instância principal limpa"
echo "3. NÃO crie novas instâncias até sistema estabilizar"
echo "4. Recupere manualmente os clientes que falharam"