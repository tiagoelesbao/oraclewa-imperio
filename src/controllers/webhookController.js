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

    const message = await renderTemplate('order_expired', {
      customerName: order.customer.name.split(' ')[0],
      orderId: order.id,
      orderTotal: order.total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      paymentUrl: order.payment_url,
      items: order.items || [],
      expiresAt: order.expires_at ? new Date(order.expires_at).toLocaleDateString('pt-BR') : null
    });

    await addMessageToQueue({
      phoneNumber: order.customer.phone,
      message,
      type: 'order_expired',
      customerId: order.customer.email || order.customer.phone,
      metadata: {
        orderId: order.id,
        orderTotal: order.total,
        expiresAt: order.expires_at
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

    const message = await renderTemplate('order_paid', {
      customerName: order.customer.name.split(' ')[0],
      orderId: order.id,
      orderTotal: order.total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      items: order.items || [],
      paymentMethod: order.payment_method,
      transactionId: order.transaction_id
    });

    await addMessageToQueue({
      phoneNumber: order.customer.phone,
      message,
      type: 'order_paid',
      customerId: order.customer.email || order.customer.phone,
      metadata: {
        orderId: order.id,
        orderTotal: order.total,
        paymentMethod: order.payment_method,
        transactionId: order.transaction_id
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