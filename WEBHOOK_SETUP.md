# Configuração de Webhooks - Sistema Império

## URLs dos Webhooks

Configure os seguintes webhooks no seu painel administrativo:

### 1. Order Expired (Pedido Expirado)
```
URL: http://seu-servidor:3000/api/webhook/order-expired
Eventos: order.expired
Método: POST
```

### 2. Order Paid (Pedido Pago)
```
URL: http://seu-servidor:3000/api/webhook/order-paid
Eventos: order.paid
Método: POST
```

## Configuração no Painel Império

Baseado na imagem do seu sistema, siga estes passos:

### Webhook 1 - Order Expired
1. **URL**: `http://seu-servidor:3000/api/webhook/order-expired`
2. **Authorization**: Coloque sua chave secreta no campo "X-AUTH-WEBHOOK"
3. **Assinaturas**: Marque apenas `order.expired`
4. Clique em "Cadastrar"

### Webhook 2 - Order Paid
1. **URL**: `http://seu-servidor:3000/api/webhook/order-paid`
2. **Authorization**: Coloque sua chave secreta no campo "X-AUTH-WEBHOOK"
3. **Assinaturas**: Marque apenas `order.paid`
4. Clique em "Cadastrar"

## Headers Necessários

O sistema espera os seguintes headers:

```
Content-Type: application/json
X-Webhook-Signature: [HMAC-SHA256 do payload]
X-Webhook-Timestamp: [timestamp unix em milliseconds]
```

## Exemplo de Payload - Order Expired

```json
{
  "event": "order.expired",
  "data": {
    "order": {
      "id": "12345",
      "total": 299.90,
      "customer": {
        "name": "João Silva",
        "phone": "5511999999999",
        "email": "joao@email.com"
      },
      "items": [
        {
          "name": "Produto X",
          "quantity": 2,
          "price": 149.95
        }
      ],
      "expires_at": "2024-01-15T23:59:59Z",
      "payment_url": "https://pagamento.imperio.com/pay/12345"
    }
  },
  "created_at": "2024-01-15T18:30:00Z"
}
```

## Exemplo de Payload - Order Paid

```json
{
  "event": "order.paid",
  "data": {
    "order": {
      "id": "12345",
      "total": 299.90,
      "customer": {
        "name": "João Silva",
        "phone": "5511999999999",
        "email": "joao@email.com"
      },
      "items": [
        {
          "name": "Produto X",
          "quantity": 2,
          "price": 149.95
        }
      ],
      "payment_method": "PIX",
      "transaction_id": "TXN123456789"
    }
  },
  "created_at": "2024-01-15T19:45:00Z"
}
```

## Configuração de Segurança

### 1. Configure o Webhook Secret

No arquivo `.env`, defina:
```env
WEBHOOK_SECRET=sua-chave-secreta-super-forte-aqui
```

### 2. Implementação da Assinatura

O sistema usa HMAC-SHA256 para validar os webhooks. A assinatura é gerada da seguinte forma:

```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(timestamp + '.' + JSON.stringify(payload))
  .digest('hex');
```

### 3. Validação de Timestamp

O sistema rejeita webhooks com timestamp mais antigo que 5 minutos para prevenir ataques de replay.

## Teste dos Webhooks

### Teste Manual com cURL

**Order Expired:**
```bash
curl -X POST http://localhost:3000/api/webhook/order-expired \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sua-assinatura" \
  -H "X-Webhook-Timestamp: $(date +%s)000" \
  -d '{
    "event": "order.expired",
    "data": {
      "order": {
        "id": "TEST123",
        "total": 100.00,
        "customer": {
          "name": "Teste Silva",
          "phone": "5511999999999"
        }
      }
    }
  }'
```

**Order Paid:**
```bash
curl -X POST http://localhost:3000/api/webhook/order-paid \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sua-assinatura" \
  -H "X-Webhook-Timestamp: $(date +%s)000" \
  -d '{
    "event": "order.paid",
    "data": {
      "order": {
        "id": "TEST123",
        "total": 100.00,
        "customer": {
          "name": "Teste Silva",
          "phone": "5511999999999"
        },
        "payment_method": "PIX"
      }
    }
  }'
```

## Monitoramento

### Verificar Logs de Webhook
```bash
docker-compose logs -f app | grep webhook
```

### Verificar Status das Mensagens
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/messages/history?type=order_expired
```

### Verificar Filas
```bash
docker-compose exec redis redis-cli
> LLEN "bull:message-queue:waiting"
```

## Troubleshooting

### Webhook não está sendo recebido
1. Verifique se a URL está correta
2. Confirme que o servidor está rodando na porta 3000
3. Verifique os logs: `docker-compose logs app`

### Erro de autenticação
1. Confirme que o `WEBHOOK_SECRET` está correto
2. Verifique se os headers estão sendo enviados
3. Teste com um webhook sem assinatura primeiro

### Mensagens não estão sendo enviadas
1. Verifique se as instâncias WhatsApp estão conectadas
2. Confirme que o Redis está funcionando
3. Verifique os logs da fila de mensagens

## Campos Obrigatórios vs Opcionais

### Order Expired
- **Obrigatórios**: `event`, `data.order.id`, `data.order.total`, `data.order.customer.name`, `data.order.customer.phone`
- **Opcionais**: `data.order.customer.email`, `data.order.items`, `data.order.expires_at`, `data.order.payment_url`

### Order Paid
- **Obrigatórios**: `event`, `data.order.id`, `data.order.total`, `data.order.customer.name`, `data.order.customer.phone`
- **Opcionais**: `data.order.customer.email`, `data.order.items`, `data.order.payment_method`, `data.order.transaction_id`