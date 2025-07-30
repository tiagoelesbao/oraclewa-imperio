# 🚀 PRÓXIMOS PASSOS - Evolution API Própria

## ✅ O que foi feito:

1. **Criado novo gerenciador Evolution API** (`evolution-manager.js`)
   - Adaptado para trabalhar com Evolution API unificada
   - Suporta reconexão automática
   - Melhor formatação de números brasileiros

2. **Script de instalação automatizado** (`evolution-setup-vps.sh`)
   - Instala Evolution API + MongoDB + Nginx + SSL
   - Cria scripts auxiliares para gerenciamento
   - Configuração completa em minutos

3. **Atualizado código para usar novo manager**
   - `src/index.js` agora usa `evolution-manager.js`
   - `messageProcessor.js` atualizado

## 📋 PASSOS IMEDIATOS:

### 1️⃣ Configure uma VPS (Custo ~R$20/mês)
Opções recomendadas:
- **Hetzner**: €4.15/mês (2GB RAM) - Melhor custo-benefício
- **Contabo**: $5.99/mês (4GB RAM)
- **Digital Ocean**: $12/mês (2GB RAM)
- **Vultr**: $10/mês (2GB RAM)

### 2️⃣ Execute o script de instalação na VPS:
```bash
# Conecte na VPS via SSH
ssh root@seu-ip-vps

# Baixe e execute o script
wget https://raw.githubusercontent.com/tiagoelesbao/oraclewa-imperio/main/evolution-setup-vps.sh
chmod +x evolution-setup-vps.sh
sudo ./evolution-setup-vps.sh
```

### 3️⃣ Configure DNS:
No seu provedor de domínio, adicione:
```
Tipo: A
Nome: api
Valor: IP-DA-SUA-VPS
```

### 4️⃣ No Railway, configure as variáveis:
```env
# Evolution API (após instalação)
EVOLUTION_API_URL=https://api.seudominio.com
EVOLUTION_API_KEY=sua_chave_gerada_pelo_script

# Database - Railway fornece automaticamente
DATABASE_URL=${DATABASE_URL}

# Redis - Railway fornece automaticamente
REDIS_URL=${REDIS_URL}

# Outras configurações
WEBHOOK_SECRET=1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
JWT_SECRET=821c79a12ae3d39559406040127beb33a27bbe185fd3e3ba7dd340a5177bdeb6
APP_PORT=3000
NODE_ENV=production
RATE_LIMIT_PER_INSTANCE=500
LOG_LEVEL=info
```

### 5️⃣ Conecte WhatsApp (na VPS):
```bash
cd /opt/evolution

# Criar instâncias
./criar_instancias.sh

# Obter QR Codes
./obter_qrcodes.sh

# Verificar status
./verificar_status.sh
```

### 6️⃣ Configure webhooks no Império:
- **URL 1**: https://oraclewa-imperio-production.up.railway.app/api/webhook/order-expired
- **URL 2**: https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid
- **Authorization**: 1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630

## 💰 ANÁLISE DE CUSTOS:

### Opção Evolution API Própria:
- VPS Hetzner: ~R$25/mês
- Railway Hobby: $5/mês (~R$25)
- **TOTAL: ~R$50/mês**

### Comparação com Z-API:
- Z-API (4 instâncias): R$197/mês
- **Economia: R$147/mês (75% mais barato)**

## 🔧 COMANDOS ÚTEIS NA VPS:

```bash
# Ver logs Evolution API
cd /opt/evolution && docker-compose logs -f

# Reiniciar serviços
cd /opt/evolution && docker-compose restart

# Ver status das instâncias
cd /opt/evolution && ./verificar_status.sh

# Backup do MongoDB
docker exec evolution_mongo mongodump --out /backup

# Monitorar recursos
htop
docker stats
```

## ⚡ VANTAGENS DA SOLUÇÃO PRÓPRIA:

1. **Custo 75% menor** que soluções comerciais
2. **Controle total** sobre a API
3. **Sem limites** de mensagens (além dos do WhatsApp)
4. **Customização ilimitada**
5. **Dados 100% privados**
6. **Escalabilidade** sob seu controle

## 🚨 IMPORTANTE:

1. **Faça backup** regular do MongoDB
2. **Configure monitoramento** (Uptime Robot gratuito)
3. **Mantenha Evolution API atualizada**
4. **Use senhas fortes** em todas configurações

## 📞 SUPORTE:

- Evolution API Docs: https://doc.evolution-api.com
- GitHub Issues: https://github.com/EvolutionAPI/evolution-api
- Comunidade: https://evolution-api.com/discord

---

**Próximo passo:** Configure a VPS e me avise para continuarmos!