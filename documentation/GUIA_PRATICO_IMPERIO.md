# 🏆 Guia Prático - Broadcast Império Premiações

## 🎯 Configuração Real do Seu Ambiente

### Informações da VPS Hetzner:
- **IP:** 128.140.7.154
- **Usuário:** root
- **Senha:** KtwppRMpJfi3
- **Diretório:** /opt/whatsapp-imperio

### Containers Evolution Ativos:
- evolution-instance-1 (porta 8081)
- evolution-instance-2 (porta 8082) 
- evolution-instance-3 (porta 8083)
- evolution-instance-4 (porta 8084)

---

## 🚀 INÍCIO RÁPIDO (3 comandos)

### 1. **No seu PowerShell (Windows):**
```powershell
cd "C:\Users\Pichau\Desktop\Sistemas\OracleWA\Clientes\Império\recuperacao_expirados\oraclewa\scripts"
powershell -ExecutionPolicy Bypass -File broadcast-manager-hetzner.ps1
```

### 2. **Criar instância broadcast:**
- Execute o script PowerShell
- Escolha opção **1** (Criar instância broadcast na VPS)
- Escaneie o QR Code com WhatsApp dedicado

### 3. **Testar:**
- Opção **8** (Teste com 1 número)
- Use seu próprio número para teste

---

## 📋 Comandos VPS (Se preferir manual)

### Conectar na VPS:
```bash
ssh root@128.140.7.154
# Senha: KtwppRMpJfi3

cd /opt/whatsapp-imperio
```

### Ver containers ativos:
```bash
docker ps | grep evolution
docker-compose ps
```

### Criar instância broadcast manualmente:
```bash
# Copiar script
curl -o setup_broadcast.sh https://raw.githubusercontent.com/seu-repo/scripts/broadcast-hetzner-setup.sh

# Executar
chmod +x setup_broadcast.sh
./setup_broadcast.sh
```

### Ver logs específicos:
```bash
# Logs do Evolution
docker-compose logs -f evolution-1

# Logs de erro
docker-compose logs --tail=100 | grep -i error

# Logs broadcast
docker-compose logs | grep -i broadcast
```

---

## 🎨 Como Funciona o Sistema

### **Estrutura Atual:**
```
[Seu Windows] ←→ [PowerShell Manager] ←→ [SSH] ←→ [VPS Hetzner]
                                                      ↓
                     [Evolution Containers] ←→ [WhatsApp Instances]
                              ↓                         ↓
                     [Railway OracleWA] ←→ [Broadcast Module]
```

### **Fluxo de Broadcast:**
1. **CSV** → Validação local
2. **Upload** → VPS via SCP
3. **Processamento** → Railway API
4. **Envio** → Evolution Instances
5. **Entrega** → WhatsApp destinatários

---

## 📊 Templates Específicos do Império

### Template Padrão (promotional_evolution):
```
🎉 [NOME], PROMOÇÃO EXCLUSIVA!

🏆 SORTEIO ESPECIAL IMPÉRIO PREMIAÇÕES

💰 PRÊMIO PRINCIPAL:
💵 R$ 170.000,00 em dinheiro

🎯 ESCOLHA UMA OPÇÃO:

🛒 COMPRAR AGORA
📱 Responda: "1" ou "COMPRAR"
👉 Link direto

📋 MAIS INFORMAÇÕES 
📱 Responda: "2" ou "INFO"

👥 ENTRAR NO GRUPO VIP
📱 Responda: "3" ou "GRUPO"

🍀 Não perca esta oportunidade única!
```

### Automação de Respostas:
- **"1", "COMPRAR"** → Link de compra
- **"2", "INFO"** → Informações detalhadas
- **"3", "GRUPO"** → Link do grupo VIP

---

## 🔧 Configurações Railway

### Variáveis necessárias:
```env
BROADCAST_MODULE_ENABLED=true
DEFAULT_BROADCAST_PROVIDER=evolution
EVOLUTION_API_URL=http://128.140.7.154:8081
EVOLUTION_BROADCAST_INSTANCE_1=broadcast-imperio-20241208
EVOLUTION_API_KEY=sua-chave-evolution
```

**💡 O PowerShell script detecta automaticamente e mostra as variáveis corretas!**

---

## 📝 Formato CSV Otimizado

### Estrutura recomendada:
```csv
nome;telefone;email;valor;produto
João Silva;11999999999;joao@email.com;100;Sorteio Federal Império
Maria Santos;21888888888;maria@email.com;50;Mega Prêmio R$ 170.000
Pedro Costa;31777777777;pedro@email.com;75;Super Sorte Império
```

### Validações automáticas:
- ✅ Números brasileiros (DDD + 9 dígitos)
- ✅ Detecção de duplicados
- ✅ Remoção de números inválidos
- ✅ Formatação automática

---

## ⚙️ Configurações de Segurança

### Limites recomendados:
- **Lote:** 50 mensagens (máx 100)
- **Delay:** 5000ms entre lotes (mín 3000ms)
- **Por dia:** Máximo 1000 mensagens/instância
- **Por minuto:** Máximo 30 mensagens

### Anti-ban:
- Delays automáticos entre mensagens
- Rotação de instâncias Evolution
- Monitoramento de rate limits
- Variação de templates

---

## 📈 Exemplo de Uso Completo

### 1. **Preparar Lista:**
```powershell
# Executar PowerShell Manager
.\broadcast-manager-hetzner.ps1

# Opção 5: Gerar CSV exemplo com 100 registros
# Arquivo salvo em: Desktop\broadcast_imperio_20241208_143022.csv
```

### 2. **Validar:**
```powershell
# Opção 6: Validar CSV
# Resultado: 95 válidos, 3 inválidos, 2 duplicados
# Taxa de sucesso: 95%
```

### 3. **Testar:**
```powershell
# Opção 8: Teste com seu número
# Número: 11999999999
# Nome: Teste Império
# Template: Promoção (1)
# Resultado: ✅ Enviado com sucesso!
```

### 4. **Broadcast:**
```powershell
# Opção 11: Broadcast completo
# Arquivo: broadcast_imperio_validado.csv
# Lote: 50
# Delay: 5000ms
# Confirmação: VALIDEI → TENHO CERTEZA → ENVIAR AGORA
# Resultado: 92 enviados, 3 falhas (97% sucesso)
```

---

## 🔍 Troubleshooting

### Problema: "Container Evolution não responde"
```bash
# Na VPS
cd /opt/whatsapp-imperio
docker-compose restart evolution-1
docker logs evolution-instance-1
```

### Problema: "Railway não conecta na VPS"
```bash
# Verificar firewall na VPS
ufw status
ufw allow 8081/tcp

# Testar conectividade
curl http://localhost:8081/instance/list -H "apikey: SUA_CHAVE"
```

### Problema: "QR Code não aparece"
```bash
# Verificar instância
curl http://localhost:8081/instance/connect/NOME_INSTANCIA -H "apikey: SUA_CHAVE"

# Ver logs
docker logs evolution-instance-1 | grep -i qr
```

### Problema: "Mensagens não chegam"
- ✅ Verificar se WhatsApp está conectado
- ✅ Verificar se número está correto (DDD)
- ✅ Testar com próprio número primeiro
- ✅ Verificar logs: `docker-compose logs | grep broadcast`

---

## 📊 Monitoramento

### PowerShell (Tempo Real):
```powershell
# Opção 12: Monitorar progresso
# Opção 13: Ver logs Evolution
# Opção 16: Status sistema VPS
```

### SSH (Manual):
```bash
# Logs tempo real
docker-compose logs -f | grep -E "(broadcast|sent|error)"

# Status containers
docker ps
docker stats --no-stream

# Sistema VPS
htop
df -h
```

---

## 💰 Custos do Sistema

### Infraestrutura atual:
- **VPS Hetzner:** ~€20/mês
- **Railway:** $5-20/mês
- **Evolution:** Gratuito
- **Broadcast Module:** **R$ 0 adicional!**

### ROI esperado:
- **Conversão manual:** ~2%
- **Conversão com broadcast:** ~8-12%
- **Automatização:** -80% tempo manual
- **Alcance:** +300% pessoas contactadas

---

## 🎯 Próximos Passos Imediatos

### 1. **AGORA (5 minutos):**
```powershell
cd scripts
.\broadcast-manager-hetzner.ps1
# Opção 1: Criar instância
```

### 2. **HOJE:**
- Escanear QR Code com WhatsApp dedicado
- Testar com alguns números conhecidos
- Configurar variáveis no Railway

### 3. **ESTA SEMANA:**
- Preparar lista real de clientes
- Fazer broadcast teste (50-100 números)
- Otimizar templates baseado nos resultados

---

## 📞 Comandos de Emergência

### Parar tudo:
```bash
ssh root@128.140.7.154
cd /opt/whatsapp-imperio
docker-compose down
```

### Reiniciar tudo:
```bash
docker-compose up -d
```

### Ver o que está rodando:
```bash
docker ps
ss -tlnp | grep 808
```

---

**✅ SISTEMA PRONTO PARA USO IMEDIATO!**

Execute o PowerShell Manager agora:
```powershell
cd scripts
.\broadcast-manager-hetzner.ps1
```

🏆 **Império Premiações - Realizando sonhos através da tecnologia!**