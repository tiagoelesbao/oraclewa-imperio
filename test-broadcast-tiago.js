#!/usr/bin/env node

/**
 * 🧪 TESTE DE BROADCAST - TIAGO
 * Envia mensagem de teste com imagem
 */

import { EvolutionCSVBroadcast } from './src/modules/broadcast/services/evolution-csv-broadcast.js';

const CSV_PATH = './src/modules/broadcast/templates/Listas/teste-tiago.csv';

const MESSAGE_TEMPLATE = `🧪 *TESTE DE BROADCAST - IMPÉRIO*

Olá {PRIMEIRO_NOME}! 👋

✅ Sistema de broadcast funcionando
🖼️ Imagem anexada corretamente
📱 Evolution API + Baileys ativo

🎯 *Funcionalidades testadas:*
• Personalização de mensagem
• Envio com imagem (logo OracleWA)
• Sistema anti-ban configurado
• CSV processado com sucesso

_Este é um teste do sistema de broadcast_

*OracleWA™ - Sistema de Recuperação*`;

async function runTest() {
    console.log('🧪 INICIANDO TESTE DE BROADCAST PARA TIAGO');
    console.log('📱 Número: 5511959761948');
    console.log('=' .repeat(50));
    
    try {
        const broadcast = new EvolutionCSVBroadcast();
        
        // Configurar para teste (sem delays longos)
        broadcast.antiBreachConfig = {
            minDelay: 1000,    // 1 segundo para teste
            maxDelay: 2000,    // 2 segundos para teste  
            batchSize: 10,
            batchBreak: 5000   // 5 segundos para teste
        };
        
        console.log('📤 Enviando mensagem de teste...\n');
        
        const result = await broadcast.executeBroadcast(
            CSV_PATH,
            MESSAGE_TEMPLATE,
            { withImage: true }
        );
        
        if (result.success && result.stats.sent > 0) {
            console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
            console.log('📱 Verifique seu WhatsApp');
        } else {
            console.log('\n❌ Teste falhou - verifique os logs acima');
        }
        
    } catch (error) {
        console.error('\n💥 Erro no teste:', error.message);
        console.error('Detalhes:', error);
    }
}

// Executar teste
console.log('🚀 Executando teste de broadcast...\n');
runTest();