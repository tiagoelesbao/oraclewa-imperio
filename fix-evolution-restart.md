# 🚨 CORREÇÃO URGENTE - Evolution API em Loop

## Situação Atual:
- ❌ Instância `imperio1` em loop de timeout/reconexão
- ❌ Sistema de recuperação pode estar comprometido  
- ❌ API não responde aos endpoints padrão

## Solução Imediata:

### 1. Reiniciar via Railway Dashboard:
1. 🌐 Acesse: https://railway.app/project/oraclewa-imperio
2. 🔄 Clique em **"Restart"** no serviço principal
3. ⏳ Aguarde 2-3 minutos para estabilizar

### 2. Verificar Status:
```bash
# Depois do restart, teste:
curl -X GET "https://oraclewa-imperio-production.up.railway.app" -H "apikey: Imperio2024@EvolutionSecure"
```

### 3. Recriar Instância Limpa:
```bash
# Deletar instância problemática (se necessário)
curl -X DELETE "https://oraclewa-imperio-production.up.railway.app/instance/delete/imperio1" \
  -H "apikey: Imperio2024@EvolutionSecure"

# Criar nova instância estável
curl -X POST "https://oraclewa-imperio-production.up.railway.app/instance/create" \
  -H "apikey: Imperio2024@EvolutionSecure" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "imperio-main",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

## ⚠️ IMPORTANTE:
1. **NÃO** reinicie pelo SSH no momento (logs mostram problemas no Hetzner)
2. **USE** o Railway Dashboard para restart seguro
3. **TESTE** o sistema de recuperação após reiniciar
4. **MONITORE** logs por 10 minutos após restart

## Próximos Passos:
1. ✅ Reiniciar serviço
2. ✅ Reconfigurar instância principal  
3. ✅ Testar recuperação de vendas
4. ✅ Testar broadcast
5. ✅ Monitorar estabilidade