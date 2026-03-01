import { useScrollFadeIn } from '@/hooks/use-scroll-fade-in';

const steps = [
  { num: '01', title: 'Create your event', desc: 'Set up your gallery in under a minute with just a name and date.' },
  { num: '02', title: 'Upload or shoot live', desc: 'Drag and drop your photos or use MirrorLive for real-time delivery.' },
  { num: '03', title: 'Share with clients', desc: 'Send a beautiful link. Guests view, favorite, and download instantly.' },
];

export default function HowItWorksSection() {
  const ref = useScrollFadeIn();

  return (
    <section className="py-24 md:py-32 bg-[#F5ECD7]">
      <div ref={ref} className="max-w-5xl mx-auto px-6 md:px-10">
        <p className="text-[#8B6914] text-[11px] tracking-[0.2em] uppercase font-bold text-center mb-3">Simple Setup</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#1A0F00] text-center mb-16 tracking-tight font-extrabold">
          Up and running in minutes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-[2px] bg-[#C49A3C]" />

          {steps.map((s) => (
            <div key={s.num} className="text-center relative">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFFDF5] border-2 border-[#C49A3C] font-serif text-2xl text-[#8B6914] font-extrabold mb-4 relative z-10">
                {s.num}
              </span>
              <h3 className="text-[#1A0F00] text-lg font-extrabold mb-2 font-sans">{s.title}</h3>
              <p className="text-[#A67C2A] text-sm leading-relaxed font-semibold font-sans max-w-[260px] mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
