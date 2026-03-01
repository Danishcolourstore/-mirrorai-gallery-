import { Image, Zap, Lock, Smile, Globe, Smartphone } from 'lucide-react';
import { useScrollFadeIn } from '@/hooks/use-scroll-fade-in';

const features = [
  { icon: Image, title: 'Beautiful Galleries', desc: 'Masonry, classic and editorial layouts that showcase your best work.' },
  { icon: Zap, title: 'MirrorLive', desc: 'Stream photos live the moment you shoot — no cables, no apps.' },
  { icon: Lock, title: 'Client Proofing', desc: 'PIN protected galleries with magic links for secure delivery.' },
  { icon: Smile, title: 'Face Recognition', desc: 'Guests find their photos with one selfie — instantly.' },
  { icon: Globe, title: 'Global Delivery', desc: 'Cloudflare CDN ensures lightning fast loading worldwide.' },
  { icon: Smartphone, title: 'Mobile Perfect', desc: 'Flawless experience on every device, every screen size.' },
];

export default function FeaturesSection() {
  const ref = useScrollFadeIn();

  return (
    <section id="features" className="py-24 md:py-32 bg-[#F5ECD7]">
      <div ref={ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[#8B6914] text-[11px] tracking-[0.2em] uppercase font-bold text-center mb-3">
          Everything You Need
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#1A0F00] text-center mb-16 tracking-tight font-extrabold">
          The complete platform for modern photographers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#FFFDF5] border-2 border-[#C49A3C] rounded-xl p-8 hover:shadow-[0_4px_20px_rgba(139,105,20,0.15)] transition-shadow duration-300"
            >
              <f.icon className="h-6 w-6 text-[#8B6914] mb-4" strokeWidth={1.5} />
              <h3 className="text-[#1A0F00] text-base font-extrabold mb-2 font-sans">{f.title}</h3>
              <p className="text-[#A67C2A] text-sm leading-relaxed font-semibold font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
