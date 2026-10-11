import { NextRequest, NextResponse } from 'next/server';
import { sendBrevoEmail, buildWelcomeEmailHtml } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'E-mail inválido ou não fornecido.' },
        { status: 400 }
      );
    }

    const htmlContent = buildWelcomeEmailHtml(name || '');
    const result = await sendBrevoEmail({
      toEmail: email.trim().toLowerCase(),
      toName: name || email.split('@')[0],
      subject: 'Bem-vindo(a) ao Até o Fim do Mês! 💳',
      htmlContent,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Falha ao enviar e-mail via Brevo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
