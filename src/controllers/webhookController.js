import logger from '../utils/logger.js';
import { addMessageToQueue } from '../services/queue/manager.js';
import { renderTemplate } from '../services/templates/renderer.js';
import { handleButtonClick as processButtonClick } from '../services/templates/button-options.js';
import { sendMessage } from '../services/whatsapp/evolution-manager.js';

// Function to normalize phone numbers from different formats
const normalizePhoneNumber = (phone) => {
  // Remove all non-numeric characters
  let normalized = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, add Brazil (55)
  if (!normalized.startsWith('55') && normalized.length >= 10) {
    normalized = '55' + normalized;
  }
  
  // Ensure it has the correct format for WhatsApp (55 + DDD + number)
  if (normalized.length === 12 && normalized.startsWith('55')) {
    // Add the 9 digit if missing for mobile numbers (55 + 2 digits DDD + 8 digits = 55 + 2 + 9 + 8)
    const ddd = normalized.substring(2, 4);
    const number = normalized.substring(4);
    if (number.length === 8 && !number.startsWith('9')) {
      normalized = '55' + ddd + '9' + number;
    }
  }
  
  logger.info(`Phone normalized: ${phone} -> ${normalized}`);
  return normalized;
};

// Conditional import for WebhookLog
let WebhookLog;
if (process.env.SKIP_DB !== 'true') {
  WebhookLog = (await import('../database/models/WebhookLog.js')).default;
}

// Novos handlers para o sistema Império
export const handleOrderExpired = async (req, res) => {
  try {
    logger.info('=== ORDER EXPIRED WEBHOOK START ===');
    logger.info('Validated data:', JSON.stringify(req.validatedData, null, 2));
    
    const { data } = req.validatedData;
    logger.info('Extracted data:', JSON.stringify(data, null, 2));
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true' && WebhookLog) {
      logger.info('Attempting to log to database...');
      await WebhookLog.create({
        type: 'order_expired',
        payload: req.validatedData,
        status: 'processing'
      });
      logger.info('Database log successful');
    } else {
      logger.info('Skipping database log');
    }

    logger.info('Creating message data...');
    
    // Normalize phone number format - handle multiple formats
    const normalizedPhone = normalizePhoneNumber(data.user.phone);
    
    const messageData = {
      user: {
        ...data.user,
        phone: normalizedPhone
      },
      product: data.product,
      quantity: data.quantity,
      total: data.total,
      pixCode: data.pixCode || '',
      expirationAt: data.expirationAt ? new Date(data.expirationAt).toLocaleDateString('pt-BR') : null,
      affiliate: data.affiliate || 'A0RJJ5L1QK',
      id: data.id
    };
    logger.info('Message data created:', JSON.stringify(messageData, null, 2));
    
    logger.info('Adding message to queue for template processing...');
    logger.info('Phone number:', normalizedPhone);
    
    await addMessageToQueue({
      phoneNumber: normalizedPhone,
      message: '', // Will be rendered by messageProcessor
      messageOptions: null, // Will be handled by template renderer
      type: 'order_expired',
      customerId: data.user.email || data.user.phone || data.id,
      metadata: {
        orderId: data.id,
        orderTotal: data.total,
        user: {
          ...data.user,
          phone: normalizedPhone
        },
        product: data.product,
        quantity: data.quantity,
        total: data.total,
        expirationAt: data.expirationAt ? new Date(data.expirationAt).toLocaleDateString('pt-BR') : null,
        pixCode: data.pixCode || '',
        affiliate: data.affiliate || 'A0RJJ5L1QK',
        id: data.id,
        timestamp: new Date().toISOString() // Para verificar frescor da mensagem
      }
    }, {
      priority: 2,
      delay: 60000 // 1 minute delay
    });
    
    logger.info('Message added to queue successfully');

    logger.info('Order expired webhook processed', {
      orderId: data.id,
      customerId: data.user.email || data.user.phone
    });

    res.json({
      success: true,
      message: 'Webhook received and queued for processing'
    });
  } catch (error) {
    logger.error('Error processing order expired webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook'
    });
  }
};

export const handleOrderPaid = async (req, res) => {
  try {
    logger.info('=== ORDER PAID WEBHOOK START ===');
    logger.info('Validated data:', JSON.stringify(req.validatedData, null, 2));
    
    const { data } = req.validatedData;
    logger.info('Extracted data:', JSON.stringify(data, null, 2));
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true' && WebhookLog) {
      logger.info('Attempting to log to database...');
      await WebhookLog.create({
        type: 'order_paid',
        payload: req.validatedData,
        status: 'processing'
      });
      logger.info('Database log successful');
    } else {
      logger.info('Skipping database log');
    }

    logger.info('Creating message data...');
    
    // Normalize phone number format - handle multiple formats
    const normalizedPhone = normalizePhoneNumber(data.user.phone);
    
    const messageData = {
      user: {
        ...data.user,
        phone: normalizedPhone
      },
      product: data.product,
      quantity: data.quantity,
      total: data.total,
      createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      id: data.id
    };
    logger.info('Message data created:', JSON.stringify(messageData, null, 2));
    
    logger.info('Adding message to queue with interactive buttons...');
    logger.info('Phone number:', normalizedPhone);
    
    // Usar o sistema de renderização com botões interativos
    await addMessageToQueue({
      phoneNumber: normalizedPhone,
      message: '', // Will be rendered by messageProcessor
      messageOptions: null, // Will be handled by template renderer
      type: 'order_paid',
      customerId: data.user.email || data.user.phone || data.id,
      metadata: {
        orderId: data.id,
        orderTotal: data.total,
        user: data.user,
        product: data.product,
        quantity: data.quantity,
        total: data.total,
        createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        id: data.id,
        timestamp: new Date().toISOString() // Para verificar frescor da mensagem
      }
    }, {
      priority: 3 // Highest priority
    });
    
    logger.info('Message added to queue successfully');

    logger.info('Order paid webhook processed', {
      orderId: data.id,
      customerId: data.user.email || data.user.phone
    });

    res.json({
      success: true,
      message: 'Webhook received and queued for processing'
    });
  } catch (error) {
    logger.error('Error processing order paid webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook'
    });
  }
};

// Handlers antigos (compatibilidade)

export const handleCarrinhoAbandonado = async (req, res) => {
  try {
    const { data } = req.validatedData;
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true') {
      await WebhookLog.create({
        type: 'carrinho_abandonado',
        payload: req.validatedData,
        status: 'processing'
      });
    }

    const message = await renderTemplate('carrinho_abandonado', {
      customerName: data.customer.name.split(' ')[0],
      cartTotal: data.cart.total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      recoveryUrl: data.cart.recovery_url,
      items: data.cart.items
    });

    await addMessageToQueue({
      phoneNumber: data.customer.phone,
      message,
      type: 'carrinho_abandonado',
      customerId: data.customer.email,
      metadata: {
        cartId: data.cart.id,
        cartTotal: data.cart.total
      }
    }, {
      priority: 1,
      delay: 300000 // 5 minutes delay
    });

    logger.info('Carrinho abandonado webhook processed', {
      cartId: data.cart.id,
      customerId: data.customer.email
    });

    res.json({
      success: true,
      message: 'Webhook received and queued for processing'
    });
  } catch (error) {
    logger.error('Error processing carrinho abandonado webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook'
    });
  }
};

export const handleVendaExpirada = async (req, res) => {
  try {
    const { data } = req.validatedData;
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true') {
      await WebhookLog.create({
        type: 'venda_expirada',
        payload: req.validatedData,
        status: 'processing'
      });
    }

    const message = await renderTemplate('venda_expirada', {
      customerName: data.customer.name.split(' ')[0],
      orderTotal: data.order.total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      paymentUrl: data.order.payment_url,
      expirationDate: new Date(data.order.expiration_date).toLocaleDateString('pt-BR')
    });

    await addMessageToQueue({
      phoneNumber: data.customer.phone,
      message,
      type: 'venda_expirada',
      customerId: data.customer.email,
      metadata: {
        orderId: data.order.id,
        orderTotal: data.order.total
      }
    }, {
      priority: 2 // Higher priority than abandoned cart
    });

    logger.info('Venda expirada webhook processed', {
      orderId: data.order.id,
      customerId: data.customer.email
    });

    res.json({
      success: true,
      message: 'Webhook received and queued for processing'
    });
  } catch (error) {
    logger.error('Error processing venda expirada webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook'
    });
  }
};

export const handleVendaAprovada = async (req, res) => {
  try {
    const { data } = req.validatedData;
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true') {
      await WebhookLog.create({
        type: 'venda_aprovada',
        payload: req.validatedData,
        status: 'processing'
      });
    }

    const message = await renderTemplate('venda_aprovada', {
      customerName: data.customer.name.split(' ')[0],
      orderId: data.order.id,
      orderTotal: data.order.total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      items: data.order.items,
      trackingCode: data.order.tracking_code,
      estimatedDelivery: data.order.estimated_delivery 
        ? new Date(data.order.estimated_delivery).toLocaleDateString('pt-BR')
        : null
    });

    await addMessageToQueue({
      phoneNumber: data.customer.phone,
      message,
      type: 'venda_aprovada',
      customerId: data.customer.email,
      metadata: {
        orderId: data.order.id,
        orderTotal: data.order.total,
        trackingCode: data.order.tracking_code
      }
    }, {
      priority: 3 // Highest priority
    });

    logger.info('Venda aprovada webhook processed', {
      orderId: data.order.id,
      customerId: data.customer.email
    });

    res.json({
      success: true,
      message: 'Webhook received and queued for processing'
    });
  } catch (error) {
    logger.error('Error processing venda aprovada webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook'
    });
  }
};

// Handler para cliques de botões (Evolution API webhooks)
export const handleButtonClick = async (req, res) => {
  try {
    logger.info('=== BUTTON CLICK WEBHOOK START ===');
    logger.info('Button click data:', JSON.stringify(req.body, null, 2));
    
    const { data } = req.body;
    
    // Extrair informações do clique do botão (Evolution API v1.7.1)
    const buttonId = data?.message?.buttonsResponseMessage?.selectedButtonId || 
                     data?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                     data?.selectedButtonId ||
                     data?.buttonId;
    
    // Extrair número de telefone do formato Evolution API v1.7.1
    let phoneNumber = data?.key?.remoteJid || data?.from || data?.phoneNumber;
    if (phoneNumber && phoneNumber.includes('@s.whatsapp.net')) {
      phoneNumber = phoneNumber.replace('@s.whatsapp.net', '');
    }
    const messageType = data?.messageType || 'unknown';
    
    if (!buttonId || !phoneNumber) {
      logger.warn('Missing buttonId or phoneNumber in button click webhook');
      return res.status(400).json({
        error: 'Missing required fields: buttonId or phoneNumber'
      });
    }
    
    logger.info(`Button clicked: ${buttonId} by ${phoneNumber}`);
    
    // Skip database logging if SKIP_DB is true
    if (process.env.SKIP_DB !== 'true' && WebhookLog) {
      await WebhookLog.create({
        type: 'button_click',
        payload: req.body,
        status: 'processing'
      });
    }
    
    // Processar clique do botão
    const buttonResponse = await processButtonClick(buttonId, phoneNumber, messageType);
    
    // Se há uma resposta automática, enviar mensagem
    if (buttonResponse.message && buttonResponse.action !== 'redirect') {
      await sendMessage(phoneNumber, buttonResponse.message);
      logger.info(`Sent automatic response for button click: ${buttonId}`);
    }
    
    // Log específico para redirecionamentos de comunidade
    if (buttonResponse.action === 'redirect' && buttonId === 'join_community') {
      logger.info(`User ${phoneNumber} redirected to community via button click`);
    }
    
    res.json({
      success: true,
      action: buttonResponse.action,
      message: 'Button click processed successfully'
    });
    
  } catch (error) {
    logger.error('Error processing button click webhook:', error);
    res.status(500).json({
      error: 'Failed to process button click'
    });
  }
};