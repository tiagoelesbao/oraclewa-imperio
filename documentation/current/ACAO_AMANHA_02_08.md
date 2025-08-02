# 🌅 Ação Imediata - Sexta 02/08/2025

**Status**: Sistema BULLETPROOF após debugging noturno ✅  
**Situação**: 1 número ativo (600 msgs/dia) vs 2000+ necessárias  
**Meta**: Adquirir números e preparar pool system  
**Update**: Lead quente implementado + todos bugs corrigidos  

---

## 🎯 **O QUE FAZER AMANHÃ (02/08)**

### **MANHÃ (9h-12h) - AQUISIÇÃO CRÍTICA**

#### **9h00 - Adquirir Números WhatsApp Business**
```
AÇÃO: Contatar operadoras para 2-3 números empresariais

📱 Vivo Empresarial: 1058
📱 Tim Empresarial: 1056  
📱 Claro Empresarial: 1052

SOLICITAR:
- 2-3 linhas WhatsApp Business
- Planos pós-pagos (não pré-pago)
- Ativação imediata se possível
- CNPJ: [Seu CNPJ da Império]
```

#### **10h00 - Configurar Evolution API**
```bash
# SSH no servidor Hetzner
ssh root@94.130.149.151

# Criar novas instâncias (quando números estiverem prontos)
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: Imperio2024@EvolutionSecure" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "imperio2", "qrcode": true}'

curl -X POST http://localhost:8080/instance/create \
  -H "apikey: Imperio2024@EvolutionSecure" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "imperio3", "qrcode": true}'
```

#### **11h00 - Preparar Código**
```bash
# Verificar se pool-manager está pronto
cat src/services/whatsapp/pool-manager.js

# Testar endpoints atuais
curl https://oraclewa-imperio-production.up.railway.app/api/status/quick
```

---

### **TARDE (14h-18h) - IMPLEMENTAÇÃO**

#### **14h00 - Conectar Números (SE chegaram)**
```
1. Acessar Evolution API: http://94.130.149.151:8080
2. Gerar QR codes para imperio2 e imperio3
3. Escanear com números novos
4. Aguardar status "open" 
5. Testar envio básico
```

#### **15h00 - Ativar Pool System**
```bash
# Editar evolution-manager.js para usar múltiplos números
# Commit e push das alterações
git add .
git commit -m "feat: activate multi-number pool system"
git push
```

#### **16h00 - Monitorar Sistema**
```bash
# Acompanhar logs Railway
# Verificar distribuição de mensagens
# Confirmar que está usando ambos números
```

#### **17h00 - Ajustar Limites**
```
Com 2 números:
- Limite por número: 600 msgs/dia cada = 1200 total
- Delays: Reduzir para 45-60s (menos conservador)
- Monitorar performance
```

---

## 📋 **CHECKLIST DO DIA**

### **Pré-requisitos**
- [ ] CNPJ da Império em mãos
- [ ] Orçamento para R$ 300-400/mês (números)
- [ ] Acesso SSH ao servidor Hetzner
- [ ] Acesso Railway para deploys

### **Manhã**
- [ ] Contatar 3 operadoras
- [ ] Solicitar números empresariais
- [ ] Anotar protocolos/previsões
- [ ] Preparar documentação CNPJ

### **Tarde (SE números chegarem)**
- [ ] Configurar instâncias Evolution
- [ ] Conectar números via QR code  
- [ ] Ativar pool-manager.js
- [ ] Testar distribuição de carga
- [ ] Monitorar primeiras horas

---

## ⏰ **CRONOGRAMA REALISTA**

### **Cenário Otimista (números hoje)**
```
9h  → Contato operadoras
10h → Ativação imediata  
11h → Configuração Evolution
14h → Conexão QR codes
15h → Pool system ativo
16h → Testes de carga
17h → Monitoramento
18h → Sistema com 2 números funcionando ✅
```

### **Cenário Realista (números segunda)**
```
9h  → Contato operadoras
10h → Protocolo abertura
11h → Aguardar ativação
14h → Preparar código
15h → Documentar processo
16h → Planejar segunda-feira
Segunda → Implementação completa
```

---

## 🚨 **CONTINGÊNCIAS**

### **Se números demorarem para chegar**
1. **Continuar operando** com 1 número (sistema funciona)
2. **Monitorar volumes** reais vs limites  
3. **Preparar código** para quando números chegarem
4. **Contactar outras operadoras** como backup

### **Se houver problemas técnicos**
1. **Sistema atual continua** funcionando normalmente
2. **Rollback rápido** se necessário
3. **Logs detalhados** para debugging
4. **Suporte via Evolution API** se necessário

---

## 📊 **MÉTRICAS PARA ACOMPANHAR**

### **Durante Implementação**
- Status conexão dos números novos
- Distribuição de mensagens entre instâncias  
- Tempo de resposta dos webhooks
- Logs de erro ou falha

### **Fim do Dia**
- Quantos números operacionais
- Capacidade total (msgs/dia)
- Taxa de sucesso dos envios
- Próximos passos para sábado/segunda

---

## 🎯 **RESULTADO ESPERADO**

### **Cenário Mínimo**
- 2 números adquiridos (mesmo que não conectados)
- Processo de ativação iniciado
- Código preparado para segunda

### **Cenário Ideal**  
- 2-3 números ativos e conectados
- Pool system funcionando  
- Capacidade: 1200-1800 msgs/dia
- Sistema pronto para volume real

---

## 💡 **DICAS IMPORTANTES**

1. **NÃO tenha pressa** - melhor fazer bem feito
2. **DOCUMENTE tudo** - processos, protocolos, senhas
3. **TESTE gradualmente** - não ative tudo de uma vez
4. **MONITORE sempre** - primeiras horas são críticas
5. **TENHA backup** - sistema atual continua funcionando

---

## 📱 **CONTATOS ÚTEIS**

### **Operadoras**
- **Vivo**: 1058 (empresarial)
- **Tim**: 1056 (empresarial)  
- **Claro**: 1052 (empresarial)

### **Técnico**  
- **Evolution API**: http://94.130.149.151:8080
- **Sistema**: https://oraclewa-imperio-production.up.railway.app
- **Logs**: Railway Dashboard

---

**Prioridade #1**: Números WhatsApp Business  
**Prioridade #2**: Pool system funcionando  
**Meta**: Dobrar capacidade do sistema  

---

*"Hoje é o dia de escalar para o próximo nível!"* 🚀