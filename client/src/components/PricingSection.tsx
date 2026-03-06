import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useScrollFadeIn } from '@/hooks/use-scroll-fade-in';

const features = [
  'Unlimited Events',
  'Unlimited Photos',
  'All Gallery Layouts',
  'MirrorLive — Real-time delivery',
  'Face Recognition',
  'QR Guest Registration',
  'Custom Branding',
  'Priority Support',
  '50GB Storage',
];

export default function PricingSection() {
  const navigate = useNavigate();
  const ref = useScrollFadeIn();

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#F5ECD7]">
      <div ref={ref} className="max-w-5xl mx-auto px-6 md:px-10">
        <p className="text-[#8B6914] text-[11px] tracking-[0.2em] uppercase font-bold text-center mb-3">Pricing</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#1A0F00] text-center mb-16 tracking-tight font-extrabold">
          Simple, honest pricing
        </h2>

        <div className="max-w-[480px] mx-auto relative p-10 rounded-2xl bg-[#8B6914] border-2 border-[#C49A3C] text-center">
          <span className="inline-block bg-white/15 text-white text-[10px] tracking-[0.2em] uppercase font-extrabold px-5 py-1.5 rounded-full mb-6">
            Everything Included
          </span>
          <h3 className="font-serif text-2xl md:text-3xl text-white mb-3 font-extrabold">MirrorAI Pro</h3>
          <p className="mb-2">
            <span className="font-serif text-5xl md:text-6xl font-black text-white">₹4,500</span>
            <span className="text-white/50 text-base font-bold">/mo</span>
          </p>
          <p className="text-white/80 text-sm mb-8 font-bold font-sans">One plan. Everything included. No surprises.</p>

          <ul className="space-y-3 mb-10 text-left max-w-[300px] mx-auto">
            {features.map((f) => (
              <li key={f} className="text-white/90 text-sm font-bold font-sans flex items-center gap-2.5">
                <span className="text-[#C49A3C]">✓</span> {f}
              </li>
            ))}
          </ul>

          <Button
            className="w-full h-12 rounded-lg bg-white hover:bg-white/90 text-[#1A0F00] text-[14px] font-extrabold tracking-wide"
            onClick={() => navigate('/register')}
          >
            Start Free Trial
          </Button>
          <p className="text-white/40 text-xs mt-4 font-bold font-sans">No credit card required · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}
