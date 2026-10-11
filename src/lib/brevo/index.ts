/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Uses Brevo v3 REST API: https://api.brevo.com/v3/smtp/email
 */

interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'contato@ateofimdomes.com.br';
  const senderName = process.env.BREVO_SENDER_NAME || 'Até o Fim do Mês';

  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY não configurada. E-mail simulado em log para:', toEmail);
    return {
      success: true,
      error: 'BREVO_API_KEY não configurada no ambiente.',
    };
  }

  try {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail.split('@')[0],
        },
      ],
      subject,
      htmlContent,
      textContent: textContent || subject,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Brevo] Erro na resposta da API Brevo:', errorData);
      return {
        success: false,
        error: errorData.message || `Brevo API HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao chamar Brevo';
    console.error('[Brevo] Erro de rede ou execução:', message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Builds HTML template for Welcome email
 */
export function buildWelcomeEmailHtml(name: string): string {
  const safeName = name || 'Membro';
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Até o Fim do Mês</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07081a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f2f1fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07081a; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #0e1026; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(34, 255, 180, 0.15), rgba(91, 140, 255, 0.15)); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: inline-block; background: linear-gradient(135deg, #22ffb4, #5b8cff); padding: 12px 18px; border-radius: 16px; margin-bottom: 12px; font-weight: bold; font-size: 20px; color: #04110c;">
                💳 Até o Fim do Mês
              </div>
              <h1 style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Bem-vindo(a), ${safeName}!
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #22ffb4; font-family: monospace;">
                Controle financeiro diário em tempo real
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #c9c8e2;">
                Sua conta foi criada com sucesso! O <strong>Até o Fim do Mês</strong> foi desenvolvido para responder à pergunta mais importante de todas:
              </p>

              <!-- Highlight Box -->
              <div style="background-color: rgba(34, 255, 180, 0.06); border: 1px solid rgba(34, 255, 180, 0.25); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                <span style="font-size: 15px; font-weight: bold; color: #22ffb4; font-family: monospace;">
                  &ldquo;Quanto eu posso gastar hoje sem passar aperto no fim do mês?&rdquo;
                </span>
              </div>

              <h2 style="font-size: 16px; color: #ffffff; margin: 24px 0 12px 0;">
                O que você pode fazer a partir de agora:
              </h2>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 16px;">⚡</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #c9c8e2; line-height: 1.5;">
                    <strong style="color: #ffffff;">Limite Diário Seguro:</strong> Cálculos automáticos divididos pelos dias restantes até o salário.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 16px;">🛡️</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #c9c8e2; line-height: 1.5;">
                    <strong style="color: #ffffff;">Reserva Blindada:</strong> Separe um colchão de segurança intocável para imprevistos.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 16px;">📑</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #c9c8e2; line-height: 1.5;">
                    <strong style="color: #ffffff;">Sem Dupla Dedução:</strong> Contas fixas reservadas que só descontam quando pagas.
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="https://ate-o-fim-do-mes.vercel.app/login" style="display: inline-block; background-color: #22ffb4; color: #04110c; padding: 14px 32px; border-radius: 14px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 0 20px rgba(34, 255, 180, 0.35);">
                  Acessar Meu Painel Financeiro &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #07081a; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0; font-size: 12px; color: #a9a8c6;">
                Você recebeu este e-mail porque se cadastrou no <strong>Até o Fim do Mês</strong>.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                Desenvolvido por <strong>Ana Toledo</strong> · Privacidade garantida e dados isolados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
