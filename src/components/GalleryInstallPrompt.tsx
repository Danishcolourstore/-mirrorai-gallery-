import { useState, useEffect } from 'react';
import { X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryInstallPromptProps {
  studioName?: string;
  eventName?: string;
}

export function GalleryInstallPrompt({ studioName, eventName }: GalleryInstallPromptProps) {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    if (localStorage.getItem('gallery_install_prompted') === 'true') return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => setShow(true), 8000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    dismiss();
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('gallery_install_prompted', 'true');
  };

  if (!show || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={dismiss} />
      <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300 safe-area-pb">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <span className="font-serif text-gold text-[14px] font-semibold">M</span>
            </div>
            <span className="text-[12px] font-sans text-white/60">{studioName || 'MirrorAI'}</span>
          </div>
          <button onClick={dismiss} className="text-white/30 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <h3 className="font-serif text-[20px] text-white font-light">Save your gallery 🤍</h3>
        <p className="text-[13px] font-sans text-white/50 mt-2 leading-relaxed">
          Add to your home screen and access your photos anytime, even without internet.
        </p>

        {isIOS ? (
          /* iOS instructions */
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-white/70 font-sans">1</span>
                <div>
                  <p className="text-[13px] text-white/80 font-sans">
                    Tap the <Share2 className="inline h-3.5 w-3.5 mx-0.5 text-gold" /> Share button at the bottom of Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-white/70 font-sans">2</span>
                <p className="text-[13px] text-white/80 font-sans">
                  Scroll down and tap <span className="text-white font-medium">"Add to Home Screen"</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-white/70 font-sans">3</span>
                <p className="text-[13px] text-white/80 font-sans">
                  Tap <span className="text-white font-medium">"Add"</span> — Done! ✅
                </p>
              </div>
            </div>
            <Button onClick={dismiss} className="w-full bg-gold hover:bg-gold/90 text-[#1A1A1A] font-sans text-[13px] font-medium tracking-[0.05em] h-12">
              Got it
            </Button>
          </div>
        ) : (
          /* Android / Chrome */
          <div className="mt-6 space-y-3">
            <Button onClick={handleInstall} className="w-full bg-gold hover:bg-gold/90 text-[#1A1A1A] font-sans text-[13px] font-medium tracking-[0.05em] h-12">
              Add to Home Screen
            </Button>
            <button onClick={dismiss} className="w-full text-center text-[13px] font-sans text-white/40 hover:text-white/60 transition-colors py-2">
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
