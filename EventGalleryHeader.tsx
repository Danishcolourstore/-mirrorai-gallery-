import { Heart, Upload, Share2, Settings, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeliveryStatusBadge, DELIVERY_STATUSES } from '@/components/DeliveryStatusBadge';
import { format } from 'date-fns';

interface EventGalleryHeaderProps {
  event: {
    name: string;
    event_date: string;
    delivery_status: string;
    cover_url: string | null;
  };
  photos: { id: string }[];
  isOwner: boolean;
  isLiveEvent: boolean;
  favStats: { totalFavs: number; uniqueGuests: number };
  onUploadClick: () => void;
  onZipUploadClick: () => void;
  onShareClick: () => void;
  onGoLive: () => void;
  onSettingsClick: () => void;
  onDeliveryStatusChange: (status: string) => void;
  uploadDisabled: boolean;
}

export function EventGalleryHeader({
  event, photos, isOwner, isLiveEvent, favStats,
  onUploadClick, onZipUploadClick, onShareClick, onGoLive, onSettingsClick,
  onDeliveryStatusChange, uploadDisabled,
}: EventGalleryHeaderProps) {
  return (
    <>
      {event.cover_url && (
        <div className="relative -mx-5 -mt-6 mb-5 h-32 sm:h-40 overflow-hidden sm:-mx-8 lg:-mx-10">
          <img src={event.cover_url} alt={event.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-5 gap-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-[22px] font-semibold text-foreground leading-tight">{event.name}</h1>
              {isLiveEvent && (
                <Badge className="bg-[hsl(0,84%,55%)] text-white text-[9px] uppercase tracking-[0.1em] border-0 animate-pulse font-bold">
                  <span className="relative flex h-1.5 w-1.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  MirrorLive
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/60 tracking-wide mt-0.5">
              {format(new Date(event.event_date), 'MMMM d, yyyy')} · {photos.length} photos
              {favStats.totalFavs > 0 && (
                <> · <Heart className="inline h-3 w-3 text-primary" fill="hsl(var(--primary))" /> {favStats.totalFavs} favorites from {favStats.uniqueGuests} guest{favStats.uniqueGuests !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
          {isOwner && (
            <Select value={event.delivery_status || 'ready'} onValueChange={onDeliveryStatusChange}>
              <SelectTrigger className="h-7 w-auto gap-1 border-border/50 text-[10px]">
                <DeliveryStatusBadge status={event.delivery_status || 'ready'} />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_STATUSES.map(s => (
                  <SelectItem key={s} value={s} className="text-[11px]">
                    <DeliveryStatusBadge status={s} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOwner && (
            <>
              <Button onClick={onUploadClick} disabled={uploadDisabled}
                variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-[10px] h-7 px-2.5 uppercase tracking-[0.06em]">
                <Upload className="mr-1 h-3 w-3" />Upload
              </Button>
              <Button onClick={onZipUploadClick} disabled={uploadDisabled}
                variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-[10px] h-7 px-2.5 uppercase tracking-[0.06em]">
                <FileArchive className="mr-1 h-3 w-3" />Upload ZIP
              </Button>
              <Button variant="ghost" size="sm" onClick={onShareClick} className="text-primary hover:bg-primary/10 text-[10px] h-7 px-2.5 uppercase tracking-[0.06em]">
                <Share2 className="mr-1 h-3 w-3" />Share
              </Button>
              <Button variant="ghost" size="sm" onClick={onGoLive} className="text-primary hover:bg-primary/10 text-[10px] h-7 px-2.5 uppercase tracking-[0.06em]">
                <Badge className="mr-1 h-3 w-3 rounded-full bg-destructive p-0" />Go Live
              </Button>
              <Button variant="ghost" size="sm" onClick={onSettingsClick} className="text-primary hover:bg-primary/10 text-[10px] h-7 px-2.5 uppercase tracking-[0.06em]">
                <Settings className="mr-1 h-3 w-3" />Settings
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
