# OracleWA - Sistema de Automação WhatsApp

Sistema avançado de automação para WhatsApp Business com estratégias anti-ban e gestão inteligente de pools.

## 🚀 Status Atual do Projeto

- **Versão**: 2.2.0
- **Status**: OPERACIONAL - Modo Emergencial
- **Última atualização**: 01/08/2025
- **Números ativos**: 1 (imperio1)
- **Capacidade**: 800 msgs/dia (limitado por segurança)
- **Volume solicitado**: 2000 msgs/dia
- **Sobrecarga**: 150%

## ⚠️ **SITUAÇÃO CRÍTICA**

Sistema operando com 1 número apenas. **NECESSÁRIO**:
1. Adquirir 2-3 números WhatsApp Business
2. Implementar pool system (código já pronto)
3. Reduzir risco de ponto único de falha

## 🛡️ **Sistemas Anti-Ban Implementados**

✅ **Warmup Manager**: Aquecimento gradual de 7 dias  
✅ **Rate Limiting**: 45-90s entre mensagens  
✅ **Horário Comercial**: 9h-20h apenas  
✅ **Variações de Mensagem**: 3 templates por tipo  
✅ **Cooldown Destinatários**: 24h entre campanhas  
✅ **Detecção Automática**: Adapta-se ao número de instâncias  

## 📋 **Documentação**

### **Situação Atual e Próximos Passos**
- [`SITUACAO_ATUAL_COMPLETA.md`](SITUACAO_ATUAL_COMPLETA.md) - Análise completa da situação
- [`PROXIMOS_PASSOS_PRATICOS.md`](PROXIMOS_PASSOS_PRATICOS.md) - Ações imediatas a fazer

### **Planejamento Estratégico**
- [`PLANEJAMENTO_ESTRATEGICO_ORACLEWA.md`](PLANEJAMENTO_ESTRATEGICO_ORACLEWA.md) - Roadmap completo
- [`GUIA_IMPLEMENTACAO_POOLS.md`](GUIA_IMPLEMENTACAO_POOLS.md) - Sistema de pools (futuro)
- [`ESTRATEGIAS_ANTI_BAN.md`](ESTRATEGIAS_ANTI_BAN.md) - Medidas implementadas

### **Documentação Técnica**
- [`documentation/`](documentation/) - Guias de setup, deploy e configuração

## 🔧 **Arquitetura Atual**

```
                                                              
   Império Panel     →  OracleWA API        →  Evolution API  
   (Webhooks)           (Railway)              (Hetzner)     
                                                              
                               │
                               ▼
                        1 Número WhatsApp
                        (imperio1)
```

## 🎯 **Próxima Ação Crítica**

**VOCÊ DEVE FAZER HOJE:**

1. **Implementar limite emergencial**: 800 msgs/dia
2. **Adquirir 2-3 números** WhatsApp Business
3. **Monitorar intensivamente** por 7 dias

Veja [`PROXIMOS_PASSOS_PRATICOS.md`](PROXIMOS_PASSOS_PRATICOS.md) para instruções detalhadas.

## 📊 **Métricas de Sucesso**

- **Taxa de entrega**: >95%
- **Zero bans**: 7+ dias consecutivos
- **Uptime**: >99.5%
- **Latência**: <2 minutos

## 🚨 **Alertas Ativos**

- ⚠️ **Volume 2x acima da capacidade segura**
- ⚠️ **Ponto único de falha (1 número)**
- ⚠️ **Risco de ban elevado sem diversificação**

---

**Última revisão**: 01/08/2025  
**Status**: Sistema funcional mas em risco - Ação imediata necessária