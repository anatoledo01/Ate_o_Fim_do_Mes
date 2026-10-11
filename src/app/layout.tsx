import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { FinancialProvider } from '@/lib/context/financial-context';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'Até o Fim do Mês — PWA Financeiro Pessoal',
  description:
    'Seu salário tem um plano. Descubra quanto você pode gastar hoje sem comprometer o resto do mês com cálculos automáticos e controle financeiro real.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Até o Fim do Mês',
  },
};

export const viewport: Viewport = {
  themeColor: '#07081a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#07081a] text-[#f2f1fa] selection:bg-[#22ffb4]/30 selection:text-[#22ffb4]">
        <AuthProvider>
          <FinancialProvider>
            <PwaRegister />
            {children}
          </FinancialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
