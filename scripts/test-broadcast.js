#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.BROADCAST_API_KEY || 'your-api-key';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask questions
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Main test menu
async function mainMenu() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}
╔════════════════════════════════════════════╗
║     🚀 OracleWA - Teste de Broadcast       ║
║          Sistema Evolution (Gratuito)       ║
╚════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`${colors.yellow}Escolha uma opção:${colors.reset}
  
${colors.green}1${colors.reset} - 📱 Configurar nova instância Evolution
${colors.green}2${colors.reset} - 🔍 Verificar status da conexão
${colors.green}3${colors.reset} - 📝 Gerar CSV de exemplo
${colors.green}4${colors.reset} - ✅ Validar arquivo CSV
${colors.green}5${colors.reset} - 🧪 Teste com 1 número
${colors.green}6${colors.reset} - 📨 Enviar broadcast via CSV
${colors.green}7${colors.reset} - 📊 Ver templates disponíveis
${colors.green}8${colors.reset} - 💰 Calcular custos
${colors.green}9${colors.reset} - 📚 Guia rápido
${colors.green}0${colors.reset} - Sair
`);

  const choice = await question('Opção: ');
  
  switch(choice) {
    case '1':
      await setupInstance();
      break;
    case '2':
      await checkStatus();
      break;
    case '3':
      await generateSampleCSV();
      break;
    case '4':
      await validateCSV();
      break;
    case '5':
      await testSingleNumber();
      break;
    case '6':
      await sendCSVBroadcast();
      break;
    case '7':
      await showTemplates();
      break;
    case '8':
      await calculateCosts();
      break;
    case '9':
      await showQuickGuide();
      break;
    case '0':
      console.log(`${colors.green}✅ Até logo!${colors.reset}`);
      rl.close();
      process.exit(0);
    default:
      console.log(`${colors.red}❌ Opção inválida!${colors.reset}`);
      await waitForEnter();
      await mainMenu();
  }
}

// 1. Setup Evolution instance
async function setupInstance() {
  console.log(`\n${colors.cyan}📱 Configurando Nova Instância Evolution${colors.reset}\n`);
  
  console.log(`${colors.yellow}⚠️  IMPORTANTE:${colors.reset}
- Use um número WhatsApp dedicado para broadcast
- Não use o mesmo número do sistema principal
- Mantenha o WhatsApp conectado e ativo
`);

  const confirm = await question('Deseja continuar? (s/n): ');
  if (confirm.toLowerCase() !== 's') {
    await mainMenu();
    return;
  }

  console.log(`\n${colors.green}Executando script de configuração...${colors.reset}`);
  
  // Execute setup script
  const setupScript = path.join(__dirname, 'setup-broadcast-instance.sh');
  if (fs.existsSync(setupScript)) {
    const { exec } = await import('child_process');
    exec(`bash ${setupScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`${colors.red}Erro: ${error}${colors.reset}`);
      } else {
        console.log(stdout);
      }
    });
  } else {
    console.log(`${colors.red}Script de setup não encontrado!${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 2. Check connection status
async function checkStatus() {
  console.log(`\n${colors.cyan}🔍 Verificando Status da Conexão${colors.reset}\n`);

  try {
    const response = await axios.get(`${API_URL}/api/broadcast/status`);
    const status = response.data.status;

    console.log(`${colors.green}✅ Status obtido com sucesso:${colors.reset}\n`);
    
    if (status.available && status.available.length > 0) {
      status.available.forEach(provider => {
        const statusIcon = provider.status.connected ? '🟢' : '🔴';
        console.log(`${statusIcon} ${provider.name}: ${provider.status.connected ? 'Conectado' : 'Desconectado'}`);
        
        if (provider.provider === 'evolution' && provider.status.totalInstances) {
          console.log(`   Instâncias: ${provider.status.connectedInstances}/${provider.status.totalInstances}`);
          console.log(`   Health: ${provider.status.healthPercentage}%`);
        }
      });
    } else {
      console.log(`${colors.yellow}⚠️  Nenhum provider disponível${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao verificar status: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 3. Generate sample CSV
async function generateSampleCSV() {
  console.log(`\n${colors.cyan}📝 Gerar CSV de Exemplo${colors.reset}\n`);

  const count = await question('Quantos registros? (padrão: 10): ') || '10';

  try {
    const response = await axios.get(`${API_URL}/api/broadcast/csv/sample?recordCount=${count}`);
    
    console.log(`${colors.green}✅ CSV gerado com sucesso!${colors.reset}`);
    console.log(`Arquivo: ${response.data.file}`);
    console.log(`Registros: ${response.data.recordCount}`);
    
    // Show sample content
    const csvContent = fs.readFileSync(response.data.file, 'utf8');
    const lines = csvContent.split('\n').slice(0, 6);
    
    console.log(`\n${colors.yellow}Prévia do arquivo:${colors.reset}`);
    lines.forEach(line => console.log(line));
    
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao gerar CSV: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 4. Validate CSV
async function validateCSV() {
  console.log(`\n${colors.cyan}✅ Validar Arquivo CSV${colors.reset}\n`);

  const csvPath = await question('Caminho do arquivo CSV: ');

  if (!fs.existsSync(csvPath)) {
    console.log(`${colors.red}❌ Arquivo não encontrado!${colors.reset}`);
    await waitForEnter();
    await mainMenu();
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/api/broadcast/csv/validate`, {
      csvPath: csvPath
    });

    const stats = response.data.stats;
    
    console.log(`\n${colors.green}✅ Validação completa:${colors.reset}`);
    console.log(`Total de linhas: ${stats.totalRows}`);
    console.log(`Telefones válidos: ${colors.green}${stats.validPhones}${colors.reset}`);
    console.log(`Telefones inválidos: ${colors.red}${stats.invalidPhones}${colors.reset}`);
    console.log(`Duplicados: ${colors.yellow}${stats.duplicates}${colors.reset}`);

    if (response.data.invalid.length > 0) {
      console.log(`\n${colors.yellow}Exemplos de números inválidos:${colors.reset}`);
      response.data.invalid.slice(0, 3).forEach(item => {
        console.log(`  ❌ ${item.phone || item.telefone} - ${item.reason}`);
      });
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao validar CSV: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 5. Test with single number
async function testSingleNumber() {
  console.log(`\n${colors.cyan}🧪 Teste com 1 Número${colors.reset}\n`);

  const phone = await question('Digite o número (com DDD): ');
  const name = await question('Nome do contato (opcional): ') || 'Teste';

  console.log(`\n${colors.yellow}Templates disponíveis:${colors.reset}`);
  console.log('1 - Promoção (padrão)');
  console.log('2 - Carrinho abandonado');
  console.log('3 - Convite VIP');
  console.log('4 - Lembrete de sorteio');
  
  const templateChoice = await question('Escolha o template (1-4): ') || '1';
  
  const templates = {
    '1': 'promotional_evolution',
    '2': 'abandoned_cart_evolution',
    '3': 'vip_invite_evolution',
    '4': 'contest_reminder_evolution'
  };

  const template = templates[templateChoice] || 'promotional_evolution';

  try {
    console.log(`\n${colors.yellow}Enviando mensagem...${colors.reset}`);
    
    const response = await axios.post(`${API_URL}/api/broadcast/csv/test`, {
      phones: [phone],
      template: template,
      templateData: {
        userName: name,
        availableQuotas: '150',
        promotionDetails: '🎯 3 cotas por R$ 25\n🔥 Desconto de 50%'
      },
      testMode: true
    });

    if (response.data.results[0].status === 'sent') {
      console.log(`${colors.green}✅ Mensagem enviada com sucesso!${colors.reset}`);
      console.log(`ID: ${response.data.results[0].messageId}`);
    } else {
      console.log(`${colors.red}❌ Falha ao enviar: ${response.data.results[0].error}${colors.reset}`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erro no teste: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 6. Send CSV broadcast
async function sendCSVBroadcast() {
  console.log(`\n${colors.cyan}📨 Enviar Broadcast via CSV${colors.reset}\n`);

  console.log(`${colors.yellow}⚠️  ATENÇÃO:${colors.reset}`);
  console.log('Este comando enviará mensagens para TODOS os números no CSV!');
  console.log('Certifique-se de ter validado o arquivo antes.\n');

  const csvPath = await question('Caminho do arquivo CSV: ');

  if (!fs.existsSync(csvPath)) {
    console.log(`${colors.red}❌ Arquivo não encontrado!${colors.reset}`);
    await waitForEnter();
    await mainMenu();
    return;
  }

  const batchSize = await question('Tamanho do lote (padrão: 50): ') || '50';
  const delayMs = await question('Delay entre lotes em ms (padrão: 5000): ') || '5000';

  const confirm = await question(`\n${colors.red}Confirma o envio? (digite ENVIAR): ${colors.reset}`);
  
  if (confirm !== 'ENVIAR') {
    console.log('Envio cancelado.');
    await waitForEnter();
    await mainMenu();
    return;
  }

  try {
    console.log(`\n${colors.yellow}Processando broadcast...${colors.reset}`);
    
    const response = await axios.post(`${API_URL}/api/broadcast/csv/process`, {
      csvPath: csvPath,
      template: 'promotional_evolution',
      templateData: {
        availableQuotas: '150',
        promotionDetails: '🎯 Oferta especial limitada!'
      },
      options: {
        batchSize: parseInt(batchSize),
        delayMs: parseInt(delayMs)
      }
    });

    const summary = response.data.summary;
    
    console.log(`\n${colors.green}✅ Broadcast concluído!${colors.reset}`);
    console.log(`Total de contatos: ${summary.totalContacts}`);
    console.log(`Enviados: ${colors.green}${summary.sent}${colors.reset}`);
    console.log(`Falhas: ${colors.red}${summary.failed}${colors.reset}`);
    console.log(`Duração: ${Math.round(summary.duration / 1000)}s`);
    console.log(`\nResultados salvos em: ${summary.resultsFile}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro no broadcast: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 7. Show templates
async function showTemplates() {
  console.log(`\n${colors.cyan}📊 Templates Disponíveis${colors.reset}\n`);

  try {
    const response = await axios.get(`${API_URL}/api/broadcast/templates/all?provider=evolution`);
    
    console.log(`${colors.green}Templates Evolution (CTAs otimizadas):${colors.reset}\n`);
    
    response.data.templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   CTAs: ${template.ctaCount || 0} opções interativas`);
      console.log('');
    });

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao buscar templates: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 8. Calculate costs
async function calculateCosts() {
  console.log(`\n${colors.cyan}💰 Calcular Custos${colors.reset}\n`);

  const messageCount = await question('Quantidade de mensagens por mês: ') || '1000';

  try {
    const response = await axios.get(`${API_URL}/api/broadcast/providers/costs?messageCount=${messageCount}`);
    const costs = response.data.costs;

    console.log(`\n${colors.green}Comparação de custos para ${messageCount} mensagens/mês:${colors.reset}\n`);
    
    console.log(`${colors.cyan}Evolution API (Recomendado):${colors.reset}`);
    console.log(`  Custo fixo: R$ ${costs.evolution.fixed}`);
    console.log(`  Custo variável: R$ ${costs.evolution.variable}`);
    console.log(`  ${colors.green}Total: R$ ${costs.evolution.total}${colors.reset}`);
    console.log(`  ✅ Ilimitado sem custo adicional!\n`);

    if (costs.zapi) {
      console.log(`${colors.yellow}Z-API (Botões nativos):${colors.reset}`);
      console.log(`  Custo fixo: R$ ${costs.zapi.fixed}`);
      console.log(`  Custo variável: R$ ${costs.zapi.variable.toFixed(2)}`);
      console.log(`  Total: R$ ${costs.zapi.total.toFixed(2)}`);
      console.log(`  ⚠️  Custo adicional para botões interativos`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao calcular custos: ${error.message}${colors.reset}`);
  }

  await waitForEnter();
  await mainMenu();
}

// 9. Quick guide
async function showQuickGuide() {
  console.log(`\n${colors.cyan}📚 Guia Rápido de Uso${colors.reset}\n`);
  
  console.log(`${colors.green}PASSO 1: Configurar Instância${colors.reset}
• Use a opção 1 para configurar uma nova instância Evolution
• Use um número WhatsApp dedicado para broadcast
• Escaneie o QR Code quando solicitado

${colors.green}PASSO 2: Preparar Lista CSV${colors.reset}
• Formato: nome;telefone;email;valor;produto
• Telefone: incluir DDD (ex: 11999999999)
• Use opção 3 para gerar exemplo
• Use opção 4 para validar

${colors.green}PASSO 3: Testar${colors.reset}
• Use opção 5 para teste com 1 número
• Verifique se a mensagem chegou corretamente

${colors.green}PASSO 4: Enviar Broadcast${colors.reset}
• Use opção 6 para envio em massa
• Configure tamanho do lote (recomendado: 50)
• Configure delay entre lotes (recomendado: 5000ms)

${colors.yellow}DICAS IMPORTANTES:${colors.reset}
• Mantenha o WhatsApp sempre conectado
• Não envie mais de 1000 msgs/dia por número
• Use delays para evitar bloqueios
• Monitore o status regularmente (opção 2)
• Evolution é gratuito e ilimitado!

${colors.cyan}FORMATO CSV ESPERADO:${colors.reset}
nome;telefone;email;valor;produto
João Silva;11999999999;joao@email.com;100;Sorteio Federal
Maria Santos;21888888888;maria@email.com;50;Mega Prêmio
`);

  await waitForEnter();
  await mainMenu();
}

// Helper function to wait for Enter
async function waitForEnter() {
  await question(`\n${colors.yellow}Pressione ENTER para continuar...${colors.reset}`);
}

// Start the application
console.log(`${colors.green}Iniciando sistema de teste...${colors.reset}`);
mainMenu().catch(error => {
  console.error(`${colors.red}Erro fatal: ${error}${colors.reset}`);
  process.exit(1);
});