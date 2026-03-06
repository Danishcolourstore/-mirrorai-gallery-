import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&q=80)' }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p
          className="text-[#C49A3C] text-[12px] tracking-[0.2em] uppercase font-bold mb-6 opacity-0 animate-fade-in"
          style={{ animationFillMode: 'forwards' }}
        >
          Premium Photo Delivery
        </p>
        <h1
          className="font-serif text-[40px] sm:text-[52px] md:text-[64px] text-white leading-[1.1] tracking-tight opacity-0 animate-fade-in font-black"
          style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
        >
          Your Photos.
          <br />
          Delivered Beautifully.
        </h1>
        <p
          className="mt-5 text-white/90 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-sans opacity-0 animate-fade-in font-bold"
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
        >
          The gallery platform built for professional photographers.
        </p>
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in"
          style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
        >
          <Button
            className="bg-[#8B6914] hover:bg-[#5C4008] text-white h-12 px-8 rounded-lg text-[14px] tracking-wide font-extrabold"
            onClick={() => navigate('/register')}
          >
            Start Free Today
          </Button>
          <Button
            variant="outline"
            className="border-2 border-[#C49A3C] text-[#C49A3C] hover:bg-[#C49A3C]/10 h-12 px-8 rounded-lg text-[14px] tracking-wide bg-transparent font-bold"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See a Live Gallery
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-5 w-5 text-[#C49A3C]/50" />
      </div>
    </section>
  );
}
