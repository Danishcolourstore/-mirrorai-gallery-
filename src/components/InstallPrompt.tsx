import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share2 } from 'lucide-react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show immediately (no delay, no dismissal cooldown)
    setShowPrompt(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_dismissed_at', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-50 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm animate-in slide-in-from-bottom duration-300">
      <div className="bg-[hsl(24,25%,8%)] text-white rounded-lg shadow-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
              {isIOS ? <Share2 className="h-5 w-5 text-gold" /> : <Download className="h-5 w-5 text-gold" />}
            </div>
            <div>
              <p className="text-[13px] font-medium font-sans">
                {isIOS ? 'Install MirrorAI' : '📱 Add MirrorAI to your home screen'}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5 font-sans">
                {isIOS
                  ? 'Tap Share → Add to Home Screen'
                  : 'Access your galleries anytime, like a real app'}
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-white/30 hover:text-white transition-colors p-1 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <div className="flex items-center gap-2 mt-3">
            <Button onClick={handleInstall} size="sm" className="flex-1 h-8 text-[11px] uppercase tracking-[0.08em] bg-gold hover:bg-gold/90 text-foreground font-sans">
              Add
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm" className="h-8 text-[11px] text-white/40 hover:text-white font-sans">
              Not now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
