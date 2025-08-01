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