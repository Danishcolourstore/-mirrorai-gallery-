import { Heart, Download, Share2, Trash2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  is_favorite: boolean;
  file_name: string | null;
}

interface DiptychLayoutProps {
  photos: Photo[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  canDownload?: boolean;
  isOwner?: boolean;
  onDelete?: (photo: Photo) => void;
  onShare?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  watermarkText?: string | null;
  onPhotoClick?: (photoId: string) => void;
}

export function DiptychLayout({
  photos, isFavorite, toggleFavorite, canDownload = false, isOwner = false,
  onDelete, onShare, onDownload, watermarkText, onPhotoClick,
}: DiptychLayoutProps) {
  if (photos.length === 0) return null;

  // Build rows: pairs of 2, every 6th photo goes full width
  const rows: { photos: Photo[]; fullWidth: boolean }[] = [];
  let i = 0;
  let count = 0;
  while (i < photos.length) {
    count++;
    if (count % 6 === 0 || i === photos.length - 1) {
      // Full width accent
      rows.push({ photos: [photos[i]], fullWidth: true });
      i++;
    } else if (i + 1 < photos.length) {
      rows.push({ photos: [photos[i], photos[i + 1]], fullWidth: false });
      i += 2;
    } else {
      rows.push({ photos: [photos[i]], fullWidth: true });
      i++;
    }
  }

  const renderPhoto = (photo: Photo, inPair: boolean) => {
    const fav = isFavorite(photo.id);
    return (
      <div
        key={photo.id}
        className={`group relative overflow-hidden cursor-pointer ${
          inPair
            ? 'aspect-[3/2] transition-all duration-300 hover:brightness-105 hover:scale-[1.005]'
            : 'aspect-[21/9] sm:aspect-[3/1]'
        }`}
        onClick={() => onPhotoClick?.(photo.id)}
      >
        <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={() => console.error('Image failed:', photo.url)} />
        
        {watermarkText && (
          <div className="absolute bottom-0 right-0 p-2 pointer-events-none">
            <span className="font-sans text-white/[0.25] text-[9px] tracking-[0.15em]">{watermarkText}</span>
          </div>
        )}

        {/* Heart */}
        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id); }}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/[0.85] backdrop-blur flex items-center justify-center transition-all hover:bg-white active:scale-125">
          <Heart className={`h-[18px] w-[18px] ${fav ? 'text-gold scale-110' : 'text-foreground/50'}`}
            fill={fav ? 'hsl(var(--gold))' : 'none'} />
        </button>

        {/* Hover actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onShare && <button onClick={(e) => { e.stopPropagation(); onShare(photo); }}
            className="rounded-full bg-card/70 backdrop-blur-sm p-1.5"><Share2 className="h-3.5 w-3.5" /></button>}
          {canDownload && onDownload && <button onClick={(e) => { e.stopPropagation(); onDownload(photo); }}
            className="rounded-full bg-card/70 backdrop-blur-sm p-1.5"><Download className="h-3.5 w-3.5" /></button>}
          {isOwner && onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(photo); }}
            className="rounded-full bg-card/70 backdrop-blur-sm p-1.5 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-[3px]">
      {rows.map((row, ri) => (
        row.fullWidth ? (
          <div key={ri}>{renderPhoto(row.photos[0], false)}</div>
        ) : (
          <div key={ri} className="grid grid-cols-2 gap-[3px]">
            {row.photos.map((photo) => renderPhoto(photo, true))}
          </div>
        )
      ))}
    </div>
  );
}
