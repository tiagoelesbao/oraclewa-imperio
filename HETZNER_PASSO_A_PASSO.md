# 🖥️ Guia Completo - Configuração VPS Hetzner para Evolution API

## 📌 Por que Hetzner?
- **Melhor custo-benefício** do mercado
- **Datacenter na Alemanha** (baixa latência para Brasil)
- **Hardware de qualidade** superior
- **Suporte 24/7** eficiente

## 🎯 PASSO A PASSO DETALHADO

### 1️⃣ ESCOLHER O SERVIDOR CORRETO

Na página da Hetzner, clique em **"CLOUD"** no menu superior.

O serviço correto é: **Hetzner Cloud VPS**

### 2️⃣ CRIAR CONTA HETZNER

1. Clique em **"Cloud"** no menu
2. Clique em **"Get started for free"** ou **"Sign up"**
3. Preencha:
   - Email
   - Senha forte
   - Confirme o email

### 3️⃣ CONFIGURAR NOVO SERVIDOR

Após login no painel Hetzner Cloud:

1. **Clique em "+ New Project"**
   - Nome: `evolution-api-imperio`
   - Clique em "Create"

2. **Clique em "+ Add Server"**

3. **Location (Localização):**
   - Escolha: **Nuremberg** ou **Falkenstein** (Alemanha)
   - Ambos têm ótima latência para Brasil

4. **Image (Sistema Operacional):**
   - Escolha: **Ubuntu 22.04**

5. **Type (Tipo de Servidor):**
   ```
   ESCOLHA: CX22 (Recomendado)
   - 2 vCPU (AMD)
   - 4 GB RAM
   - 40 GB SSD
   - €4.35/mês (~R$25)
   
   Alternativa econômica: CX11
   - 1 vCPU
   - 2 GB RAM  
   - 20 GB SSD
   - €3.29/mês (~R$19)
   ```

6. **Volume (Armazenamento Extra):**
   - Pule esta parte (não precisa)

7. **Network (Rede):**
   - Deixe IPv4 e IPv6 marcados

8. **Firewalls:**
   - Por enquanto, pule

9. **Additional features:**
   - ✅ Marque "Backups" (+20% do valor, ~€0.87)
   - Recomendo para segurança

10. **SSH Keys:**
    - Se você tem uma chave SSH, adicione
    - Se não, pode usar senha (próximo passo)

11. **Name:**
    - Nome: `evolution-imperio`

12. **Labels:** (Opcional)
    - Adicione tags se quiser

13. **Cloud-Init:** (Pule)

14. Clique em **"Create & Buy now"**

### 4️⃣ CONFIGURAR ACESSO

Após criar o servidor:

1. **Anote o IP do servidor** (ex: 157.90.xxx.xxx)

2. **Definir senha root** (se não usou SSH key):
   - Clique no servidor criado
   - Vá em "Console" 
   - Clique em "Reset root password"
   - Anote a senha gerada

### 5️⃣ CONECTAR AO SERVIDOR

**Windows (PowerShell/Terminal):**
```bash
ssh root@SEU_IP_AQUI
```

**Primeira conexão:**
```
The authenticity of host '157.90.xxx.xxx' can't be established.
Are you sure you want to continue connecting (yes/no)? yes
```

Digite a senha quando solicitado.

### 6️⃣ EXECUTAR SCRIPT DE INSTALAÇÃO

Agora no terminal SSH:

```bash
# Atualizar sistema primeiro
apt update && apt upgrade -y

# Baixar nosso script
cd ~
wget https://raw.githubusercontent.com/tiagoelesbao/oraclewa-imperio/main/evolution-setup-vps.sh

# Dar permissão de execução
chmod +x evolution-setup-vps.sh

# Executar o script
./evolution-setup-vps.sh
```

O script vai perguntar:
1. **Domínio:** Digite seu domínio (ex: `api.seudominio.com`)
2. **API Key:** Crie uma senha forte (anote!)
3. **Email:** Para certificado SSL

### 7️⃣ CONFIGURAR DNS

Enquanto o script roda, configure o DNS:

1. Acesse seu provedor de domínio (Registro.br, GoDaddy, etc)
2. Adicione um registro:
   ```
   Tipo: A
   Nome: api
   Valor: IP_DO_SEU_SERVIDOR_HETZNER
   TTL: 300
   ```

### 8️⃣ APÓS INSTALAÇÃO

O script criará automaticamente:
- Evolution API rodando
- MongoDB para dados
- Nginx com SSL
- Scripts auxiliares em `/opt/evolution/`

### 9️⃣ CRIAR INSTÂNCIAS WHATSAPP

```bash
cd /opt/evolution

# Criar 4 instâncias
./criar_instancias.sh

# Gerar QR Codes
./obter_qrcodes.sh

# Ver QR Codes (precisa baixar os PNGs)
ls -la *.png
```

### 🔟 BAIXAR QR CODES PARA WINDOWS

No seu Windows (PowerShell):
```powershell
# Criar pasta para QR codes
mkdir C:\QRCodes
cd C:\QRCodes

# Baixar cada QR Code
scp root@SEU_IP:/opt/evolution/qrcode_imperio_1.png .
scp root@SEU_IP:/opt/evolution/qrcode_imperio_2.png .
scp root@SEU_IP:/opt/evolution/qrcode_imperio_3.png .
scp root@SEU_IP:/opt/evolution/qrcode_imperio_4.png .
```

## 💰 CUSTOS FINAIS HETZNER

### Servidor CX22 (Recomendado):
- Servidor: €4.35/mês
- Backup: €0.87/mês
- **Total: €5.22/mês (~R$30)**

### Servidor CX11 (Econômico):
- Servidor: €3.29/mês
- Backup: €0.66/mês
- **Total: €3.95/mês (~R$23)**

## 🛡️ SEGURANÇA ADICIONAL

Após tudo funcionando, configure firewall:

```bash
# No servidor Hetzner
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
```

No painel Hetzner:
1. Vá em "Firewalls"
2. Crie novo firewall
3. Adicione regras:
   - SSH (22) - Seu IP apenas
   - HTTP (80) - Todos
   - HTTPS (443) - Todos

## 📱 MONITORAMENTO

Configure monitoramento gratuito:

1. **UptimeRobot.com** (gratuito)
   - Monitor HTTPS: `https://api.seudominio.com/health`
   - Alertas por email/SMS

2. **Hetzner Monitoring** (no painel)
   - Ative notificações
   - Configure alertas de CPU/RAM

## 🚨 COMANDOS ÚTEIS

```bash
# Ver logs Evolution
docker logs -f evolution_api

# Reiniciar Evolution
docker restart evolution_api

# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Backup manual MongoDB
docker exec evolution_mongo mongodump --out /backup

# Atualizar Evolution API
cd /opt/evolution
docker-compose pull
docker-compose up -d
```

## ❓ TROUBLESHOOTING

**Problema: "Connection refused"**
```bash
# Verificar se Evolution está rodando
docker ps
# Se não estiver, iniciar:
cd /opt/evolution && docker-compose up -d
```

**Problema: "QR Code não aparece"**
```bash
# Recriar instância
curl -X DELETE "https://api.seudominio.com/instance/imperio_1" \
  -H "apikey: SUA_API_KEY"
# Depois criar novamente
```

**Problema: "SSL não funciona"**
```bash
# Renovar certificado
certbot renew --nginx
```

## 🎯 PRÓXIMOS PASSOS

1. ✅ Servidor Hetzner configurado
2. ✅ Evolution API rodando
3. ✅ 4 WhatsApps conectados
4. ➡️ Configurar Railway com as variáveis:
   ```
   EVOLUTION_API_URL=https://api.seudominio.com
   EVOLUTION_API_KEY=sua_chave_do_script
   ```

---

**Dúvidas?** O suporte Hetzner responde em inglês 24/7 via ticket!