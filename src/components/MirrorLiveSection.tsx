import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollFadeIn } from '@/hooks/use-scroll-fade-in';

export default function MirrorLiveSection() {
  const navigate = useNavigate();
  const ref = useScrollFadeIn();

  return (
    <section className="bg-[#1A0F00] py-24 md:py-36 overflow-hidden">
      <div ref={ref} className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — Copy */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF3B30]" />
            </span>
            <span className="text-[#FF3B30] text-[11px] tracking-[0.25em] uppercase font-extrabold">MirrorLive</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-[56px] text-white leading-[1.05] tracking-tight mb-6 font-black">
            Shoot. Deliver.
            <br />
            Instantly.
          </h2>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-6 font-bold font-sans max-w-lg">
            MirrorLive streams your photos to guests the moment you press the shutter. No laptop. No cables. No extra apps.
          </p>
          <p className="text-[#C49A3C] text-sm mb-10 font-bold font-sans">
            No laptop · No extra apps · No tethering · Just shoot
          </p>
          <Button
            className="bg-[#8B6914] hover:bg-[#5C4008] text-white h-11 px-7 rounded-lg text-[13px] tracking-wide font-extrabold"
            onClick={() => navigate('/register')}
          >
            Learn More
          </Button>
        </div>

        {/* Right — Phone Mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-[260px] sm:w-[280px]">
            <div className="rounded-[32px] border-[3px] border-[#C49A3C]/20 bg-[#111] p-3">
              <div className="rounded-[24px] bg-[#0A0A0A] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-white/40 text-[10px] font-bold">9:41</span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B30]" />
                    </span>
                    <span className="text-[#FF3B30] text-[9px] font-extrabold tracking-wider">LIVE</span>
                  </div>
                </div>
                <div className="px-5 pb-3">
                  <p className="text-white text-[13px] font-extrabold">Wedding Gallery</p>
                  <p className="text-white/30 text-[10px] font-bold">Photos arriving in real time</p>
                </div>
                <div className="grid grid-cols-3 gap-[2px] px-1 pb-1">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-sm bg-gradient-to-br from-[#C49A3C]/15 to-[#8B6914]/5"
                      style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite', animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
                <div className="mx-3 mb-3 mt-2 px-3 py-2.5 rounded-xl bg-[#C49A3C]/[0.08] border border-[#C49A3C]/[0.15] flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B30]" />
                  </span>
                  <span className="text-white/60 text-[10px] font-bold">📷 New photo just added!</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#FF3B30] text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <Camera className="h-4 w-4" />
              <span className="text-[11px] font-extrabold tracking-wide">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
