import { format } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  studioName: string;
  instagram?: string | null;
  whatsapp?: string | null;
}

export function GalleryExpiredPage({ studioName, instagram, whatsapp }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-6">
        <Clock className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Gallery Expired</h1>
      <p className="text-[13px] text-muted-foreground/60 max-w-xs">
        This gallery is no longer available. Please contact <span className="text-foreground font-medium">{studioName}</span> to request access.
      </p>
      <div className="flex items-center gap-3 mt-6">
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-border text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors">
            WhatsApp
          </a>
        )}
        {instagram && (
          <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-border text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors">
            Instagram
          </a>
        )}
      </div>
    </div>
  );
}
