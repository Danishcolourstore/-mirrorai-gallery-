import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#1A0F00] shadow-[0_2px_12px_rgba(26,15,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-16 md:h-20">
        <h1
          className={`font-serif italic text-xl md:text-2xl tracking-tight cursor-pointer font-extrabold transition-colors duration-500 ${
            scrolled ? 'text-[#C49A3C]' : 'text-white'
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          MirrorAI
        </h1>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            className={`text-[13px] h-9 px-5 rounded-lg font-bold transition-colors duration-500 bg-transparent ${
              scrolled
                ? 'border-[#C49A3C] text-[#C49A3C] hover:bg-[#C49A3C]/10'
                : 'border-white/40 text-white hover:bg-white/10'
            }`}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            className={`text-[13px] h-9 px-5 rounded-lg font-extrabold transition-colors duration-500 ${
              scrolled
                ? 'bg-[#8B6914] hover:bg-[#5C4008] text-white'
                : 'bg-white hover:bg-white/90 text-[#1A0F00]'
            }`}
            onClick={() => navigate('/register')}
          >
            Start Free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 transition-colors ${scrolled ? 'text-[#C49A3C]' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1A0F00] border-t border-[#C49A3C]/30 px-6 py-6 flex flex-col gap-3 animate-fade-in">
          <Button variant="outline" className="w-full rounded-lg border-2 border-[#C49A3C] text-[#C49A3C] h-11 font-bold" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
            Login
          </Button>
          <Button className="w-full rounded-lg bg-[#8B6914] hover:bg-[#5C4008] text-white h-11 font-extrabold" onClick={() => { navigate('/register'); setMenuOpen(false); }}>
            Start Free
          </Button>
        </div>
      )}
    </nav>
  );
}
