import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Converter imagem para base64 para uso no Railway
const imagePath = './src/modules/broadcast/templates/images/ChatGPT Image 3 de jul. de 2025, 16_33_32.png';

try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('✅ Imagem convertida com sucesso!');
    console.log(`📏 Tamanho: ${(base64Image.length / 1024).toFixed(1)} KB`);
    
    // Salvar base64 para usar no Railway
    const base64Data = `data:image/png;base64,${base64Image}`;
    fs.writeFileSync('./oraclewa-logo-base64.txt', base64Data);
    
    console.log('💾 Base64 salvo em: oraclewa-logo-base64.txt');
    
    // Teste rápido de envio
    const testPayload = {
        number: "5511999999999", // Substitua pelo seu número
        media: base64Data,
        caption: "🎯 *TESTE BROADCAST IMPÉRIO*\n\n🏆 Sistema funcionando perfeitamente!\n\n💰 Imagem carregada via base64\n📞 Pronto para disparos em massa",
        fileName: "oraclewa-logo.png"
    };
    
    console.log('\n📋 Payload de teste gerado:');
    console.log('- Número:', testPayload.number);
    console.log('- Caption:', testPayload.caption);
    console.log('- Arquivo:', testPayload.fileName);
    console.log('- Mídia: [Base64 Image Data]');
    
} catch (error) {
    console.error('❌ Erro:', error.message);
}