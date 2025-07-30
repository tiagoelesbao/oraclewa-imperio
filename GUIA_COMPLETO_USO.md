# 🚀 Guia Completo de Uso - OracleWA Sistema

## ✅ Sistema Deployado com Sucesso!

**Suas URLs:**
- 🌐 **Sistema**: https://oraclewa-imperio-production.up.railway.app
- 📱 **Webhook Order Expired**: https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired
- 📱 **Webhook Order Paid**: https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid
- 🔑 **Authorization Key**: `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`

---

## 📋 PASSO 1: Verificar se o Sistema Está Funcionando

### 1.1 Teste Health Check
Abra o navegador e acesse:
```
https://oraclewa-imperio-production.up.railway.app/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-07-29T23:30:00.000Z",
  "uptime": 150.234
}
```

### 1.2 Se não funcionar:
1. **Ver logs no Railway**:
   ```bash
   railway logs --follow
   ```
2. **Aguardar 2-3 minutos** (Railway pode estar buildando)

---

## 📋 PASSO 2: Configurar Webhooks no Painel Império

### 2.1 Acesse seu painel Império
Vá para a seção **Webhooks** (como nas imagens que você mostrou)

### 2.2 Criar Webhook 1 - Order Expired
1. **Clique em "Novo Webhook"**
2. **Configure:**
   - **URL**: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired`
   - **Authorization**: `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
   - **Assinaturas**: Marque apenas ✅ `order.expired`
3. **Salvar**

### 2.3 Criar Webhook 2 - Order Paid
1. **Clique em "Novo Webhook"** novamente
2. **Configure:**
   - **URL**: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid`
   - **Authorization**: `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
   - **Assinaturas**: Marque apenas ✅ `order.paid`
3. **Salvar**

---

## 📋 PASSO 3: Testar Webhooks (IMPORTANTE!)

### 3.1 Teste com Postman ou cURL

**Teste Order Expired:**
```bash
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired \
  -H "Content-Type: application/json" \
  -H "X-AUTH-WEBHOOK: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630" \
  -d '{
    "event": "order.expired",
    "data": {
      "order": {
        "id": "TESTE123",
        "total": 299.90,
        "customer": {
          "name": "João Teste",
          "phone": "5511999999999"
        },
        "expires_at": "2024-07-30T23:59:59Z"
      }
    }
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook received and queued for processing"
}
```

**Teste Order Paid:**
```bash
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid \
  -H "Content-Type: application/json" \
  -H "X-AUTH-WEBHOOK: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630" \
  -d '{
    "event": "order.paid",
    "data": {
      "order": {
        "id": "TESTE123",
        "total": 299.90,
        "customer": {
          "name": "João Teste",
          "phone": "5511999999999"
        },
        "payment_method": "PIX"
      }
    }
  }'
```

### 3.2 Verificar Logs
```bash
railway logs --follow
```

**Procure por:**
```
Webhook authenticated successfully
Order expired webhook processed
Order paid webhook processed
```

---

## 📋 PASSO 4: Configurar WhatsApp (Evolution API)

### Opção A: Z-API (RECOMENDADO - Mais Fácil)

#### 4.1 Criar conta no Z-API
1. **Acesse**: https://z-api.io
2. **Registre-se** (gratuito)
3. **Crie 4 instâncias**:
   - `Imperio-Instance-1`
   - `Imperio-Instance-2`
   - `Imperio-Instance-3`
   - `Imperio-Instance-4`

#### 4.2 Obter tokens e URLs
Para cada instância, anote:
- **Instance ID**: (ex: `3D9B2E4F8A7C`)
- **Token**: (ex: `B6D428C9F2A1E5D3`)
- **URL**: `https://api.z-api.io/instances/SEU_INSTANCE_ID`

#### 4.3 Atualizar variáveis no Railway
```bash
# No terminal
railway variables set EVOLUTION_API_URL=https://api.z-api.io
railway variables set EVOLUTION_INSTANCE_1_PORT=443
railway variables set EVOLUTION_INSTANCE_2_PORT=443
railway variables set EVOLUTION_INSTANCE_3_PORT=443
railway variables set EVOLUTION_INSTANCE_4_PORT=443

# Tokens do Z-API
railway variables set EVOLUTION_API_KEY_1=SEU_TOKEN_ZAPI_1
railway variables set EVOLUTION_API_KEY_2=SEU_TOKEN_ZAPI_2
railway variables set EVOLUTION_API_KEY_3=SEU_TOKEN_ZAPI_3
railway variables set EVOLUTION_API_KEY_4=SEU_TOKEN_ZAPI_4
```

#### 4.4 Conectar WhatsApp no Z-API
1. **No painel Z-API**, em cada instância:
2. **Gerar QR Code**
3. **Escanear com WhatsApp** (use números diferentes)

### Opção B: Evolution API Própria (Mais Trabalho)
*(Vou detalhar se você escolher esta opção)*

---

## 📋 PASSO 5: Testar Sistema Completo

### 5.1 Verificar Instâncias WhatsApp
```bash
curl -H "Authorization: Bearer SEU_JWT_TOKEN" \
  https://oraclewa-imperio-production.up.railway.app/api/instances/status
```

**Para obter JWT_TOKEN:**
```bash
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 5.2 Enviar Mensagem de Teste
```bash
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "phoneNumber": "5511999999999",
    "message": "🎉 Teste OracleWA funcionando!",
    "priority": 1
  }'
```

---

## 📋 PASSO 6: Uso no Dia a Dia

### 6.1 Monitoramento
**Ver logs em tempo real:**
```bash
railway logs --follow
```

**Ver status das instâncias:**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://oraclewa-imperio-production.up.railway.app/api/instances/status
```

### 6.2 Histórico de Mensagens
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  "https://oraclewa-imperio-production.up.railway.app/api/messages/history?page=1&limit=20"
```

### 6.3 Estatísticas
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://oraclewa-imperio-production.up.railway.app/api/messages/stats
```

---

## 🎯 RESUMO DOS PRÓXIMOS PASSOS

### ✅ **AGORA (Obrigatório):**
1. **Teste health check**: https://oraclewa-imperio-production.up.railway.app/health
2. **Configure webhooks** no painel Império
3. **Teste webhooks** com cURL
4. **Escolha**: Z-API ou Evolution própria

### ✅ **Depois (Para funcionar):**
1. **Configure 4 WhatsApp** na opção escolhida
2. **Atualize variáveis** no Railway
3. **Teste envio** de mensagem
4. **Monitore logs**

### ✅ **Para usar:**
1. **Painel Império** envia webhooks automaticamente
2. **Sistema processa** e adiciona na fila
3. **WhatsApp envia** mensagens automaticamente
4. **Você monitora** via logs/API

---

## 🆘 Troubleshooting

### Sistema não responde no health check:
```bash
railway logs --follow
# Procure por erros de conexão com banco
```

### Webhook retorna erro 401:
- Verifique se a chave `1bee33...` está correta no painel

### Webhook retorna erro 400:
- Verifique o formato JSON do payload

### WhatsApp não envia:
- Verifique se as instâncias estão conectadas
- Verifique os tokens/chaves da Evolution/Z-API

**Próximo passo recomendado**: Comece testando o health check e webhooks! 🚀