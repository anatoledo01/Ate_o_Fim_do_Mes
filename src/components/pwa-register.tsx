'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Service Worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration note:', err));
    }

    // 2. Offline / Online event listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    // 3. PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {/* Offline Toast */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Você está offline. Os registros serão salvos localmente.</span>
        </div>
      )}

      {/* Install App Button if eligible and not yet installed */}
      {installPrompt && !isInstalled && !isDismissed && (
        <div className="fixed bottom-24 right-4 z-40 sm:bottom-6 sm:right-6 animate-fade-in">
          <div className="flex items-center gap-1 pwa-prompt-pill rounded-full p-1 shadow-2xl border transition">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 rounded-full pwa-install-btn px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Instalar App</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dispensar aviso de instalação"
              className="flex h-7 w-7 items-center justify-center rounded-full pwa-dismiss-btn transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
