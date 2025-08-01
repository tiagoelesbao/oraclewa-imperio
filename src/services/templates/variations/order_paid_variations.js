// Variações de mensagens para pagamento aprovado
export const ORDER_PAID_VARIATIONS = [
  {
    template: `🎉 *PARABÉNS, {{user.name}}!*

✅ *Seu pagamento foi aprovado com sucesso!*

📦 *Detalhes do seu pedido:*
• *Produto:* {{product.title}}
• *Quantidade:* {{quantity}} cotas
• *Total pago:* R$ {{total}}

🎰 *Você está concorrendo a R$ 200.000,00!*

📱 *Acompanhe o sorteio:*
• Data: Será informada em breve
• Pelo site da Loteria Federal

🍀 *Boa sorte!*
💚 *Obrigado pela confiança!*

*Império Premiações* 🏆`
  },
  {
    template: `🏆 *{{user.name}}, pagamento confirmado!*

✅ *Tudo certo com sua compra!*

📋 *Resumo:*
🎟️ {{quantity}} cotas - {{product.title}}
💰 Valor: R$ {{total}}

🎯 *Prêmio: R$ 200.000,00*
📅 Sorteio: Data será informada em breve

🤞 *Dedos cruzados para você!*
📞 Dúvidas? Pode me chamar!

*Império Premiações* ✨`
  },
  {
    template: `✨ *Olá {{user.name}}!*

🎊 *Compra aprovada com sucesso!*

🎫 *Suas {{quantity}} cotas para:*
{{product.title}}

💵 *Investimento:* R$ {{total}}
💰 *Concorrendo a:* R$ 200.000,00

📊 *Sorteio oficial pela Loteria Federal*

🌟 *Que a sorte esteja com você!*

*Equipe Império* 🎰`
  }
];

// Função para selecionar variação aleatória
export const getRandomVariation = () => {
  const index = Math.floor(Math.random() * ORDER_PAID_VARIATIONS.length);
  return ORDER_PAID_VARIATIONS[index].template;
};