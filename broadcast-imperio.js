#!/usr/bin/env node

/**
 * 🚀 BROADCAST IMPÉRIO - Evolution + Baileys
 * 
 * Sistema de disparo em massa via CSV
 * - Usa Evolution API já configurada
 * - Imagem anexada (logo OracleWA)  
 * - Mensagens personalizadas
 * - Anti-ban integrado
 * 
 * USO: node broadcast-imperio.js caminho/para/arquivo.csv
 */

import { EvolutionCSVBroadcast } from './src/modules/broadcast/services/evolution-csv-broadcast.js';
import fs from 'fs';
import path from 'path';

// Verificar argumentos
if (process.argv.length < 3) {
    console.log('❌ Uso: node broadcast-imperio.js <arquivo.csv>');
    console.log('');
    console.log('📋 Exemplo:');
    console.log('   node broadcast-imperio.js clientes.csv');
    console.log('');
    console.log('📄 Formato CSV esperado:');
    console.log('   nome,telefone,email,cidade');
    console.log('   João Silva,11999999999,joao@email.com,São Paulo');
    console.log('   Maria Santos,21888888888,maria@email.com,Rio de Janeiro');
    process.exit(1);
}

const csvFilePath = process.argv[2];

// Verificar se arquivo existe
if (!fs.existsSync(csvFilePath)) {
    console.log(`❌ Arquivo não encontrado: ${csvFilePath}`);
    process.exit(1);
}

// Template personalizado para Império
const IMPERIO_MESSAGE_TEMPLATE = `🎯 Olá *{PRIMEIRO_NOME}*!

🏆 **SORTEIO ESPECIAL DO IMPÉRIO** 🏆

💰 *Prêmios incríveis* te esperando!
🎁 Participe agora e concorra a:
   • PIX de R$ 500,00
   • Produtos exclusivos  
   • E muito mais!

📞 *Quer participar?*
Responda esta mensagem para garantir sua vaga!

✨ *Império Premiações - Realizando Sonhos* ✨

_Responda SAIR para não receber mais mensagens_`;

async function main() {
    console.log('🚀 BROADCAST IMPÉRIO - INICIANDO...');
    console.log(`📂 Arquivo CSV: ${path.basename(csvFilePath)}`);
    console.log(`📁 Caminho: ${path.resolve(csvFilePath)}`);
    console.log('');

    try {
        // Perguntar confirmação
        console.log('⚠️  ATENÇÃO: Este disparo irá enviar mensagens para TODOS os contatos do CSV!');
        console.log('💡 Certifique-se de que:');
        console.log('   ✓ O CSV está correto');
        console.log('   ✓ A instância Evolution está conectada');
        console.log('   ✓ Você tem autorização para contatar estes números');
        console.log('');
        
        // Em produção, descomentar para pedir confirmação:
        /*
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
            readline.question('Continuar? (s/N): ', resolve);
        });
        
        readline.close();
        
        if (answer.toLowerCase() !== 's') {
            console.log('❌ Broadcast cancelado pelo usuário');
            process.exit(0);
        }
        */
        
        // Inicializar sistema
        const broadcast = new EvolutionCSVBroadcast();
        
        // Executar broadcast
        const result = await broadcast.executeBroadcast(
            csvFilePath, 
            IMPERIO_MESSAGE_TEMPLATE,
            { 
                withImage: true // Incluir imagem OracleWA
            }
        );
        
        if (result.success) {
            console.log('');
            console.log('🎉 BROADCAST CONCLUÍDO COM SUCESSO!');
            console.log(`📊 Taxa de sucesso: ${result.successRate}%`);
            console.log(`⏱️  Tempo total: ${result.duration} minutos`);
            
            // Salvar relatório
            const reportPath = `broadcast-report-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
            fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
            console.log(`📄 Relatório salvo: ${reportPath}`);
        }
        
    } catch (error) {
        console.error('💥 Erro no broadcast:', error.message);
        process.exit(1);
    }
}

// Executar
main().catch(console.error);