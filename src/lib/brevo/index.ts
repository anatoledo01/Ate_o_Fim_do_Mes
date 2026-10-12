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
 * Public base URL of the app, taken from env only (never from request headers,
 * to avoid host-header injection in links sent by e-mail).
 */
export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
    || 'https://ateofimdomes.vercel.app'
  ).replace(/\/$/, '');
}

/**
 * Builds high-converting, cyber-space aesthetic HTML template
 * matching the Até o Fim do Mês visual identity:
 * - #07081a dark deep space background
 * - #0e1026 cyber card with subtle glowing borders
 * - #22ffb4 neon mint primary accents
 * - #5b8cff cyber blue & #ff4fd8 violet highlights
 * - JetBrains Mono inspired telemetry boxes
 * - Credit: Desenvolvido por Ana Toledo
 */
export function buildWelcomeEmailHtml(name: string): string {
  const safeName = name ? name.trim() : 'Membro';
  const baseUrl = getAppBaseUrl();
  const loginUrl = `${baseUrl}/login`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Até o Fim do Mês</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07081a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f2f1fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07081a; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Cyber Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #0e1026; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 28px; overflow: hidden; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.85);">
          
          <!-- Top Neon Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #ff4fd8, #5b8cff, #22ffb4); line-height: 4px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Header Banner with Logo & Status Pill -->
          <tr>
            <td style="background: radial-gradient(circle at top, rgba(34, 255, 180, 0.12) 0%, rgba(14, 16, 38, 0) 70%); padding: 40px 32px 28px 32px; text-align: center;">
              
              <!-- Brand Badge -->
              <div style="display: inline-flex; align-items: center; background: rgba(34, 255, 180, 0.08); border: 1px solid rgba(34, 255, 180, 0.3); padding: 8px 18px; border-radius: 20px; margin-bottom: 20px;">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: #22ffb4; border-radius: 50%; margin-right: 8px; box-shadow: 0 0 10px #22ffb4;"></span>
                <span style="font-size: 11px; font-weight: 700; color: #22ffb4; font-family: 'SF Mono', Monaco, Consolas, monospace; letter-spacing: 1.5px; text-transform: uppercase;">
                  Telemetria Financeira Ativada
                </span>
              </div>

              <!-- Logo & App Name -->
              <div style="margin-bottom: 6px;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                  Até o Fim do Mês
                </h1>
              </div>

              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a9a8c6; font-family: monospace;">
                Quanto você pode gastar hoje sem aperto
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 0 36px 36px 36px;">
              
              <!-- Greeting -->
              <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 14px 0;">
                Olá, <span style="color: #22ffb4;">${safeName}</span>! 👋
              </h2>

              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.65; color: #c9c8e2;">
                Sua conta foi criada com sucesso! A partir de hoje, você não precisa mais fazer contas de cabeça antes de pedir um almoço, pagar um café ou fazer uma compra.
              </p>

              <!-- Futuristic Core Value Callout -->
              <div style="background: rgba(34, 255, 180, 0.05); border: 1px solid rgba(34, 255, 180, 0.25); border-radius: 20px; padding: 20px; margin-bottom: 28px; text-align: center;">
                <span style="display: block; font-size: 11px; font-family: monospace; color: #5b8cff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                  Objetivo Principal
                </span>
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #22ffb4; font-family: 'SF Mono', Monaco, Consolas, monospace; line-height: 1.4;">
                  &ldquo;Quanto eu posso gastar hoje sem comprometer o resto do meu mês?&rdquo;
                </p>
              </div>

              <!-- Interactive Telemetry Dashboard Preview -->
              <div style="background-color: #07081a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 22px; margin-bottom: 28px;">
                <div style="font-size: 11px; font-family: monospace; color: #a9a8c6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">
                  📡 Seus Superpoderes Financeiros:
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top; width: 32px; font-size: 18px;">🎯</td>
                    <td style="padding: 8px 0; font-size: 13px; color: #c9c8e2; line-height: 1.5;">
                      <strong style="color: #ffffff;">Limite Diário em Tempo Real:</strong> Seu saldo livre dividido exatamente pelos dias que faltam até o próximo salário.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top; width: 32px; font-size: 18px;">🛡️</td>
                    <td style="padding: 8px 0; font-size: 13px; color: #c9c8e2; line-height: 1.5;">
                      <strong style="color: #ffffff;">Reserva Blindada:</strong> Um colchão intocável que o aplicativo protege para você nunca gastar em emergências.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top; width: 32px; font-size: 18px;">📑</td>
                    <td style="padding: 8px 0; font-size: 13px; color: #c9c8e2; line-height: 1.5;">
                      <strong style="color: #ffffff;">Sem Dupla Dedução:</strong> Contas do mês reservadas e abatidas com precisão cirúrgica.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 34px 0 10px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #22ffb4 0%, #1bd697 100%); color: #04110c; padding: 15px 36px; border-radius: 16px; font-weight: 800; font-size: 14px; text-decoration: none; font-family: monospace; letter-spacing: 0.5px; box-shadow: 0 0 25px rgba(34, 255, 180, 0.4);">
                  ACESSAR MEU PAINEL AGORA &rarr;
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer with author credit -->
          <tr>
            <td style="background-color: #07081a; padding: 26px 36px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0; font-size: 12px; color: #a9a8c6;">
                Você está recebendo este e-mail porque se cadastrou em <strong>Até o Fim do Mês</strong>.
              </p>
              
              <div style="margin-top: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; background-color: #22ffb4; border-radius: 50%;"></span>
                <span style="font-size: 11px; font-family: monospace; color: #8281a8;">
                  Desenvolvido por <strong style="color: #ffffff;">Ana Toledo</strong>
                </span>
              </div>

              <p style="margin: 10px 0 0 0; font-size: 10px; color: #535273;">
                Privacidade garantida · Dados criptografados e isolados · Sem anúncios
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

/**
 * Password reset e-mail (sent via Brevo instead of Supabase's default mailer).
 */
export function buildResetPasswordEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefina sua senha</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07081a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f2f1fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07081a; padding: 40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #0e1026; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 28px; overflow: hidden;">
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #ff4fd8, #5b8cff, #22ffb4); line-height: 4px; font-size: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 40px 32px 8px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #22ffb4; font-family: 'SF Mono', Monaco, Consolas, monospace; letter-spacing: 1.5px; text-transform: uppercase;">
                Até o Fim do Mês
              </p>
              <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Redefina sua senha
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 36px 0 36px; text-align: center;">
              <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #c9c8e2;">
                Recebemos um pedido para redefinir a senha da sua conta. Toque no botão abaixo para escolher uma nova senha.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 36px; text-align: center;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #22ffb4 0%, #1bd697 100%); color: #04110c; padding: 15px 36px; border-radius: 16px; font-weight: 800; font-size: 14px; text-decoration: none; font-family: monospace; letter-spacing: 0.5px;">
                CRIAR NOVA SENHA &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 36px 32px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #a9a8c6;">
                O link expira em 1 hora e só pode ser usado uma vez. Se você não pediu essa alteração, ignore este e-mail. Sua senha continua a mesma.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #07081a; padding: 22px 36px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-size: 11px; font-family: monospace; color: #8281a8;">
                Desenvolvido por <strong style="color: #ffffff;">Ana Toledo</strong>
              </span>
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
