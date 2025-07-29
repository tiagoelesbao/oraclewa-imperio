# 🚀 Deploy via Terminal - Guia Completo

## 📋 Pré-requisitos

Você vai precisar:
- ✅ Conta no GitHub (gratuita)
- ✅ WSL/Ubuntu (já tem)
- ✅ Conexão com internet

## 🎯 Opção 1: Script Automatizado (RECOMENDADO)

### Execute o script:
```bash
cd oraclewa
./git-deploy.sh
```

**O script vai fazer TUDO automaticamente:**
1. ✅ Instalar Git e GitHub CLI
2. ✅ Configurar seu Git (nome/email)
3. ✅ Criar repositório no GitHub
4. ✅ Fazer upload do código
5. ✅ Instalar Railway CLI
6. ✅ Fazer deploy no Railway
7. ✅ Configurar PostgreSQL + Redis
8. ✅ Te dar as URLs finais

### Durante a execução:
- **GitHub Login**: Uma janela do navegador vai abrir
- **Railway Login**: Outra janela vai abrir
- **Perguntas**: O script vai perguntar nome do repo, etc.

## 🎯 Opção 2: Passo a Passo Manual

### 1. Instalar dependências:
```bash
# Git
sudo apt update && sudo apt install -y git

# GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install -y gh

# Railway CLI
curl -fsSL https://railway.app/install.sh | sh
```

### 2. Configurar Git:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@gmail.com"
```

### 3. Inicializar repositório:
```bash
cd oraclewa
git init
git add .
git commit -m "🚀 Initial commit - OracleWA Sistema"
```

### 4. Criar repositório no GitHub:
```bash
# Login no GitHub
gh auth login --web

# Criar repositório público
gh repo create oraclewa-imperio --public --description "🚀 OracleWA - Sistema de recuperação de vendas"

# Conectar local com GitHub
git remote add origin https://github.com/SEU-USUARIO/oraclewa-imperio.git
git branch -M main
git push -u origin main
```

### 5. Deploy no Railway:
```bash
# Login no Railway
railway login

# Criar projeto
railway init --name oraclewa-imperio

# Adicionar serviços
railway add postgresql
railway add redis

# Configurar variáveis (exemplo)
railway variables set NODE_ENV=production
railway variables set WEBHOOK_SECRET=1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
railway variables set JWT_SECRET=821c79a12ae3d39559406040127beb33a27bbe185fd3e3ba7dd340a5177bdeb6
# ... todas as outras variáveis do .env

# Deploy
railway up
```

## 🎉 Resultado Final

Você terá:

### GitHub:
```
https://github.com/seu-usuario/oraclewa-imperio
```

### Railway:
```
https://oraclewa-imperio-production.railway.app
```

### URLs dos Webhooks:
```
https://oraclewa-imperio-production.railway.app/api/webhook/order-expired
https://oraclewa-imperio-production.railway.app/api/webhook/order-paid
```

### Chave de Autorização:
```
1bee33900e61bd1a5c3e7670fe5da0ed5e97a60c2a52cd7ce562f5ffb3d87630
```

## 🔧 Comandos Úteis Pós-Deploy

### Ver logs:
```bash
railway logs --follow
```

### Atualizar código:
```bash
git add .
git commit -m "Atualização do sistema"
git push
# Railway faz redeploy automático
```

### Ver status:
```bash
railway status
```

### Configurar domínio:
```bash
railway domain
```

## 🆘 Troubleshooting

### Error: railway command not found
```bash
export PATH="$HOME/.railway/bin:$PATH"
echo 'export PATH="$HOME/.railway/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Error: gh command not found
```bash
# Reinstalar GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt update && sudo apt install -y gh
```

### Deploy falha:
```bash
# Ver logs detalhados
railway logs
# Verificar variáveis
railway variables
```

## 💡 Dicas

1. **Use o script automatizado** - é mais fácil e rápido
2. **Mantenha as chaves seguras** - não compartilhe o WEBHOOK_SECRET
3. **Teste localmente primeiro** - use `npm run dev`
4. **Monitore os logs** - use `railway logs`
5. **Backup das chaves** - salve em local seguro

## 🚀 Próximos Passos

Após o deploy:
1. **Configure webhooks** no painel Império
2. **Teste com Postman** ou cURL
3. **Configure Evolution API** (4 instâncias)
4. **Conecte WhatsApp**
5. **Monitore logs**

**Comando principal:**
```bash
./git-deploy.sh
```

Esse script faz TUDO para você! 🎯