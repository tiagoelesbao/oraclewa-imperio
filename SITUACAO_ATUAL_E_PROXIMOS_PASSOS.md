# 📋 SITUAÇÃO ATUAL - Sistema OracleWA Império

**Data:** 30/07/2025 22:45  
**Status:** ✅ WhatsApp API funcionando no servidor Hetzner

---

## 🎯 O QUE JÁ FOI FEITO:

### ✅ 1. SERVIDOR HETZNER CONFIGURADO
- **VPS Hetzner CX22** contratada e ativa
- **IP:** 128.140.7.154
- **Usuário:** root
- **Senha:** KtwppRMpJfi3
- **Sistema:** Ubuntu 24.04.2 LTS
- **Node.js 20** instalado

### ✅ 2. WHATSAPP API FUNCIONANDO
- **API WhatsApp customizada** criada com Baileys
- **Porta:** 8080 (firewall liberado)
- **API Key:** Imperio2024@EvolutionSecure
- **Localização:** /opt/whatsapp-imperio/
- **Health Check:** http://128.140.7.154:8080/health ✅ OK
- **Status:** {"status":"ok","instances":0}

### ✅ 3. CÓDIGO SISTEMA PRINCIPAL
- **Repositório GitHub:** tiagoelesbao/oraclewa-imperio
- **Código adaptado** para usar WhatsApp API própria
- **Variáveis de produção** configuradas
- **Manager Evolution** criado

---

## 📍 SITUAÇÃO ATUAL - ONDE PAROU:

**✅ API WhatsApp rodando com sucesso no servidor**  
**⏸️ Pronto para criar as 4 instâncias WhatsApp**  
**⏸️ Falta configurar Railway**  
**⏸️ Falta conectar WhatsApp via QR Code**

---

## 🌅 AMANHÃ - COMO CONTINUAR:

### 📱 1. CONECTAR AO SERVIDOR (PRIMEIRO)

**No Windows, abra PowerShell:**
```powershell
ssh root@128.140.7.154
```
**Senha:** `KtwppRMpJfi3`

### 🔄 2. INICIAR A API WHATSAPP

```bash
# Ir para diretório
cd /opt/whatsapp-imperio

# Iniciar servidor (deixar rodando)
node index.js
```

**Quando aparecer:** "WhatsApp API rodando na porta 8080" ✅

### 📱 3. CRIAR AS 4 INSTÂNCIAS WHATSAPP

**Abra OUTRO PowerShell:**
```powershell
ssh root@128.140.7.154
```

**Execute:**
```bash
# Criar as 4 instâncias
for i in {1..4}; do
  curl -X POST http://localhost:8080/instance/create \
    -H "apikey: Imperio2024@EvolutionSecure" \
    -H "Content-Type: application/json" \
    -d "{\"instanceName\": \"imperio_$i\"}"
  echo ""
  sleep 2
done
```

### 📱 4. OBTER QR CODES

```bash
# Para cada instância, obter QR Code
curl -H "apikey: Imperio2024@EvolutionSecure" \
  http://localhost:8080/instance/qr/imperio_1

curl -H "apikey: Imperio2024@EvolutionSecure" \
  http://localhost:8080/instance/qr/imperio_2

curl -H "apikey: Imperio2024@EvolutionSecure" \
  http://localhost:8080/instance/qr/imperio_3

curl -H "apikey: Imperio2024@EvolutionSecure" \
  http://localhost:8080/instance/qr/imperio_4
```

### 📱 5. ESCANEAR QR CODES

Para cada QR Code retornado:
1. Copie o código base64 (após "data:image/png;base64,")
2. Cole em: https://base64.guru/converter/decode/image
3. Escaneie com WhatsApp dos 4 números

### 🚀 6. CONFIGURAR RAILWAY

**No navegador, vá para:** https://railway.app

**Configure estas variáveis no projeto oraclewa-imperio:**

```env
# WhatsApp API
EVOLUTION_API_URL=http://128.140.7.154:8080
EVOLUTION_API_KEY=Imperio2024@EvolutionSecure

# Database (Railway fornece automaticamente)
DATABASE_URL=${DATABASE_URL}

# Redis (Railway fornece automaticamente)
REDIS_URL=${REDIS_URL}

# Webhooks
WEBHOOK_SECRET=1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
JWT_SECRET=821c79a12ae3d39559406040127beb33a27bbe185fd3e3ba7dd340a5177bdeb6

# App Config
NODE_ENV=production
RATE_LIMIT_PER_INSTANCE=500
LOG_LEVEL=info
```

### 🔗 7. CONECTAR RAILWAY AO GITHUB

1. No Railway → Settings
2. Connect GitHub repository
3. Selecionar: `tiagoelesbao/oraclewa-imperio`
4. Deploy automático iniciará

### 🎯 8. CONFIGURAR WEBHOOKS NO PAINEL IMPÉRIO

**URLs para configurar:**
- **Webhook 1:** https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired
- **Webhook 2:** https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid
- **Authorization:** 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
- **Eventos:** ✅ order.expired, ✅ order.paid

---

## 🔧 COMANDOS ÚTEIS PARA AMANHÃ:

### Verificar se API está rodando:
```bash
curl http://128.140.7.154:8080/health
```

### Ver logs da API:
```bash
# No terminal onde está rodando, ver saída em tempo real
```

### Testar envio de mensagem:
```bash
curl -X POST http://localhost:8080/send \
  -H "apikey: Imperio2024@EvolutionSecure" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "imperio_1",
    "number": "5511999999999",
    "message": "Teste do sistema OracleWA!"
  }'
```

### Reiniciar servidor se necessário:
```bash
# Parar: Ctrl+C
# Iniciar: node index.js
```

---

## 📊 INFORMAÇÕES IMPORTANTES:

### 🖥️ Servidor Hetzner:
- **IP:** 128.140.7.154
- **Custo:** €5.22/mês (~R$30)
- **Specs:** 2 vCPU, 4GB RAM, 40GB SSD

### 🔑 Credenciais:
- **SSH:** root@128.140.7.154 (senha: KtwppRMpJfi3)
- **API Key:** Imperio2024@EvolutionSecure
- **Webhook Secret:** 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630

### 📂 Diretórios importantes:
- **API WhatsApp:** /opt/whatsapp-imperio/
- **Código principal:** /mnt/c/Users/Pichau/Desktop/Sistemas/OracleWA/Clientes/Império/recuperacao_expirados/oraclewa/

---

## ⚡ PRÓXIMO PASSO CRÍTICO:

**CRIAR AS 4 INSTÂNCIAS E CONECTAR OS WHATSAPPS**

Quando os 4 WhatsApps estiverem conectados e o Railway deployado, o sistema estará **100% funcional** para recuperação automática de vendas expiradas!

---

## 🎯 RESULTADO FINAL ESPERADO:

1. ✅ 4 WhatsApps conectados na API
2. ✅ Railway rodando o sistema principal
3. ✅ Webhooks configurados no painel Império
4. ✅ Sistema enviando mensagens automáticas
5. ✅ Custo total: ~R$55/mês (vs R$197/mês com Z-API)

**Economia:** R$142/mês (72% mais barato)

---

**BOM DESCANSO! AMANHÃ TERMINAMOS! 🚀**