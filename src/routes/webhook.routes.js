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

// Endpoint de teste para enviar mensagem diretamente
router.post('/test-message', async (req, res) => {
  try {
    const { sendMessage } = await import('../services/whatsapp/evolution-manager.js');
    const { addMessageToQueue } = await import('../services/queue/manager.js');
    
    const phoneNumber = req.body.phone || '5511959761948';
    const message = req.body.message || `🧪 *TESTE DO SISTEMA IMPÉRIO*

⏰ ${new Date().toLocaleString('pt-BR')}

✅ Sistema funcionando corretamente!
📱 Formatação do número: ${phoneNumber}
🔧 Teste de conectividade WhatsApp

*Império Premiações* 🏆`;

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

    await addMessageToQueue({
      phoneNumber: formattedPhone,
      message,
      type: 'test_message',
      customerId: 'test_user',
      metadata: {
        originalPhone: phoneNumber,
        formattedPhone: formattedPhone,
        testTime: new Date().toISOString()
      }
    }, {
      priority: 3
    });

    res.json({
      success: true,
      message: 'Mensagem de teste adicionada à fila',
      phoneNumber: phoneNumber,
      formattedPhone: formattedPhone,
      finalFormat: formattedPhone + '@s.whatsapp.net',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({
      error: 'Erro ao enviar mensagem de teste',
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