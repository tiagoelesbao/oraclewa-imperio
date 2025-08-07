# 📚 Guia Operacional - Módulo Broadcast OracleWA

## 🚀 Início Rápido

### 1️⃣ **Configurar Instância Dedicada**

```bash
# Tornar script executável
chmod +x scripts/setup-broadcast-instance.sh

# Executar configuração
./scripts/setup-broadcast-instance.sh
```

**⚠️ IMPORTANTE:**
- Use um número WhatsApp **DIFERENTE** do sistema principal
- Mantenha o WhatsApp sempre conectado
- Escaneie o QR Code quando solicitado

### 2️⃣ **Executar Menu Interativo**

```bash
# Instalar dependências (se necessário)
npm install

# Executar menu de testes
node scripts/test-broadcast.js
```

---

## 📋 Formato do Arquivo CSV

### Estrutura Padrão
```csv
nome;telefone;email;valor;produto
João Silva;11999999999;joao@email.com;100;Sorteio Federal
Maria Santos;21888888888;maria@email.com;50;Mega Prêmio
Pedro Costa;31777777777;pedro@email.com;75;Super Sorte
```

### Campos Suportados
| Campo | Obrigatório | Formato | Exemplo |
|-------|-------------|---------|---------|
| **telefone** | ✅ Sim | DDD + 9 dígitos | 11999999999 |
| **nome** | ❌ Não | Texto | João Silva |
| **email** | ❌ Não | Email válido | joao@email.com |
| **valor** | ❌ Não | Número | 100.00 |
| **produto** | ❌ Não | Texto | Sorteio Federal |

### Delimitadores Aceitos
- `;` (ponto e vírgula) - **PADRÃO**
- `,` (vírgula)
- `\t` (tab)

---

## 🎯 Passo a Passo Completo

### PASSO 1: Gerar CSV de Exemplo

```bash
# Via menu interativo
node scripts/test-broadcast.js
# Escolha opção 3

# Via API direta
curl "http://localhost:3000/api/broadcast/csv/sample?recordCount=100" \
  -o exemplo.csv
```

### PASSO 2: Validar Arquivo CSV

```bash
# Via menu interativo
node scripts/test-broadcast.js
# Escolha opção 4

# Via API direta
curl -X POST http://localhost:3000/api/broadcast/csv/validate \
  -H "Content-Type: application/json" \
  -d '{
    "csvPath": "/caminho/para/seu/arquivo.csv"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "stats": {
    "totalRows": 100,
    "validPhones": 95,
    "invalidPhones": 3,
    "duplicates": 2
  }
}
```

### PASSO 3: Teste com 1 Número

```bash
# Via menu interativo
node scripts/test-broadcast.js
# Escolha opção 5

# Via API direta
curl -X POST http://localhost:3000/api/broadcast/csv/test \
  -H "Content-Type: application/json" \
  -d '{
    "phones": ["11999999999"],
    "template": "promotional_evolution",
    "templateData": {
      "userName": "João",
      "availableQuotas": "150"
    }
  }'
```

### PASSO 4: Enviar Broadcast Completo

```bash
# Via menu interativo
node scripts/test-broadcast.js
# Escolha opção 6

# Via API direta
curl -X POST http://localhost:3000/api/broadcast/csv/process \
  -H "Content-Type: application/json" \
  -d '{
    "csvPath": "/caminho/para/arquivo.csv",
    "template": "promotional_evolution",
    "templateData": {
      "availableQuotas": "150",
      "promotionDetails": "3 cotas por R$ 25"
    },
    "options": {
      "batchSize": 50,
      "delayMs": 5000,
      "randomize": false
    }
  }'
```

---

## 🎨 Templates Disponíveis

### 1. **promotional_evolution** - Campanha Promocional
```javascript
templateData: {
  userName: "João",           // Nome do cliente
  availableQuotas: "150",     // Cotas disponíveis
  promotionDetails: "Oferta"  // Detalhes da promoção
}
```

### 2. **abandoned_cart_evolution** - Carrinho Abandonado
```javascript
templateData: {
  userName: "Maria",
  cartItems: "3 cotas - Sorteio Federal",
  cartTotal: "75.00",
  expirationTime: "2 horas"
}
```

### 3. **vip_invite_evolution** - Convite VIP
```javascript
templateData: {
  userName: "Pedro",
  vipSlots: "50"  // Vagas disponíveis
}
```

### 4. **contest_reminder_evolution** - Lembrete de Sorteio
```javascript
templateData: {
  contestName: "Sorteio Federal",
  drawDate: "15/12/2024",
  drawTime: "20:00",
  prizeAmount: "170.000",
  userQuotas: "5",
  liveStreamLink: "https://youtube.com/live"
}
```

---

## ⚙️ Configurações Avançadas

### Parâmetros de Envio

```javascript
{
  "options": {
    "batchSize": 50,        // Mensagens por lote (5-100)
    "delayMs": 5000,        // Delay entre lotes (ms)
    "randomize": false,     // Randomizar ordem
    "delimiter": ";",       // Delimitador CSV
    "skipHeader": false     // Pular cabeçalho
  }
}
```

### Limites Recomendados

| Parâmetro | Mínimo | Recomendado | Máximo | Observação |
|-----------|--------|-------------|---------|------------|
| **batchSize** | 5 | 50 | 100 | Evita sobrecarga |
| **delayMs** | 1000 | 5000 | 30000 | Evita bloqueios |
| **msgs/dia** | - | 500 | 1000 | Por número |
| **msgs/minuto** | - | 10 | 30 | Taxa segura |

---

## 📊 Monitoramento e Logs

### Verificar Status

```bash
# Status geral
curl http://localhost:3000/api/broadcast/status

# Health check
curl http://localhost:3000/api/broadcast/health
```

### Arquivos de Log

```bash
# Logs da aplicação
tail -f logs/app.log

# Filtrar logs de broadcast
grep "BROADCAST" logs/app.log

# Ver erros
grep "ERROR" logs/app.log | grep "broadcast"
```

### Arquivo de Resultados

Após cada broadcast, um CSV de resultados é gerado:

```csv
phone;name;status;messageId;sentAt;error
11999999999;João Silva;sent;msg_123;2024-12-08T10:00:00Z;
21888888888;Maria;failed;;2024-12-08T10:00:01Z;Invalid number
```

---

## 🔧 Troubleshooting

### Problema: "Instância não conectada"

**Solução:**
```bash
# Recriar instância
./scripts/setup-broadcast-instance.sh

# Verificar status
curl http://localhost:3000/api/broadcast/status
```

### Problema: "Muitas falhas no envio"

**Causas possíveis:**
1. Números inválidos no CSV
2. Rate limit atingido
3. WhatsApp desconectado

**Soluções:**
- Validar CSV antes do envio
- Aumentar delay entre lotes
- Verificar conexão WhatsApp

### Problema: "Mensagens não personalizadas"

**Verificar:**
- Campo `nome` presente no CSV
- Template usa `{{userName}}`
- Encoding do arquivo (UTF-8)

---

## 🎯 Melhores Práticas

### ✅ FAÇA

1. **Validar sempre** o CSV antes do envio
2. **Testar com 1 número** antes do broadcast
3. **Usar delays adequados** (5 segundos entre lotes)
4. **Monitorar logs** durante o envio
5. **Manter backup** do CSV original
6. **Verificar horário** (evitar madrugada)
7. **Segmentar listas** grandes (máx 1000/dia)

### ❌ NÃO FAÇA

1. **Não use** o mesmo número do sistema principal
2. **Não envie** sem validar o CSV
3. **Não ignore** os limites de rate
4. **Não desconecte** o WhatsApp durante envio
5. **Não envie** para números não autorizados
6. **Não use** lotes maiores que 100

---

## 📈 Métricas e KPIs

### Taxa de Sucesso Esperada
- **Ideal:** > 95%
- **Aceitável:** 85-95%
- **Problemático:** < 85%

### Velocidade de Envio
- **Conservador:** 300 msgs/hora
- **Normal:** 600 msgs/hora
- **Agressivo:** 1000 msgs/hora

### Cálculo de Tempo
```
Tempo Total = (Total Msgs / Batch Size) × (Delay + 100ms)

Exemplo: 1000 msgs, lote 50, delay 5s
Tempo = (1000/50) × 5.1s = 102 segundos
```

---

## 🔐 Segurança

### Boas Práticas

1. **Autenticação:** Use API key nos endpoints
2. **Validação:** Sempre valide entrada de dados
3. **Logs:** Mantenha logs de todas operações
4. **Backup:** Faça backup dos CSVs processados
5. **LGPD:** Respeite opt-out e privacidade

### Configurar API Key

```env
# .env
BROADCAST_API_KEY=sua-chave-secreta-aqui
```

```javascript
// Usar nas requisições
headers: {
  'X-API-Key': 'sua-chave-secreta-aqui'
}
```

---

## 📞 Comandos Úteis

### Scripts NPM

```json
{
  "scripts": {
    "broadcast:test": "node scripts/test-broadcast.js",
    "broadcast:setup": "bash scripts/setup-broadcast-instance.sh",
    "broadcast:sample": "curl http://localhost:3000/api/broadcast/csv/sample?recordCount=100"
  }
}
```

### Aliases Bash

```bash
# Adicionar ao ~/.bashrc
alias btest='node scripts/test-broadcast.js'
alias bstatus='curl http://localhost:3000/api/broadcast/status'
alias blogs='tail -f logs/app.log | grep BROADCAST'
```

---

## 🆘 Suporte

### Logs para Debug
```bash
# Ver últimos erros
tail -n 100 logs/app.log | grep ERROR

# Acompanhar em tempo real
tail -f logs/app.log

# Buscar por número específico
grep "11999999999" logs/app.log
```

### Checklist de Problemas

- [ ] WhatsApp está conectado?
- [ ] CSV está no formato correto?
- [ ] Números estão validados?
- [ ] Delay está configurado?
- [ ] Logs mostram algum erro?
- [ ] Status endpoint responde?

---

## 📊 Exemplo Completo de Uso

```bash
# 1. Gerar CSV de teste
curl "http://localhost:3000/api/broadcast/csv/sample?recordCount=10" \
  -o teste.csv

# 2. Validar CSV
curl -X POST http://localhost:3000/api/broadcast/csv/validate \
  -H "Content-Type: application/json" \
  -d '{"csvPath": "./teste.csv"}' | jq

# 3. Teste com primeiro número
curl -X POST http://localhost:3000/api/broadcast/csv/test \
  -H "Content-Type: application/json" \
  -d '{
    "phones": ["11999999999"],
    "template": "promotional_evolution",
    "templateData": {
      "userName": "Teste",
      "availableQuotas": "100"
    }
  }' | jq

# 4. Enviar broadcast completo
curl -X POST http://localhost:3000/api/broadcast/csv/process \
  -H "Content-Type: application/json" \
  -d '{
    "csvPath": "./teste.csv",
    "template": "promotional_evolution",
    "options": {
      "batchSize": 5,
      "delayMs": 3000
    }
  }' | jq

# 5. Verificar resultados
cat results_*.csv
```

---

**📅 Última atualização:** Dezembro 2024  
**🔧 Versão:** 2.0  
**✅ Status:** Sistema pronto para produção

---

*Para dúvidas ou problemas, execute:*
```bash
node scripts/test-broadcast.js
# Escolha opção 9 para guia rápido
```