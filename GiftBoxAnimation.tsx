import { useState, useEffect, useCallback } from 'react';

interface Props {
  eventSlug: string;
  studioName?: string;
  onComplete: () => void;
}

export function GiftBoxAnimation({ eventSlug, studioName, onComplete }: Props) {
  const [phase, setPhase] = useState<'idle' | 'untie' | 'open' | 'burst' | 'flood' | 'done'>('idle');
  const [showSkip, setShowSkip] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Show skip after 4s
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Auto-skip after 8s
  useEffect(() => {
    const t = setTimeout(() => skipToGallery(), 8000);
    return () => clearTimeout(t);
  }, []);

  const markOpened = useCallback(() => {
    localStorage.setItem(`gallery_${eventSlug}_opened`, 'true');
  }, [eventSlug]);

  const skipToGallery = useCallback(() => {
    markOpened();
    setFadeOut(true);
    setTimeout(onComplete, 500);
  }, [markOpened, onComplete]);

  const handleTap = () => {
    if (phase !== 'idle') return;
    setPhase('untie');
    setTimeout(() => setPhase('open'), 600);
    setTimeout(() => setPhase('burst'), 1100);
    setTimeout(() => setPhase('flood'), 1500);
    setTimeout(() => {
      markOpened();
      setPhase('done');
      onComplete();
    }, 2200);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: '#0D0D0D' }}
      onClick={(e) => {
        // Click outside box → skip if skip is showing
        if (showSkip && phase === 'idle') {
          const target = e.target as HTMLElement;
          if (!target.closest('[data-giftbox]')) skipToGallery();
        }
      }}
    >
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
      }} />

      {/* Title text */}
      <p
        className="relative mb-10 font-serif font-light tracking-[0.2em] animate-[giftFadeIn_0.5s_0.5s_ease_both]"
        style={{ fontSize: '22px', color: 'rgba(255,255,255,0.85)' }}
      >
        See your forever.
      </p>

      {/* Gift Box */}
      <div
        data-giftbox
        onClick={handleTap}
        className="relative cursor-pointer select-none"
        style={{ width: 200, height: 200, minHeight: 200 }}
        role="button"
        aria-label="Open gift box"
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-xl transition-all duration-500"
          style={{
            boxShadow: phase === 'burst' || phase === 'flood'
              ? '0 0 120px rgba(201,169,110,0.8), 0 0 240px rgba(201,169,110,0.4)'
              : '0 0 60px rgba(201,169,110,0.3), 0 0 120px rgba(201,169,110,0.15)',
          }}
        />

        {/* Box body */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 160, height: 110,
            background: 'linear-gradient(180deg, #F5F3EF 0%, #E8E4DD 100%)',
            borderRadius: '4px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            animation: phase === 'idle' ? 'giftBreathe 2s ease-in-out infinite' : 'none',
          }}
        >
          {/* Vertical ribbon */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[14px]"
            style={{ background: 'linear-gradient(180deg, #C9A96E, #B8944F)' }} />
          {/* Horizontal ribbon */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[14px]"
            style={{ background: 'linear-gradient(90deg, #C9A96E, #B8944F)' }} />
        </div>

        {/* Lid */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all"
          style={{
            width: 172, height: 36,
            bottom: 110,
            background: 'linear-gradient(180deg, #F5F3EF 0%, #EAE6DF 100%)',
            borderRadius: '4px 4px 0 0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            transformOrigin: 'bottom left',
            transform: phase === 'open' || phase === 'burst' || phase === 'flood'
              ? 'translateX(-50%) rotate(-85deg) translateY(-20px)'
              : phase === 'untie'
                ? 'translateX(-50%) rotate(-5deg)'
                : 'translateX(-50%)',
            transition: phase === 'open' ? 'transform 0.5s ease-out' : 'transform 0.3s ease',
            opacity: phase === 'flood' ? 0 : 1,
          }}
        >
          {/* Lid ribbon */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[14px]"
            style={{ background: 'linear-gradient(180deg, #C9A96E, #B8944F)' }} />
        </div>

        {/* Bow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all"
          style={{
            bottom: 146,
            opacity: phase === 'untie' || phase === 'open' || phase === 'burst' || phase === 'flood' ? 0 : 1,
            transform: phase === 'untie' ? 'translateX(-50%) scale(1.2) rotate(15deg)' : 'translateX(-50%)',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Left loop */}
          <div className="absolute" style={{
            width: 28, height: 20, left: -22, top: -4,
            border: '3px solid #C9A96E', borderRadius: '50%',
            transform: 'rotate(-30deg)',
            background: 'rgba(201,169,110,0.15)',
          }} />
          {/* Right loop */}
          <div className="absolute" style={{
            width: 28, height: 20, left: -2, top: -4,
            border: '3px solid #C9A96E', borderRadius: '50%',
            transform: 'rotate(30deg)',
            background: 'rgba(201,169,110,0.15)',
          }} />
          {/* Center knot */}
          <div className="absolute" style={{
            width: 12, height: 12, left: -3, top: 2,
            background: '#C9A96E', borderRadius: '50%',
          }} />
          {/* Tails */}
          <div className="absolute" style={{
            width: 3, height: 16, left: -12, top: 10,
            background: '#C9A96E', borderRadius: '2px',
            transform: 'rotate(-15deg)',
          }} />
          <div className="absolute" style={{
            width: 3, height: 16, left: 12, top: 10,
            background: '#C9A96E', borderRadius: '2px',
            transform: 'rotate(15deg)',
          }} />
        </div>

        {/* Golden light burst from inside */}
        {(phase === 'burst' || phase === 'flood') && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[110px]"
            style={{
              width: phase === 'flood' ? '300vw' : 120,
              height: phase === 'flood' ? '300vh' : 200,
              background: phase === 'flood'
                ? 'radial-gradient(circle, rgba(201,169,110,0.95) 0%, rgba(255,248,230,0.9) 40%, rgba(255,255,255,1) 70%)'
                : 'radial-gradient(ellipse at bottom, rgba(201,169,110,0.9) 0%, rgba(201,169,110,0) 70%)',
              transition: 'all 0.6s ease-out',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Tap to open text */}
      {phase === 'idle' && (
        <p
          className="relative mt-10 font-sans uppercase tracking-[0.3em] animate-[giftPulse_2s_ease-in-out_infinite]"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
        >
          Tap to open
        </p>
      )}

      {/* Studio name */}
      {studioName && phase === 'idle' && (
        <p
          className="absolute bottom-8 font-sans uppercase tracking-[0.2em]"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
        >
          {studioName}
        </p>
      )}

      {/* Skip button */}
      {showSkip && phase === 'idle' && (
        <button
          onClick={(e) => { e.stopPropagation(); skipToGallery(); }}
          className="absolute bottom-8 right-6 font-sans uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
        >
          Skip →
        </button>
      )}

      {/* Full screen flood overlay */}
      {phase === 'flood' && (
        <div
          className="fixed inset-0 z-[10000] pointer-events-none animate-[giftFlood_0.6s_ease-out_forwards]"
          style={{ background: 'rgba(255,248,230,0)' }}
        />
      )}

      <style>{`
        @keyframes giftBreathe {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.02); }
        }
        @keyframes giftFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes giftPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes giftFlood {
          0% { background: rgba(255,248,230,0); }
          100% { background: rgba(255,248,230,1); }
        }
      `}</style>
    </div>
  );
}
