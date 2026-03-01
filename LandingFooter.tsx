import { useNavigate } from 'react-router-dom';

export default function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="py-14 bg-[#1A0F00]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
        <h2 className="font-serif italic text-2xl text-[#C49A3C] mb-6 font-extrabold">MirrorAI</h2>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
          <a href="#features" className="text-[#C49A3C] hover:text-white text-sm font-bold font-sans transition-colors">Features</a>
          <a href="#pricing" className="text-[#C49A3C] hover:text-white text-sm font-bold font-sans transition-colors">Pricing</a>
          <button onClick={() => navigate('/login')} className="text-[#C49A3C] hover:text-white text-sm font-bold font-sans transition-colors">Login</button>
          <button onClick={() => navigate('/register')} className="text-[#C49A3C] hover:text-white text-sm font-bold font-sans transition-colors">Sign Up</button>
          <a href="mailto:support@mirroraigallery.com" className="text-[#C49A3C] hover:text-white text-sm font-bold font-sans transition-colors">Support</a>
        </div>
        <p className="text-[#C49A3C]/40 text-xs font-bold font-sans">
          © {new Date().getFullYear()} MirrorAI. Built for photographers.
        </p>
      </div>
    </footer>
  );
}
