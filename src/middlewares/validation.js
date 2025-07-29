import Joi from 'joi';

const webhookSchemas = {
  // Novos schemas para o sistema Império
  order_expired: Joi.object({
    event: Joi.string().valid('order.expired').required(),
    data: Joi.object({
      order: Joi.object({
        id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        total: Joi.number().positive().required(),
        customer: Joi.object({
          name: Joi.string().required(),
          phone: Joi.string().required(),
          email: Joi.string().email().optional()
        }).required(),
        items: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            quantity: Joi.number().integer().positive().required(),
            price: Joi.number().positive().required()
          })
        ).optional(),
        expires_at: Joi.date().iso().optional(),
        payment_url: Joi.string().uri().optional()
      }).required()
    }).required(),
    created_at: Joi.date().iso().optional()
  }),

  order_paid: Joi.object({
    event: Joi.string().valid('order.paid').required(),
    data: Joi.object({
      order: Joi.object({
        id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        total: Joi.number().positive().required(),
        customer: Joi.object({
          name: Joi.string().required(),
          phone: Joi.string().required(),
          email: Joi.string().email().optional()
        }).required(),
        items: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            quantity: Joi.number().integer().positive().required(),
            price: Joi.number().positive().required()
          })
        ).optional(),
        payment_method: Joi.string().optional(),
        transaction_id: Joi.string().optional()
      }).required()
    }).required(),
    created_at: Joi.date().iso().optional()
  }),

  // Schemas antigos (compatibilidade)
  carrinho_abandonado: Joi.object({
    event: Joi.string().valid('carrinho_abandonado').required(),
    timestamp: Joi.date().iso().required(),
    data: Joi.object({
      customer: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^\d{10,15}$/).required(),
        email: Joi.string().email().required()
      }).required(),
      cart: Joi.object({
        id: Joi.string().required(),
        total: Joi.number().positive().required(),
        items: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            quantity: Joi.number().integer().positive().required(),
            price: Joi.number().positive().required()
          })
        ).min(1).required(),
        recovery_url: Joi.string().uri().required()
      }).required()
    }).required()
  }),

  venda_expirada: Joi.object({
    event: Joi.string().valid('venda_expirada').required(),
    timestamp: Joi.date().iso().required(),
    data: Joi.object({
      customer: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^\d{10,15}$/).required(),
        email: Joi.string().email().required()
      }).required(),
      order: Joi.object({
        id: Joi.string().required(),
        total: Joi.number().positive().required(),
        expiration_date: Joi.date().iso().required(),
        payment_url: Joi.string().uri().required()
      }).required()
    }).required()
  }),

  venda_aprovada: Joi.object({
    event: Joi.string().valid('venda_aprovada').required(),
    timestamp: Joi.date().iso().required(),
    data: Joi.object({
      customer: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^\d{10,15}$/).required(),
        email: Joi.string().email().required()
      }).required(),
      order: Joi.object({
        id: Joi.string().required(),
        total: Joi.number().positive().required(),
        items: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            quantity: Joi.number().integer().positive().required(),
            price: Joi.number().positive().required()
          })
        ).min(1).required(),
        tracking_code: Joi.string().optional(),
        estimated_delivery: Joi.date().iso().optional()
      }).required()
    }).required()
  })
};

export const validateWebhookData = (type) => {
  return (req, res, next) => {
    const schema = webhookSchemas[type];
    
    if (!schema) {
      return res.status(500).json({ error: 'Invalid webhook type' });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req.validatedData = value;
    next();
  };
};