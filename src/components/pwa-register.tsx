'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

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
      {installPrompt && !isInstalled && (
        <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 rounded-full bg-[#17182B] px-4 py-2.5 text-xs font-semibold text-white shadow-xl ring-2 ring-[#C4B5FD]/40 transition-all hover:bg-[#23253F] active:scale-95 dark:bg-[#C4B5FD] dark:text-[#17182B]"
          >
            <Download className="h-4 w-4" />
            <span>Instalar App PWA</span>
          </button>
        </div>
      )}
    </>
  );
}
