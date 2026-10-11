import { NextResponse } from 'next/server';
import { buildWelcomeEmailHtml } from '@/lib/brevo';

export async function GET() {
  const html = buildWelcomeEmailHtml('Ana Toledo');
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
