import { Image, Share2, Pencil, Trash2, Heart, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface EventCardProps {
  id: string;
  name: string;
  slug: string;
  date: string;
  photoCount: number;
  coverUrl: string | null;
  favCount?: number;
  galleryMode?: string;
  cameraConnected?: boolean;
  livesyncEnabled?: boolean;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function EventCard({ name, slug, date, photoCount, coverUrl, favCount, galleryMode, cameraConnected, livesyncEnabled, onShare, onEdit, onDelete, onClick }: EventCardProps) {
  const { toast } = useToast();

  const copyGalleryLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/event/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: 'Copied!', description: 'Gallery link copied to clipboard.' });
    });
  };

  return (
    <div
      className="group cursor-pointer animate-fade-in rounded-lg overflow-hidden bg-card border border-border/40 transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] hover:border-border/70"
      onClick={onClick}
    >
      {/* 3:2 cover — cinematic ratio */}
      <div className="relative aspect-[3/2] overflow-hidden bg-secondary/40">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary/60 to-secondary/20">
            <Image className="h-10 w-10 text-foreground/10" />
          </div>
        )}
        {/* Mode badge + MirrorLive badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge variant={galleryMode === 'studio' ? 'default' : 'secondary'} className="text-[9px] px-2 py-0.5 font-medium tracking-wide">
            {galleryMode === 'studio' ? 'Studio' : 'MirrorAI'}
          </Badge>
          {(cameraConnected || livesyncEnabled) && (
            <Badge className={`text-[9px] px-2 py-0.5 font-bold tracking-wide border-0 ${
              cameraConnected
                ? 'bg-[hsl(0,84%,55%)] text-white animate-pulse'
                : 'bg-[hsl(0,84%,55%)]/20 text-[hsl(0,84%,55%)]'
            }`}>
              <span className="relative flex h-1.5 w-1.5 mr-1">
                {cameraConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cameraConnected ? 'bg-white' : 'bg-[hsl(0,84%,55%)]'}`} />
              </span>
              {cameraConnected ? 'MirrorLive Active' : 'MirrorLive Ready'}
            </Badge>
          )}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-card/95 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-foreground transition-all hover:bg-card hover:scale-105"
            >
              <Share2 className="h-3 w-3" />Share
            </button>
            <button
              onClick={copyGalleryLink}
              className="inline-flex items-center gap-1.5 rounded-full bg-card/95 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-foreground transition-all hover:bg-card hover:scale-105"
            >
              <Link2 className="h-3 w-3" />Copy Link
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-card/95 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-foreground transition-all hover:bg-card hover:scale-105"
            >
              <Pencil className="h-3 w-3" />Edit
            </button>
            <div className="flex-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="rounded-full bg-card/95 backdrop-blur-md p-2 text-destructive transition-all hover:bg-card hover:scale-110"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* Metadata strip */}
      <div className="px-4 py-4">
        <h3 className="font-serif text-[18px] font-medium text-foreground leading-snug truncate">{name}</h3>
        <p className="text-[11px] text-foreground/35 mt-1.5 flex items-center gap-1.5 font-sans font-medium tracking-wide">
          {format(new Date(date), 'MMM d, yyyy')}
          {photoCount > 0 && <><span className="text-foreground/15">·</span> {photoCount} photos</>}
          {(favCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 ml-1">
              <Heart className="h-2.5 w-2.5 text-primary" fill="hsl(var(--primary))" />{favCount}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
