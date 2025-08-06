// Variações de mensagens para pagamento aprovado
export const ORDER_PAID_VARIATIONS = [
  {
    template: `🎉 *PARABÉNS, {{user.name}}!*

✅ *Pagamento Confirmado!*

━━━━━━━━━━━━━━━
📊 *SEUS NÚMEROS*
━━━━━━━━━━━━━━━

🎫 {{product.title}}
🔢 *{{quantity}} cotas*
💰 *R$ {{total}},00*

━━━━━━━━━━━━━━━
🏆 *PREMIAÇÃO*
━━━━━━━━━━━━━━━

💵 *R$ 200.000,00*
🎯 Loteria Federal

━━━━━━━━━━━━━━━

🍀 *Boa sorte!*

🔗 *Entre na Comunidade VIP:*
https://chat.whatsapp.com/EsOryU1oONNII64AAOz6TF

*Império Premiações* 🏆`
  },
  {
    template: `🏆 *{{user.name}}, tudo certo!*

✅ *Pagamento Aprovado*

━━━━━━━━━━━━━━━

🎟️ *{{quantity}} cotas*
{{product.title}}

💰 *Total: R$ {{total}},00*

━━━━━━━━━━━━━━━

🎯 *Concorrendo a:*
💵 *R$ 200.000,00*

━━━━━━━━━━━━━━━

🤞 Boa sorte!

🔗 *Entre na Comunidade VIP:*
https://chat.whatsapp.com/EsOryU1oONNII64AAOz6TF

*Império* ✨`
  },
  {
    template: `✨ *Olá {{user.name}}!*

🎊 *Compra Aprovada!*

━━━━━━━━━━━━━━━

🎫 *{{quantity}} cotas*
💵 *R$ {{total}},00*

━━━━━━━━━━━━━━━

💰 *Prêmio:*
*R$ 200.000,00*

📊 Loteria Federal

━━━━━━━━━━━━━━━

🌟 Boa sorte!

🔗 *Entre na Comunidade VIP:*
https://chat.whatsapp.com/EsOryU1oONNII64AAOz6TF

*Equipe Império* 🎰`
  }
];

// Função para selecionar variação aleatória
export const getRandomVariation = () => {
  const index = Math.floor(Math.random() * ORDER_PAID_VARIATIONS.length);
  return ORDER_PAID_VARIATIONS[index].template;
};