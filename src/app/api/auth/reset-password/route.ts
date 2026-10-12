import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBrevoEmail, buildResetPasswordEmailHtml, getAppBaseUrl } from '@/lib/brevo';

/**
 * Generates a Supabase recovery token WITHOUT Supabase sending its own e-mail,
 * then delivers a branded reset link through Brevo.
 *
 * Requires the server-only env var SUPABASE_SERVICE_ROLE_KEY.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[reset-password] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL ausente.');
      return NextResponse.json(
        { error: 'Recuperação de senha indisponível no momento.' },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
    });

    // Unknown e-mail: respond the same way to avoid revealing which accounts exist.
    if (error || !data?.properties?.hashed_token) {
      if (error) console.warn('[reset-password] generateLink:', error.message);
      return NextResponse.json({ success: true });
    }

    const resetUrl =
      `${getAppBaseUrl()}/redefinir-senha` +
      `?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`;

    const result = await sendBrevoEmail({
      toEmail: normalizedEmail,
      subject: 'Redefina sua senha — Até o Fim do Mês',
      htmlContent: buildResetPasswordEmailHtml(resetUrl),
      textContent: `Para redefinir sua senha, acesse: ${resetUrl}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Não foi possível enviar o e-mail. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[reset-password]', message);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
