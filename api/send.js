// api/send.js - Vercel / Serverless Function para envio de leads via API da Resend

module.exports = async (req, res) => {
  // Configuração de CORS para permitir requisições locais ou do domínio
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { nome, email, telefone, cidade, origem } = body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (nome, email ou telefone).' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY não configurada nas variáveis de ambiente.');
      return res.status(500).json({ error: 'Servidor não configurado com a RESEND_API_KEY.' });
    }

    // Remetente com domínio verificado na Resend
    // Pode ser configurado via variável de ambiente RESEND_FROM_EMAIL
    // Exemplo: "Magrass Vila Romana <contato@seudominio.com.br>"
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contato@magrassvilaromana.com.br';
    const toEmail = process.env.RESEND_TO_EMAIL || 'masptj@gmail.com';

    // Higieniza telefone para link do WhatsApp
    const phoneClean = telefone.replace(/\D/g, '');
    const phoneWa = phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`;
    const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Template HTML estilizado e profissional
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; color: #1f2937;">
        <div style="background: linear-gradient(135deg, #0A2723 0%, #0b3730 50%, #0A5C50 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; color: #2FE6D6;">
            NOVO LEAD RECEBIDO
          </h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.1em;">
            Regeneração Capilar - ${cidade || 'Vila Romana'}
          </p>
        </div>
        
        <div style="padding: 24px 28px;">
          <p style="margin: 0 0 18px; font-size: 15px; color: #374151;">
            Um novo interessado acabou de preencher o formulário da landing page:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
            <tr>
              <td style="padding: 10px 12px; background-color: #f9fafb; border-bottom: 1px solid #f3f4f6; font-weight: 600; width: 35%; color: #4b5563;">Nome:</td>
              <td style="padding: 10px 12px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; font-weight: 700; color: #111827;">${nome}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background-color: #f9fafb; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">E-mail:</td>
              <td style="padding: 10px 12px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; color: #111827;">
                <a href="mailto:${email}" style="color: #0d9488; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background-color: #f9fafb; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">WhatsApp:</td>
              <td style="padding: 10px 12px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #111827;">
                <a href="https://wa.me/${phoneWa}" target="_blank" style="display: inline-block; color: #059669; text-decoration: none;">
                  ${telefone} ↗ (Abrir no WhatsApp)
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background-color: #f9fafb; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">Unidade:</td>
              <td style="padding: 10px 12px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; color: #111827;">${cidade || 'Vila Romana'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background-color: #f9fafb; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">Data / Hora:</td>
              <td style="padding: 10px 12px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${dataHora}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: 600; color: #4b5563;">Origem:</td>
              <td style="padding: 10px 12px; background-color: #ffffff; color: #6b7280; font-size: 13px; word-break: break-all;">${origem || 'Direto'}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 28px 0 10px;">
            <a href="https://wa.me/${phoneWa}" target="_blank" style="background-color: #25D366; color: #ffffff; font-weight: 700; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
              Entrar em contato via WhatsApp
            </a>
          </div>
        </div>

        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 14px; text-align: center; font-size: 12px; color: #9ca3af;">
          Notificação automática enviada via Resend API • Magrass Vila Romana
        </div>
      </div>
    `;

    // Dispara requisição para a API da Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        cc: ['felipemelopinheiro@gmail.com'],
        bcc: ['masptj@gmail.com'],
        reply_to: email,
        subject: `🎯 Novo Lead: ${nome} - ${cidade || 'Vila Romana'}`,
        html: htmlContent
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Erro retornado pela API da Resend:', resendData);
      return res.status(resendResponse.status).json({
        error: 'Falha ao enviar e-mail via Resend.',
        details: resendData
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      message: 'E-mail enviado com sucesso para masptj@gmail.com'
    });

  } catch (error) {
    console.error('Erro inesperado no handler /api/send:', error);
    return res.status(500).json({ error: 'Erro interno ao processar envio do lead.', message: error.message });
  }
};
