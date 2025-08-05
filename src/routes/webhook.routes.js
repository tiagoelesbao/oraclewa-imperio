import { Router } from 'express';
import { validateWebhook } from '../middlewares/webhookAuth.js';
import { 
  handleOrderExpired,
  handleOrderPaid,
  handleCarrinhoAbandonado,
  handleVendaExpirada,
  handleVendaAprovada,
  handleButtonClick
} from '../controllers/webhookController.js';
import { validateWebhookData } from '../middlewares/validation.js';

const router = Router();

// Debug endpoint - mostra dados recebidos
router.post('/debug', (req, res) => {
  console.log('=== WEBHOOK DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('===================');
  
  res.json({
    message: 'Debug data logged - check server logs',
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Debug específico para order-expired
router.post('/debug-expired', (req, res) => {
  console.log('=== DEBUG ORDER EXPIRED ===');
  console.log('All Headers:', JSON.stringify(req.headers, null, 2));
  console.log('X-AUTH-WEBHOOK:', req.headers['x-auth-webhook']);
  console.log('Expected Secret:', process.env.WEBHOOK_SECRET);
  console.log('Match:', req.headers['x-auth-webhook'] === process.env.WEBHOOK_SECRET);
  console.log('Body Event:', req.body?.event);
  console.log('========================');
  
  res.json({
    success: true,
    authHeader: req.headers['x-auth-webhook'],
    expectedSecret: process.env.WEBHOOK_SECRET ? 'SET' : 'NOT_SET',
    match: req.headers['x-auth-webhook'] === process.env.WEBHOOK_SECRET,
    event: req.body?.event,
    timestamp: new Date().toISOString()
  });
});

// RAW CAPTURE - SEM AUTENTICAÇÃO E SEM VALIDAÇÃO
router.post('/raw-capture', (req, res) => {
  console.log('=== RAW WEBHOOK CAPTURE ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Raw Body:', JSON.stringify(req.body, null, 2));
  console.log('Query Params:', JSON.stringify(req.query, null, 2));
  console.log('========================');
  
  res.json({ 
    success: true, 
    message: 'Raw webhook captured successfully',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body,
    query: req.query
  });
});

// WEBHOOK STATUS MONITOR - Endpoint para ver atividade recente
const recentWebhooks = [];
const MAX_RECENT_WEBHOOKS = 50;

router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    recentWebhooks: recentWebhooks.slice(-10), // Últimos 10
    totalProcessed: recentWebhooks.length,
    systemInfo: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    }
  });
});

// Middleware para capturar todos os webhooks
router.use((req, res, next) => {
  if (req.method === 'POST') {
    // LOG DETALHADO PARA DEBUG
    if (req.path.includes('order-expired')) {
      console.log('🔍 EXPIRED WEBHOOK DEBUG:');
      console.log('Path:', req.path);
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('X-AUTH-WEBHOOK:', req.headers['x-auth-webhook']);
      console.log('Expected Secret:', process.env.WEBHOOK_SECRET);
      console.log('Match:', req.headers['x-auth-webhook'] === process.env.WEBHOOK_SECRET);
      console.log('====================');
    }
    const webhookInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length'),
      event: req.body?.event || 'unknown',
      userId: req.body?.data?.user?.id || 'unknown',
      userName: req.body?.data?.user?.name || 'unknown',
      phone: req.body?.data?.user?.phone || 'unknown',
      total: req.body?.data?.total || 0,
      status: 'processing'
    };
    
    recentWebhooks.push(webhookInfo);
    
    // Manter apenas os últimos N webhooks
    if (recentWebhooks.length > MAX_RECENT_WEBHOOKS) {
      recentWebhooks.shift();
    }
    
    console.log('📥 WEBHOOK RECEIVED:', JSON.stringify(webhookInfo, null, 2));
    
    // Interceptar response para capturar status final
    const originalSend = res.send;
    res.send = function(data) {
      webhookInfo.status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'error';
      webhookInfo.responseStatus = res.statusCode;
      webhookInfo.processedAt = new Date().toISOString();
      
      console.log('📤 WEBHOOK PROCESSED:', JSON.stringify({
        path: webhookInfo.path,
        event: webhookInfo.event,
        status: webhookInfo.status,
        responseStatus: webhookInfo.responseStatus,
        userName: webhookInfo.userName,
        phone: webhookInfo.phone
      }, null, 2));
      
      return originalSend.call(this, data);
    };
  }
  next();
});

// Endpoint de teste simples para formatação de número
router.post('/test-format', (req, res) => {
  try {
    const phoneNumber = req.body.phone || '5511959761948';
    
    // Testar formatação do número
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    
    console.log('=== TESTE FORMATAÇÃO ===');
    console.log('Original:', phoneNumber);
    console.log('Formatado:', formattedPhone);
    console.log('Com domínio:', formattedPhone + '@s.whatsapp.net');
    console.log('=======================');

    res.json({
      success: true,
      original: phoneNumber,
      formatted: formattedPhone,
      whatsappFormat: formattedPhone + '@s.whatsapp.net',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({
      error: 'Erro no teste de formatação',
      details: error.message
    });
  }
});

// Novos endpoints para o sistema Império
router.post('/order-expired', 
  validateWebhook,
  validateWebhookData('order_expired'),
  handleOrderExpired
);

router.post('/order-paid',
  validateWebhook,
  validateWebhookData('order_paid'),
  handleOrderPaid
);

// Endpoints antigos (manter compatibilidade)
router.post('/carrinho-abandonado', 
  validateWebhook,
  validateWebhookData('carrinho_abandonado'),
  handleCarrinhoAbandonado
);

router.post('/venda-expirada',
  validateWebhook,
  validateWebhookData('venda_expirada'),
  handleVendaExpirada
);

router.post('/venda-aprovada',
  validateWebhook,
  validateWebhookData('venda_aprovada'),
  handleVendaAprovada
);

// ENDPOINT DE TESTE SEM AUTENTICAÇÃO - Para debugging
router.post('/test-order-expired', 
  validateWebhookData('order_expired'),
  handleOrderExpired
);

router.post('/test-order-paid',
  validateWebhookData('order_paid'),
  handleOrderPaid
);

// ENDPOINT TEMPORÁRIO SEM AUTENTICAÇÃO - Para teste do Império
router.post('/temp-order-expired', 
  validateWebhookData('order_expired'),
  handleOrderExpired
);

router.post('/temp-order-paid',
  validateWebhookData('order_paid'),
  handleOrderPaid
);

// Endpoint para receber cliques de botões da Evolution API
router.post('/button-click', handleButtonClick);

// Endpoint sem auth para teste de botões
router.post('/test-button-click', handleButtonClick);

export default router;