# 🚀 Deploy do Módulo Broadcast - Hetzner + Railway

## 📋 Visão Geral da Arquitetura

### Infraestrutura Atual
- **VPS Hetzner:** Evolution API (instâncias WhatsApp)
- **Railway:** Aplicação OracleWA (Node.js)
- **PostgreSQL:** Banco de dados (Railway)

### Arquitetura Proposta para Broadcast

```
┌─────────────────────────────────────┐
│         RAILWAY (App)               │
│  ┌──────────────────────────────┐  │
│  │    OracleWA Main App         │  │
│  │  - Sistema de Recuperação    │  │
│  │  - Módulo Broadcast          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↕ API
┌─────────────────────────────────────┐
│      HETZNER VPS (Ubuntu)           │
│  ┌──────────────────────────────┐  │
│  │   Evolution API Manager      │  │
│  │  ┌────────────────────────┐  │  │
│  │  │ Instance: main         │  │  │
│  │  │ (Sistema Principal)    │  │  │
│  │  └────────────────────────┘  │  │
│  │  ┌────────────────────────┐  │  │
│  │  │ Instance: broadcast    │  │  │
│  │  │ (Dedicado Broadcast)   │  │  │
│  │  └────────────────────────┘  │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🛠️ PARTE 1: Configuração no Hetzner (VPS)

### 1.1 Conectar ao Servidor Hetzner

```powershell
# No seu PowerShell
ssh root@evolution-imperio.opti.host
```

### 1.2 Criar Instância Broadcast no Evolution

```bash
# No servidor Hetzner (após conectar via SSH)

# 1. Navegar para o diretório Evolution
cd /opt/whatsapp-imperio

# 2. Verificar instâncias atuais
docker ps | grep evolution

# 3. Criar nova instância para broadcast
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_EVOLUTION_API_KEY" \
  -d '{
    "instanceName": "broadcast-imperio",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'

# 4. Salvar o QR Code
curl -X GET http://localhost:8080/instance/connect/broadcast-imperio \
  -H "apikey: SUA_EVOLUTION_API_KEY" \
  > /tmp/broadcast_qrcode.json

# 5. Extrair e exibir QR Code
cat /tmp/broadcast_qrcode.json | jq -r '.qrcode' | qrencode -t ANSI
```

### 1.3 Script Automatizado para Hetzner

```bash
# Criar script no servidor Hetzner
nano /opt/scripts/setup_broadcast_instance.sh
```

Conteúdo do script:

```bash
#!/bin/bash

# Configurações
EVOLUTION_URL="http://localhost:8080"
EVOLUTION_API_KEY="${EVOLUTION_API_KEY}"
INSTANCE_NAME="broadcast-imperio"
WEBHOOK_URL="https://oraclewa-imperio.up.railway.app/api/broadcast/webhook"

echo "🚀 Configurando Instância Broadcast - Império"
echo "==========================================="

# Criar instância
echo "1. Criando instância ${INSTANCE_NAME}..."
CREATE_RESPONSE=$(curl -s -X POST \
  "${EVOLUTION_URL}/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: ${EVOLUTION_API_KEY}" \
  -d '{
    "instanceName": "'${INSTANCE_NAME}'",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }')

echo "Instância criada: ${CREATE_RESPONSE}"

# Configurar webhook
echo "2. Configurando webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST \
  "${EVOLUTION_URL}/webhook/set/${INSTANCE_NAME}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${EVOLUTION_API_KEY}" \
  -d '{
    "url": "'${WEBHOOK_URL}'",
    "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
  }')

echo "Webhook configurado: ${WEBHOOK_RESPONSE}"

# Gerar QR Code
echo "3. Gerando QR Code..."
QR_RESPONSE=$(curl -s -X GET \
  "${EVOLUTION_URL}/instance/connect/${INSTANCE_NAME}" \
  -H "apikey: ${EVOLUTION_API_KEY}")

# Exibir QR Code
echo "${QR_RESPONSE}" | jq -r '.qrcode' | qrencode -t ANSI

echo ""
echo "✅ Instância broadcast configurada!"
echo "📱 Escaneie o QR Code com WhatsApp dedicado ao broadcast"
```

```bash
# Tornar executável
chmod +x /opt/scripts/setup_broadcast_instance.sh

# Executar
/opt/scripts/setup_broadcast_instance.sh
```

---

## 🚂 PARTE 2: Configuração no Railway

### 2.1 Adicionar Variáveis de Ambiente

No Railway Dashboard, adicione:

```env
# Broadcast Module Configuration
BROADCAST_MODULE_ENABLED=true
DEFAULT_BROADCAST_PROVIDER=evolution

# Evolution Broadcast Instance
EVOLUTION_BROADCAST_INSTANCE_1=broadcast-imperio
EVOLUTION_BROADCAST_INSTANCE_2=broadcast-backup
EVOLUTION_BROADCAST_INSTANCE_3=broadcast-extra

# Hetzner Evolution API
EVOLUTION_API_URL=http://evolution-imperio.opti.host:8080
EVOLUTION_API_KEY=sua_chave_api_aqui

# Optional ZAPI (future)
ZAPI_ENABLED=false
ZAPI_TOKEN=
ZAPI_INSTANCE_ID=
```

### 2.2 Deploy Automático

O Railway detectará automaticamente as mudanças e fará redeploy.

---

## 💻 PARTE 3: Comandos PowerShell (Seu PC)

### 3.1 Script PowerShell para Gerenciar

Crie `broadcast-manager.ps1`:

```powershell
# broadcast-manager.ps1
# Script para gerenciar broadcast do Windows

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "menu"
)

$HETZNER_HOST = "evolution-imperio.opti.host"
$RAILWAY_URL = "https://oraclewa-imperio.up.railway.app"
$SSH_USER = "root"

function Show-Menu {
    Clear-Host
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     🚀 Broadcast Manager - Império         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 📱 Configurar nova instância (Hetzner)" -ForegroundColor Green
    Write-Host "2. 🔍 Verificar status broadcast" -ForegroundColor Green
    Write-Host "3. 📝 Gerar CSV de exemplo" -ForegroundColor Green
    Write-Host "4. ✅ Validar arquivo CSV" -ForegroundColor Green
    Write-Host "5. 🧪 Teste com 1 número" -ForegroundColor Green
    Write-Host "6. 📨 Enviar broadcast via CSV" -ForegroundColor Green
    Write-Host "7. 📊 Ver logs Hetzner" -ForegroundColor Green
    Write-Host "8. 🚂 Ver logs Railway" -ForegroundColor Green
    Write-Host "9. 🔄 Reiniciar Evolution (Hetzner)" -ForegroundColor Green
    Write-Host "0. Sair" -ForegroundColor Red
    Write-Host ""
}

function Setup-Instance {
    Write-Host "Conectando ao Hetzner..." -ForegroundColor Yellow
    ssh $SSH_USER@$HETZNER_HOST "/opt/scripts/setup_broadcast_instance.sh"
}

function Check-Status {
    Write-Host "Verificando status..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/broadcast/status" -Method Get
    $response | ConvertTo-Json -Depth 10 | Write-Host
}

function Generate-SampleCSV {
    $count = Read-Host "Quantos registros? (padrão: 10)"
    if ([string]::IsNullOrEmpty($count)) { $count = "10" }
    
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/broadcast/csv/sample?recordCount=$count" -Method Get
    Write-Host "CSV gerado: $($response.file)" -ForegroundColor Green
    
    # Download para desktop
    $desktop = [Environment]::GetFolderPath("Desktop")
    $filename = "broadcast_sample_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
    $filepath = Join-Path $desktop $filename
    
    # Criar CSV local
    $csvContent = @"
nome;telefone;email;valor;produto
João Silva;11999999999;joao@email.com;100;Sorteio Federal
Maria Santos;21888888888;maria@email.com;50;Mega Prêmio
Pedro Costa;31777777777;pedro@email.com;75;Super Sorte
"@
    $csvContent | Out-File -FilePath $filepath -Encoding UTF8
    
    Write-Host "CSV salvo em: $filepath" -ForegroundColor Green
}

function Validate-CSV {
    $csvPath = Read-Host "Caminho do arquivo CSV"
    
    if (-not (Test-Path $csvPath)) {
        Write-Host "Arquivo não encontrado!" -ForegroundColor Red
        return
    }
    
    # Enviar para validação
    $body = @{
        csvPath = $csvPath
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/broadcast/csv/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "Validação completa:" -ForegroundColor Green
    Write-Host "Total: $($response.stats.totalRows)"
    Write-Host "Válidos: $($response.stats.validPhones)" -ForegroundColor Green
    Write-Host "Inválidos: $($response.stats.invalidPhones)" -ForegroundColor Red
}

function Test-SingleNumber {
    $phone = Read-Host "Digite o número (com DDD)"
    $name = Read-Host "Nome do contato"
    
    $body = @{
        phones = @($phone)
        template = "promotional_evolution"
        templateData = @{
            userName = $name
            availableQuotas = "150"
        }
        testMode = $true
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/broadcast/csv/test" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "Resultado: $($response.results[0].status)" -ForegroundColor Green
}

function Send-Broadcast {
    $csvPath = Read-Host "Caminho do arquivo CSV"
    
    Write-Host "ATENÇÃO: Isso enviará para TODOS os números!" -ForegroundColor Yellow
    $confirm = Read-Host "Digite ENVIAR para confirmar"
    
    if ($confirm -ne "ENVIAR") {
        Write-Host "Cancelado" -ForegroundColor Red
        return
    }
    
    $body = @{
        csvPath = $csvPath
        template = "promotional_evolution"
        options = @{
            batchSize = 50
            delayMs = 5000
        }
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/broadcast/csv/process" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "Broadcast concluído!" -ForegroundColor Green
    Write-Host "Enviados: $($response.summary.sent)"
    Write-Host "Falhas: $($response.summary.failed)"
}

function View-HetznerLogs {
    Write-Host "Conectando ao Hetzner para ver logs..." -ForegroundColor Yellow
    ssh $SSH_USER@$HETZNER_HOST "docker logs evolution-api --tail 100"
}

function View-RailwayLogs {
    Write-Host "Abrindo logs do Railway..." -ForegroundColor Yellow
    Start-Process "https://railway.app/project/YOUR_PROJECT_ID/logs"
}

function Restart-Evolution {
    Write-Host "Reiniciando Evolution no Hetzner..." -ForegroundColor Yellow
    ssh $SSH_USER@$HETZNER_HOST "docker restart evolution-api"
    Write-Host "Evolution reiniciado!" -ForegroundColor Green
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Escolha uma opção"
    
    switch ($choice) {
        "1" { Setup-Instance }
        "2" { Check-Status }
        "3" { Generate-SampleCSV }
        "4" { Validate-CSV }
        "5" { Test-SingleNumber }
        "6" { Send-Broadcast }
        "7" { View-HetznerLogs }
        "8" { View-RailwayLogs }
        "9" { Restart-Evolution }
        "0" { break }
        default { Write-Host "Opção inválida!" -ForegroundColor Red }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Write-Host "Pressione ENTER para continuar..." -ForegroundColor Yellow
        Read-Host
    }
} while ($choice -ne "0")

Write-Host "Até logo!" -ForegroundColor Green
```

### 3.2 Executar Script PowerShell

```powershell
# Salvar script no Desktop
$scriptPath = "$env:USERPROFILE\Desktop\broadcast-manager.ps1"

# Executar
powershell -ExecutionPolicy Bypass -File $scriptPath
```

---

## 📁 PARTE 4: Organização de Arquivos

### 4.1 Estrutura no Hetzner

```bash
/opt/
├── whatsapp-imperio/          # Evolution API
│   └── data/
│       ├── instance-main/     # Instância principal
│       └── instance-broadcast/ # Instância broadcast
├── scripts/
│   ├── setup_broadcast_instance.sh
│   ├── check_broadcast_status.sh
│   └── backup_broadcast.sh
└── logs/
    └── broadcast/
```

### 4.2 Estrutura no Railway

O código já está organizado em módulos. Não precisa mudanças.

---

## 🔧 PARTE 5: Comandos Úteis

### PowerShell (Seu PC)

```powershell
# SSH para Hetzner
ssh root@evolution-imperio.opti.host

# Testar API Railway
Invoke-RestMethod -Uri "https://oraclewa-imperio.up.railway.app/api/broadcast/health"

# Upload CSV via SCP
scp C:\Users\Pichau\Desktop\lista.csv root@evolution-imperio.opti.host:/tmp/

# Ver logs em tempo real
ssh root@evolution-imperio.opti.host "tail -f /opt/logs/broadcast.log"
```

### Bash (Hetzner)

```bash
# Status Evolution
docker ps | grep evolution

# Logs Evolution
docker logs evolution-api --tail 100 -f

# Verificar instâncias
curl http://localhost:8080/instance/list \
  -H "apikey: SUA_API_KEY" | jq

# Conectar instância broadcast
curl http://localhost:8080/instance/connect/broadcast-imperio \
  -H "apikey: SUA_API_KEY"
```

---

## 📊 PARTE 6: Monitoramento

### 6.1 Dashboard Simples

Crie `check-broadcast.sh` no Hetzner:

```bash
#!/bin/bash

echo "=== BROADCAST STATUS ==="
echo ""

# Check Evolution
echo "Evolution API:"
curl -s http://localhost:8080/instance/connectionState/broadcast-imperio \
  -H "apikey: $EVOLUTION_API_KEY" | jq '.instance.state'

echo ""
echo "Railway App:"
curl -s https://oraclewa-imperio.up.railway.app/api/broadcast/health | jq

echo ""
echo "Últimas mensagens enviadas:"
docker logs evolution-api --tail 20 | grep "Message sent"
```

---

## 🚀 PARTE 7: Fluxo Completo de Uso

### Do PowerShell:

```powershell
# 1. Configurar instância (primeira vez)
ssh root@evolution-imperio.opti.host "/opt/scripts/setup_broadcast_instance.sh"

# 2. Criar CSV de teste
$csv = @"
nome;telefone
João;11999999999
Maria;21888888888
"@
$csv | Out-File -FilePath "$env:USERPROFILE\Desktop\teste.csv" -Encoding UTF8

# 3. Enviar para servidor
scp $env:USERPROFILE\Desktop\teste.csv root@evolution-imperio.opti.host:/tmp/teste.csv

# 4. Processar broadcast
$body = @{
    csvPath = "/tmp/teste.csv"
    template = "promotional_evolution"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://oraclewa-imperio.up.railway.app/api/broadcast/csv/process" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## ✅ Checklist de Implementação

- [ ] Conectar ao Hetzner via SSH
- [ ] Criar instância broadcast no Evolution
- [ ] Escanear QR Code com WhatsApp dedicado
- [ ] Adicionar variáveis no Railway
- [ ] Aguardar redeploy automático
- [ ] Testar com 1 número
- [ ] Criar CSV de produção
- [ ] Validar CSV
- [ ] Executar broadcast

---

## 🆘 Troubleshooting

### Problema: "Connection refused" no Hetzner

```bash
# Verificar Evolution rodando
docker ps | grep evolution

# Reiniciar se necessário
docker restart evolution-api
```

### Problema: Railway não conecta ao Hetzner

```bash
# Verificar firewall
ufw status

# Liberar porta Evolution (se necessário)
ufw allow 8080/tcp
```

---

## 📝 Resumo

1. **Hetzner:** Gerencia instâncias Evolution (WhatsApp)
2. **Railway:** Processa lógica de broadcast
3. **PowerShell:** Interface de controle local

**Próximo comando para começar:**

```powershell
# Do seu PowerShell
ssh root@evolution-imperio.opti.host
```

Depois execute o setup da instância broadcast! 🚀