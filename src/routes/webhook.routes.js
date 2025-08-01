import { Router } from 'express';
import { validateWebhook } from '../middlewares/webhookAuth.js';
import { 
  handleOrderExpired,
  handleOrderPaid,
  handleCarrinhoAbandonado,
  handleVendaExpirada,
  handleVendaAprovada
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

export default router;