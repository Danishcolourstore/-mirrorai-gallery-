import { useScrollFadeIn } from '@/hooks/use-scroll-fade-in';

const testimonials = [
  { name: 'Rahul Sharma', quote: 'The gallery quality is insane. My clients think I built a custom app for them. MirrorAI elevated my entire brand.' },
  { name: 'Priya Menon', quote: 'MirrorLive at weddings is pure magic. Guests were seeing photos on their phones before the ceremony even ended.' },
  { name: 'Arjun Kapoor', quote: 'The face recognition feature saved me 8 hours of manual sorting. Clients get their photos instantly — they love it.' },
];

export default function TestimonialsSection() {
  const ref = useScrollFadeIn();

  return (
    <section className="py-24 md:py-32 bg-[#1A0F00]">
      <div ref={ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[#C49A3C] text-[11px] tracking-[0.2em] uppercase font-bold text-center mb-3">
          Photographers Love It
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-16 tracking-tight font-extrabold">
          Hear from our community
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-8 rounded-xl border-2 border-[#C49A3C]/40 bg-[#5C4008]/30">
              <p className="text-white/90 text-sm leading-relaxed mb-6 font-bold font-sans">"{t.quote}"</p>
              <p className="text-[#C49A3C] text-sm font-extrabold font-sans">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
