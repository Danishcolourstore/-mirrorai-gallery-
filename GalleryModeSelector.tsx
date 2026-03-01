import { useEffect, useState } from 'react';
import { MirrorEyeSymbol } from '@/components/MirrorLogo';
import { Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface GalleryModeSelectorProps {
  value: string;
  onChange: (mode: string) => void;
  userId?: string;
}

export function GalleryModeSelector({ value, onChange, userId }: GalleryModeSelectorProps) {
  const [hasBranding, setHasBranding] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await (supabase.from('profiles').select('brand_name, brand_logo_url') as any)
        .eq('user_id', userId)
        .maybeSingle();
      setHasBranding(!!(data?.brand_name || data?.brand_logo_url));
    })();
  }, [userId]);

  const modes = [
    {
      value: 'mirrorai',
      label: 'MirrorAI Standard',
      desc: 'Platform branding',
      icon: <MirrorEyeSymbol size={28} color="currentColor" />,
    },
    {
      value: 'studio',
      label: 'Studio Branded',
      desc: 'Your brand only',
      icon: <Palette className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`flex flex-col items-center gap-2 py-4 px-3 border transition-all text-center rounded-sm ${
              value === mode.value
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border text-muted-foreground/60 hover:border-foreground/30'
            }`}
          >
            <div className={value === mode.value ? 'text-primary' : 'text-muted-foreground/40'}>
              {mode.icon}
            </div>
            <span className="text-[11px] font-medium tracking-wide">{mode.label}</span>
            <span className="text-[9px] text-muted-foreground/50 leading-snug">{mode.desc}</span>
          </button>
        ))}
      </div>
      {value === 'studio' && hasBranding === false && (
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-sm">
          <p className="text-[11px] text-foreground/70">
            Set up your studio branding first.{' '}
            <button
              type="button"
              onClick={() => navigate('/dashboard/branding')}
              className="text-primary underline underline-offset-2 font-medium"
            >
              Go to Branding →
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
