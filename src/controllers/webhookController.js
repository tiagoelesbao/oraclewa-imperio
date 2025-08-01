import logger from '../utils/logger.js';
import { addMessageToQueue } from '../services/queue/manager.js';
import { renderTemplate } from '../services/templates/renderer.js';
import WebhookLog from '../database/models/WebhookLog.js';

// Novos handlers para o sistema Império
export const handleOrderExpired = async (req, res) => {
  try {
    const { data } = req.validatedData;
    const order = data.order;
    
    await WebhookLog.create({
      type: 'order_expired',
      payload: req.validatedData,
      status: 'processing'
    });

    const messageData = {
      user: data.user || data,
      product: data.product || { title: 'Sorteio' },
      quantity: data.quantity || 1,
      total: data.total || 0,
      pixCode: data.pixCode || '',
      expirationAt: data.expirationAt ? new Date(data.expirationAt).toLocaleDateString('pt-BR') : null,
      affiliate: data.affiliate || 'A0RJJ5L1QK',
      id: data.id
    };
    
    const message = await renderTemplate('order_expired', messageData);
    
    // Adicionar suporte para botões
    const messageOptions = {
      buttons: [
        {
          type: 'copy',
          copyCode: data.pixCode
        },
        {
          type: 'url',
          displayText: 'Acessar Site',
          url: `https://imperiopremioss.com/campanha/rapidinha-r-20000000-em-premiacoes?&afiliado=${data.affiliate || 'A0RJJ5L1QK'}`
        }
      ]
    };

    await addMessageToQueue({
      phoneNumber: data.user?.phone || data.phone,
      message,
      messageOptions,
      type: 'order_expired',
      customerId: data.user?.email || data.user?.phone || data.id,
      metadata: {
        orderId: data.id,
        orderTotal: data.total,
        expiresAt: data.expirationAt,
        buttons: messageOptions.buttons
      }
    }, {
      priority: 2,
      delay: 60000 // 1 minute delay
    });

    logger.info('Order expired webhook processed', {
      orderId: order.id,
      customerId: order.customer.email || order.customer.phone
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
    const { data } = req.validatedData;
    const order = data.order;
    
    await WebhookLog.create({
      type: 'order_paid',
      payload: req.validatedData,
      status: 'processing'
    });

    const messageData = {
      user: data.user || data,
      product: data.product || { title: 'Sorteio' },
      quantity: data.quantity || 1,
      total: data.total || 0,
      createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      id: data.id
    };
    
    const message = await renderTemplate('order_paid', messageData);
    
    // Adicionar botão de resposta rápida
    const messageOptions = {
      replyButtons: [
        {
          id: 'confirm_receipt',
          title: 'Confirmar Recebimento'
        }
      ]
    };

    await addMessageToQueue({
      phoneNumber: data.user?.phone || data.phone,
      message,
      messageOptions,
      type: 'order_paid',
      customerId: data.user?.email || data.user?.phone || data.id,
      metadata: {
        orderId: data.id,
        orderTotal: data.total,
        replyButtons: messageOptions.replyButtons
      }
    }, {
      priority: 3 // Highest priority
    });

    logger.info('Order paid webhook processed', {
      orderId: order.id,
      customerId: order.customer.email || order.customer.phone
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
    
    await WebhookLog.create({
      type: 'carrinho_abandonado',
      payload: req.validatedData,
      status: 'processing'
    });

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
    
    await WebhookLog.create({
      type: 'venda_expirada',
      payload: req.validatedData,
      status: 'processing'
    });

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
    
    await WebhookLog.create({
      type: 'venda_aprovada',
      payload: req.validatedData,
      status: 'processing'
    });

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