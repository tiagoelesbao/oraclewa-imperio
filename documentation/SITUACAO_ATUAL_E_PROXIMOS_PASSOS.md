# 📋 SITUAÇÃO ATUAL DO SISTEMA IMPÉRIO - WhatsApp Automação

## 📅 Data: 01/08/2025 - 00:11h

---

## ✅ **COMPONENTES FUNCIONANDO**

### 🟢 **Evolution API (Hetzner VPS)**
- **Status**: ✅ Operacional
- **Servidor**: 128.140.7.154:8080
- **Instâncias Conectadas**: 3/3
  - `imperio1` - Owner: 5511941769494 - Status: open
  - `imperio2` - Owner: 5511975623976 - Status: open  
  - `imperio3` - Owner: 5511982661537 - Status: open
- **Versão**: v1.7.1
- **Docker**: Rodando normalmente
- **Teste Manual**: ✅ Mensagem enviada e recebida com sucesso

### 🟢 **Railway (Aplicação Principal)**
- **Status**: ✅ Deployado e Online
- **URL**: https://oraclewa-imperio-production.up.railway.app
- **Health Check**: ✅ Respondendo
- **Último Deploy**: 6ab7883 - Fix Evolution API integration
- **Uptime**: ~13 minutos

### 🟢 **Código Corrigido**
- ✅ Nomes das instâncias: `imperio1`, `imperio2`, `imperio3`
- ✅ Formato Evolution API: `textMessage: { text: "..." }`
- ✅ Formatação de números: sem `@s.whatsapp.net`
- ✅ Templates customizados para loteria
- ✅ Estrutura de webhooks implementada

---

## ❌ **PROBLEMA IDENTIFICADO**

### 🔴 **Webhooks Configurados MAS Não Funcionando**
- **Sintoma 1**: Pedidos expirados não geram mensagem automática
- **Sintoma 2**: Pedidos pagos (status "Pago") não geram mensagem de confirmação
- **Evidência**: Print do painel mostra pedidos com status "Pago" e "Expirado" sem automação
- **Logs Evolution**: Apenas verificação de status (connectionState)
- **Logs Railway**: Sem registros de webhooks recebidos

### ✅ **WEBHOOKS ESTÃO CONFIGURADOS CORRETAMENTE:**
- **URL 1**: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid`
- **URL 2**: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired`
- **Authorization**: `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
- **Método**: POST ✅
- **Eventos**: order.paid ✅ e order.expired ✅

### 🔍 **CAUSA RAIZ PROVÁVEL:**
- **WEBHOOK_SECRET** no Railway pode estar diferente do Authorization configurado no painel
- Ou há erro na **validação/processamento** no código Railway

### 📊 **Pedidos Observados no Painel (01/08/2025 00:15):**
- **Isabel**: Status "Pago" - Sem mensagem de confirmação enviada
- **Leonardo**: Status "Pago" - Sem mensagem de confirmação enviada  
- **Geovanna**: Status "Pago" - Sem mensagem de confirmação enviada
- **Tiago**: Status "Expirado" - Sem mensagem de recuperação enviada

---

## 🔍 **COMANDOS ÚTEIS PARA AMANHÃ**

### **Acessar Servidor Hetzner:**
```bash
ssh root@128.140.7.154
cd /opt/whatsapp-imperio
```

### **Verificar Evolution API:**
```bash
# Ver logs da Evolution API
docker logs evolution-api-main -f

# Verificar instâncias
curl -X GET http://128.140.7.154:8080/instance/fetchInstances \
-H "apikey: Imperio2024@EvolutionSecure"

# Testar envio manual
curl -X POST http://128.140.7.154:8080/message/sendText/imperio1 \
-H "Content-Type: application/json" \
-H "apikey: Imperio2024@EvolutionSecure" \
-d '{
  "number": "5511959761948",
  "textMessage": {
    "text": "Teste manual do sistema"
  }
}'
```

### **Verificar Railway:**
```bash
# Health check
curl https://oraclewa-imperio-production.up.railway.app/health

# Debug webhook
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/debug \
-H "Content-Type: application/json" \
-d '{"test": "sistema funcionando"}'
```

### **Monitorar Logs Railway:**
1. Acessar: https://railway.app/
2. Projeto: oraclewa-imperio
3. Aba: Deployments > View logs

---

## 🎯 **PRÓXIMOS PASSOS PARA AMANHÃ**

### **1. VERIFICAR WEBHOOK_SECRET NO RAILWAY** ⚡ (PRIORIDADE ALTA)
- [ ] Acessar: https://railway.app/project/oraclewa-imperio
- [ ] Ir em Variables/Environment Variables
- [ ] Verificar se WEBHOOK_SECRET = `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
- [ ] Se estiver diferente, CORRIGIR para esse valor exato

### **✅ WEBHOOKS JÁ CONFIGURADOS NO PAINEL:**
**Webhook 1 - Pedidos Pagos:** ✅ CONFIGURADO
- URL: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid`
- Authorization: `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
- Evento: `order.paid` ✅

**Webhook 2 - Pedidos Expirados:** ✅ CONFIGURADO  
- URL: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired`
- Authorization: `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
- Evento: `order.expired` ✅

### **2. TESTAR WEBHOOK COM SECRET CORRETO** ⚡ (PRIORIDADE ALTA)
```bash
# Testar com o secret que está no painel (descoberto!)
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired \
-H "Content-Type: application/json" \
-H "X-AUTH-WEBHOOK: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630" \
-d '{
  "event": "order.expired", 
  "data": {"id": "TEST", "user": {"name": "Teste", "phone": "5511959761948"}}
}'
```

### **3. SIMULAR WEBHOOKS PARA TESTE**

**Teste 1 - Pedido Expirado:**
```bash
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired \
-H "Content-Type: application/json" \
-H "X-AUTH-WEBHOOK: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630" \
-d '{
  "event": "order.expired",
  "data": {
    "id": "TEST_EXPIRED_123", 
    "user": {
      "name": "Tiago Teste",
      "phone": "5511959761948"
    },
    "product": {"title": "Rapidinha R$ 200.000,00"},
    "quantity": 50,
    "total": 10,
    "pixCode": "00020126580014BR.GOV.BCB.PIX013636401b-4a3e-4b89-9c8d-62ac3e145c315204000053039865802BR5922IMPERIO",
    "affiliate": "A0RJJ5L1QK"
  }
}'
```

**Teste 2 - Pedido Pago:**
```bash
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid \
-H "Content-Type: application/json" \
-H "X-AUTH-WEBHOOK: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630" \
-d '{
  "event": "order.paid",
  "data": {
    "id": "TEST_PAID_456",
    "user": {
      "name": "Isabel Teste", 
      "phone": "5511959761948"
    },
    "product": {"title": "Rapidinha R$ 200.000,00"},
    "quantity": 50,
    "total": 10,
    "createdAt": "2025-08-01T00:15:00Z"
  }
}'
```

### **4. MONITORAMENTO EM TEMPO REAL**
```bash
# Terminal 1: Logs Evolution API
ssh root@128.140.7.154


# Terminal 2: Logs Railway (via web interface)
# Terminal 3: Testes manuais
```

---

## 📊 **ARQUITETURA ATUAL**

```
┌─────────────────┐    webhook    ┌──────────────────┐    API    ┌─────────────────┐
│   Painel        │─────────────→ │    Railway       │─────────→ │   Evolution     │
│   Império       │               │  (Processamento) │           │   API (Hetzner) │
│                 │               │                  │           │                 │
└─────────────────┘               └──────────────────┘           └─────────────────┘
                                           │                              │
                                           │                              │
                                           ▼                              ▼
                                  ┌──────────────────┐           ┌─────────────────┐
                                  │    Templates     │           │   WhatsApp      │
                                  │   & Message      │           │   (3 numbers)   │
                                  │    Queue         │           │                 │
                                  └──────────────────┘           └─────────────────┘
```

---

## 🚨 **POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **Problema 1: Secret Incorreto**
- **Solução**: Verificar variáveis do Railway ou painel Império
- **Como testar**: Usar endpoint debug sem autenticação primeiro

### **Problema 2: URL do Webhook Incorreta no Painel**
- **Solução**: Verificar se está apontando para Railway (não Hetzner)
- **URL Correta**: `https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired`

### **Problema 3: Estrutura do Payload Diferente**
- **Solução**: Usar webhook debug para ver formato real dos dados
- **Testar**: Simular com dados reais do painel

---

## 📋 **CHECKLIST PARA AMANHÃ**

- [ ] **08:00** - Verificar se sistemas estão online (Evolution + Railway)
- [ ] **08:05** - Verificar WEBHOOK_SECRET no Railway = `1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630`
- [ ] **08:10** - Testar webhook order-expired manualmente (comando pronto)
- [ ] **08:15** - Testar webhook order-paid manualmente (comando pronto)
- [ ] **08:20** - Verificar logs Railway para ver se chegaram as requisições
- [ ] **08:25** - Se chegaram mas não enviaram: debugar código/queue
- [ ] **08:30** - Se não chegaram: verificar autorização/validação
- [ ] **08:45** - Fazer teste com pedido real no painel
- [ ] **09:00** - Validar mensagens chegaram no WhatsApp
- [ ] **09:15** - Sistema 100% funcional!

---

## 🔧 **CONFIGURAÇÕES IMPORTANTES**

### **Railway Environment Variables:**
```
EVOLUTION_API_URL=http://128.140.7.154:8080
EVOLUTION_API_KEY=Imperio2024@EvolutionSecure
WEBHOOK_SECRET=[DESCOBRIR_O_CORRETO]
SKIP_DB=true
APP_PORT=3000
NODE_ENV=production
```

### **Evolution API Config:**
```
Base URL: http://128.140.7.154:8080
API Key: Imperio2024@EvolutionSecure
Instances: imperio1, imperio2, imperio3
```

---

## 📞 **CONTATOS DE EMERGÊNCIA**

- **Hetzner VPS**: 128.140.7.154
- **Railway**: https://railway.app/project/oraclewa-imperio
- **GitHub**: https://github.com/tiagoelesbao/oraclewa-imperio

---

## 🔍 **LOGS EVOLUTION API (ÚLTIMOS)**

```
[Evolution API] v1.7.1 - Fri Aug 01 2025 00:02:16 VERBOSE
- Message update: remoteJid: '5511959761948:58@s.whatsapp.net'
- Status: 'DELIVERY_ACK' (mensagem entregue)
- Owner: 'imperio1'
- Webhook data sent successfully

Padrão de logs: Verificação de connectionState a cada minuto
Sem logs de webhooks recebidos do painel Império
```

---

**🎯 OBJETIVO FINAL**: Sistema enviando mensagens automáticas para:
1. **Pedidos Expirados**: Mensagem de recuperação com PIX
2. **Pedidos Pagos**: Mensagem de confirmação e parabéns

**📈 PROGRESSO**: 95% completo - Falta apenas configurar AMBOS webhooks no painel.

**⏱️ TEMPO ESTIMADO**: 30-60 minutos para resolver amanhã.

**🔧 ÚLTIMA AÇÃO**: 
1. Descobrir webhook secret correto
2. Configurar webhook para order.expired  
3. Configurar webhook para order.paid
4. Testar ambos os fluxos

**📊 EVIDÊNCIA DO PROBLEMA**: Print do painel mostra pedidos "Pago" e "Expirado" sem nenhuma automação funcionando.