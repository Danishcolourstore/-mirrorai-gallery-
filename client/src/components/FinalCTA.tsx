import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useScrollFadeIn } from '@/hooks/use-scroll-fade-in';

export default function FinalCTA() {
  const navigate = useNavigate();
  const ref = useScrollFadeIn();

  return (
    <section className="py-24 md:py-32 bg-[#F5ECD7]">
      <div ref={ref} className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1A0F00] tracking-tight mb-4 font-extrabold">
          Ready to deliver photos beautifully?
        </h2>
        <p className="text-[#A67C2A] text-base mb-10 font-bold font-sans">
          Join thousands of photographers already using MirrorAI
        </p>
        <Button
          className="bg-[#8B6914] hover:bg-[#5C4008] text-white h-13 px-10 rounded-lg text-[15px] tracking-wide font-extrabold"
          onClick={() => navigate('/register')}
        >
          Start Free Today
        </Button>
      </div>
    </section>
  );
}
