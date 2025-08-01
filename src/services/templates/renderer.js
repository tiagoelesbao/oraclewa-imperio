import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../utils/logger.js';
import { getRandomVariation as getOrderPaidVariation } from './variations/order_paid_variations.js';
import { getRandomVariation as getOrderExpiredVariation } from './variations/order_expired_variations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = {};

Handlebars.registerHelper('currency', (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
});

Handlebars.registerHelper('date', (value) => {
  return new Date(value).toLocaleDateString('pt-BR');
});

export const loadTemplates = async () => {
  try {
    const templatesDir = path.join(__dirname, 'messages');
    const files = await fs.readdir(templatesDir);
    
    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const templateName = file.replace('.hbs', '');
        const templatePath = path.join(templatesDir, file);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        templates[templateName] = Handlebars.compile(templateContent);
        logger.info(`Template loaded: ${templateName}`);
      }
    }
  } catch (error) {
    logger.error('Error loading templates:', error);
    await createDefaultTemplates();
  }
};

const createDefaultTemplates = async () => {
  const defaultTemplates = {
    carrinho_abandonado: `Olá {{customerName}}! 🛒

Notamos que você deixou alguns itens incríveis no seu carrinho:
{{#each items}}
• {{this.name}} ({{this.quantity}}x)
{{/each}}

Total: {{cartTotal}}

Que tal finalizar sua compra? Seus produtos estão te esperando!
👉 {{recoveryUrl}}

Válido por 24 horas. Não perca!`,

    venda_expirada: `Oi {{customerName}}! ⏰

Sua reserva no valor de {{orderTotal}} está prestes a expirar!

Data limite: {{expirationDate}}

Finalize agora e garanta seus produtos:
👉 {{paymentUrl}}

Após o vencimento, não podemos garantir a disponibilidade dos itens.`,

    venda_aprovada: `Parabéns {{customerName}}! 🎉

Sua compra #{{orderId}} foi aprovada com sucesso!

Valor total: {{orderTotal}}

{{#if trackingCode}}
Código de rastreamento: {{trackingCode}}
{{/if}}

{{#if estimatedDelivery}}
Previsão de entrega: {{estimatedDelivery}}
{{/if}}

Produtos:
{{#each items}}
• {{this.name}} ({{this.quantity}}x)
{{/each}}

Obrigado por comprar conosco! 💚`
  };

  const templatesDir = path.join(__dirname, 'messages');
  
  try {
    await fs.mkdir(templatesDir, { recursive: true });
    
    for (const [name, content] of Object.entries(defaultTemplates)) {
      const filePath = path.join(templatesDir, `${name}.hbs`);
      await fs.writeFile(filePath, content, 'utf-8');
      templates[name] = Handlebars.compile(content);
      logger.info(`Default template created: ${name}`);
    }
  } catch (error) {
    logger.error('Error creating default templates:', error);
    
    for (const [name, content] of Object.entries(defaultTemplates)) {
      templates[name] = Handlebars.compile(content);
    }
  }
};

export const renderTemplate = async (templateName, data) => {
  // Usar variação aleatória para mensagens específicas
  if (templateName === 'order_paid' && Math.random() > 0.3) { // 70% chance de variação
    const variationTemplate = getOrderPaidVariation();
    const compiledVariation = Handlebars.compile(variationTemplate);
    logger.info('Using message variation for order_paid');
    return compiledVariation(data);
  }
  
  if (templateName === 'order_expired' && Math.random() > 0.3) { // 70% chance de variação
    const variationTemplate = getOrderExpiredVariation();
    const compiledVariation = Handlebars.compile(variationTemplate);
    logger.info('Using message variation for order_expired');
    return compiledVariation(data);
  }
  
  // Usar template padrão
  if (!templates[templateName]) {
    await loadTemplates();
  }
  
  const template = templates[templateName];
  
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  try {
    return template(data);
  } catch (error) {
    logger.error(`Error rendering template ${templateName}:`, error);
    throw error;
  }
};

loadTemplates();