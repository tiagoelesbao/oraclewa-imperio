# 🎯 Próximos Passos Práticos - OracleWA

**Data**: 01/08/2025  
**Situação**: 1 número ativo, sobrecarga de 100%  
**Urgência**: CRÍTICA  

---

## 🚨 **AÇÕES IMEDIATAS (Hoje)**

### **1. Implementar Limite Emergencial**
**Tempo**: 15 minutos  
**Prioridade**: CRÍTICA  

```bash
# Editar configuração do warmup manager
# Reduzir de 1000 para 800 msgs/dia temporariamente
```

**Como fazer:**
1. Abrir `src/services/whatsapp/warmup-manager.js`
2. Alterar limite diário de 1000 para 800
3. Fazer deploy
4. Monitorar por 24h

### **2. Configurar Monitoramento Intensivo**
**Tempo**: 20 minutos  
**Prioridade**: ALTA  

**Como fazer:**
1. Verificar status a cada 15 minutos
2. Anotar horários de maior tráfego
3. Identificar padrões de falha

**Comandos de monitoramento:**
```bash
# Status das instâncias
curl -H "apikey: Imperio2024@EvolutionSecure" http://localhost:8080/instance/fetchInstances

# Status do sistema
curl https://oraclewa-imperio-production.up.railway.app/api/webhook/status
```

### **3. Priorizar Mensagens**
**Tempo**: 30 minutos  
**Prioridade**: ALTA  

**Regra implementar:**
- **Aprovadas**: Envio imediato
- **Expiradas**: Após 2 horas (delay)
- **Filtro**: Apenas pedidos >R$ 50

---

## 📅 **CRONOGRAMA SEMANAL**

### **Segunda-feira (05/08)**
- [ ] **9h**: Implementar limite 800 msgs
- [ ] **10h**: Testar monitoramento 
- [ ] **14h**: Verificar taxa de entrega
- [ ] **18h**: Análise do primeiro dia

### **Terça-feira (06/08)**
- [ ] **9h**: Adquirir 2 números WhatsApp Business
- [ ] **11h**: Configurar primeiro número backup
- [ ] **15h**: Iniciar aquecimento gradual
- [ ] **17h**: Testes de conectividade

### **Quarta-feira (07/08)**
- [ ] **9h**: Configurar segundo número
- [ ] **11h**: Implementar rotação básica
- [ ] **14h**: Testes de carga distribuída
- [ ] **16h**: Ajustar delays e limites

### **Quinta-feira (08/08)**
- [ ] **9h**: Ativar pool de 2 números
- [ ] **11h**: Migrar 50% do tráfego
- [ ] **14h**: Monitorar performance
- [ ] **16h**: Ajustes finos

### **Sexta-feira (09/08)**
- [ ] **9h**: Full migration (100% tráfego)
- [ ] **11h**: Validar métricas
- [ ] **14h**: Documentar lições
- [ ] **16h**: Planejar semana 2

---

## 💡 **IMPLEMENTAÇÕES TÉCNICAS**

### **1. Código para Limite Emergencial**

```javascript
// src/services/whatsapp/warmup-manager.js
async getDailyLimit(instanceName) {
  // EMERGENCIAL: Reduzir limite
  const EMERGENCY_MODE = true;
  const EMERGENCY_LIMIT = 800;
  
  if (EMERGENCY_MODE) {
    logger.warn(`EMERGENCY MODE: Limiting to ${EMERGENCY_LIMIT} msgs/day`);
    return EMERGENCY_LIMIT;
  }
  
  // ... resto do código existente
}
```

### **2. Delays Aumentados**

```javascript
async getRecommendedDelay(instanceName) {
  // EMERGENCIAL: Delays maiores
  const EMERGENCY_MIN_DELAY = 45000; // 45s
  const EMERGENCY_MAX_DELAY = 90000; // 90s
  
  return EMERGENCY_MIN_DELAY + Math.random() * (EMERGENCY_MAX_DELAY - EMERGENCY_MIN_DELAY);
}
```

### **3. Filtro de Prioridade**

```javascript
// src/controllers/webhookController.js
const shouldProcessMessage = (data) => {
  // Só processar pedidos de valor alto em modo emergencial
  const orderValue = parseFloat(data.valor || data.total || 0);
  const MIN_VALUE = 50; // R$ 50
  
  if (orderValue < MIN_VALUE) {
    logger.info(`Skipping low value order: R$ ${orderValue}`);
    return false;
  }
  
  return true;
};
```

---

## 🔍 **MÉTRICAS PARA ACOMPANHAR**

### **Diárias**
- [ ] Número de mensagens enviadas
- [ ] Taxa de entrega (>95%)
- [ ] Número de erros/falhas
- [ ] Status da conexão WhatsApp

### **Semanais**
- [ ] Performance por número
- [ ] Horários de pico
- [ ] Padrões de falha
- [ ] ROI das implementações

---

## 🛒 **LISTA DE COMPRAS**

### **Números WhatsApp Business**
- [ ] **2-3 chips** de operadoras diferentes
- [ ] **Planos empresariais** (não pré-pago)
- [ ] **Verificação** em nomes empresariais
- [ ] **Backup** para rotação

**Investimento estimado**: R$ 200-300/mês

### **Infraestrutura (Opcional)**
- [ ] **Servidor backup** (Hetzner)
- [ ] **Monitoramento** premium (UptimeRobot)
- [ ] **Dashboard** basic (Grafana Cloud)

**Investimento estimado**: R$ 150/mês

---

## ⚡ **COMANDOS PRÁTICOS**

### **Deploy das Alterações**
```bash
git add .
git commit -m "feat: emergency limits and prioritization"
# Railway faz deploy automático
```

### **Verificar Logs em Tempo Real**
```bash
# Railway Dashboard > Logs
# Filtrar por "EMERGENCY" ou "WARNING"
```

### **Teste Manual**
```bash
# Simular webhook de teste
curl -X POST https://oraclewa-imperio-production.up.railway.app/api/webhook/order-paid \
  -H "Content-Type: application/json" \
  -d '{"event":"order.paid","data":{"user":{"name":"Teste","phone":"11999999999"},"product":{"title":"Teste"}}}'
```

---

## 🎯 **RESULTADO ESPERADO EM 7 DIAS**

✅ **Zero bans** por 7 dias consecutivos  
✅ **Taxa de entrega >95%**  
✅ **Latência <2 minutos**  
✅ **2-3 números** operacionais  
✅ **Capacidade para 2000+ msgs/dia**  

---

## 🚨 **PLANO DE CONTINGÊNCIA**

### **Se Número Atual for Banido**
1. **Pausar sistema** (webhook off)
2. **Ativar número backup**
3. **Reduzir volume 50%**
4. **Investigar causa**
5. **Aguardar 48h** antes de retomar volume

### **Se Sistema Sobrecarregar**
1. **Ativar filtros** de valor mínimo
2. **Aumentar delays** para 2-3 minutos
3. **Priorizar apenas** mensagens aprovadas
4. **Adquirir números** urgentemente

---

**Próxima revisão**: 05/08/2025 (segunda-feira)  
**Responsável**: Implementar ações imediatas hoje mesmo