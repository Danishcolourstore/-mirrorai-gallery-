import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, Camera, Heart, CalendarDays, ArrowRight, Share2, Link2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface Photo {
  id: string;
  url: string;
  file_name: string | null;
}

interface AlbumEvent {
  id: string;
  name: string;
  album_min_photos: number;
  album_max_photos: number;
  album_message: string | null;
  album_deadline: string | null;
  album_require_contact: boolean;
  user_id: string;
}

interface Props {
  event: AlbumEvent;
  photos: Photo[];
  studioName: string;
}

type Phase = 'welcome' | 'selecting' | 'confirm' | 'success';

export function AlbumSelectionMode({ event, photos, studioName }: Props) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [selected, setSelected] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [filter, setFilter] = useState<'all' | 'selected'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Check if already submitted
  useEffect(() => {
    const key = `album_submitted_${event.id}`;
    if (localStorage.getItem(key) === 'true') {
      setAlreadySubmitted(true);
      setPhase('success');
    }
  }, [event.id]);

  const toggleSelect = (photoId: string) => {
    if (selected.includes(photoId)) {
      setSelected(prev => prev.filter(id => id !== photoId));
    } else {
      if (selected.length >= event.album_max_photos) {
        toast({ title: `You can only select ${event.album_max_photos} photos for your album` });
        return;
      }
      setSelected(prev => [...prev, photoId]);
    }
  };

  const canSubmit = selected.length >= event.album_min_photos &&
    (!event.album_require_contact || (clientName.trim() && clientPhone.trim()));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const selectionOrder = selected.map((id, idx) => ({ photo_id: id, order: idx + 1 }));

    const { error } = await (supabase.from('album_selections' as any).insert({
      event_id: event.id,
      client_name: clientName.trim() || 'Guest',
      client_phone: clientPhone.trim() || '',
      selected_photo_ids: selected,
      selection_order: selectionOrder,
    } as any) as any);

    if (error) {
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
    } else {
      localStorage.setItem(`album_submitted_${event.id}`, 'true');
      setAlreadySubmitted(true);
      setPhase('success');
    }
    setSubmitting(false);
  };

  const displayPhotos = filter === 'selected' ? photos.filter(p => selected.includes(p.id)) : photos;
  const progress = (selected.length / event.album_max_photos) * 100;

  // ── WELCOME SCREEN ──
  if (phase === 'welcome') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-md w-full text-center space-y-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">{studioName}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            Your Album Awaits ✨
          </h1>
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed max-w-sm mx-auto">
            {event.album_message || "Please select the photos you'd love in your wedding album. Your photographer will use these to create your perfect album."}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-full px-3.5 py-2 text-[11px] text-muted-foreground">
              <Camera className="h-3.5 w-3.5 text-primary" /> {photos.length} photos
            </div>
            <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-full px-3.5 py-2 text-[11px] text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-primary" /> Select {event.album_min_photos}–{event.album_max_photos}
            </div>
            {event.album_deadline && (
              <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-full px-3.5 py-2 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> By {format(new Date(event.album_deadline), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {event.album_require_contact && (
            <div className="space-y-3 pt-2 max-w-xs mx-auto">
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)}
                placeholder="Your name" className="h-11 text-[13px] text-center bg-card border-border/50" />
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Phone number" type="tel" className="h-11 text-[13px] text-center bg-card border-border/50" />
            </div>
          )}

          <Button
            onClick={() => setPhase('selecting')}
            disabled={event.album_require_contact && (!clientName.trim() || !clientPhone.trim())}
            className="bg-primary text-primary-foreground h-12 px-8 text-[12px] uppercase tracking-[0.1em] font-medium rounded-full"
          >
            Start Selecting <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (phase === 'success') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-md w-full text-center space-y-5">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">{studioName}</p>
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">Selection Submitted!</h1>
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed max-w-sm mx-auto">
            Thank you{clientName ? ` ${clientName}` : ''}! Your album selection has been sent to {studioName}. They will be in touch with you soon.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" className="rounded-full h-10 text-[11px] uppercase tracking-wider"
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: 'Link saved!' }); }}>
              <Link2 className="mr-1.5 h-3.5 w-3.5" /> Save Gallery Link
            </Button>
            <Button variant="outline" className="rounded-full h-10 text-[11px] uppercase tracking-wider"
              onClick={() => {
                if (navigator.share) navigator.share({ url: window.location.href, title: event.name });
                else { navigator.clipboard.writeText(window.location.href); toast({ title: 'Link copied!' }); }
              }}>
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share Gallery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── CONFIRM MODAL ──
  if (phase === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
        <div className="bg-card border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4">
          <h2 className="font-serif text-xl font-semibold text-center">Submit Your Album Selection</h2>
          <p className="text-[13px] text-muted-foreground text-center">{selected.length} photos selected</p>

          {clientName && (
            <p className="text-[12px] text-muted-foreground/70 text-center">{clientName} · {clientPhone}</p>
          )}

          <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto">
            {selected.map((id, idx) => {
              const photo = photos.find(p => p.id === id);
              if (!photo) return null;
              return (
                <div key={id} className="relative aspect-square overflow-hidden">
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-11 text-[11px] uppercase tracking-wider"
              onClick={() => setPhase('selecting')}>Review Selection</Button>
            <Button className="flex-1 h-11 bg-primary text-primary-foreground text-[11px] uppercase tracking-wider"
              disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Yes, Submit! →'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── SELECTION MODE ──
  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="font-serif text-[13px] text-foreground/70 hidden sm:block">{studioName}</p>
          <div className="flex-1 sm:flex-initial mx-4 text-center">
            <p className="text-[12px] font-medium text-foreground">
              <span className="text-primary font-semibold">{selected.length}</span> of {event.album_max_photos} selected
            </p>
            <Progress value={progress} className="h-1 mt-1.5 max-w-[200px] mx-auto" />
          </div>
          <Button
            onClick={() => setPhase('confirm')}
            disabled={!canSubmit || alreadySubmitted}
            className={`h-9 px-4 text-[10px] uppercase tracking-[0.08em] rounded-full font-medium transition-all ${
              canSubmit && !alreadySubmitted
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            title={
              alreadySubmitted ? 'Selection already submitted' :
              selected.length < event.album_min_photos ? `Select at least ${event.album_min_photos - selected.length} more photos` : ''
            }
          >
            {alreadySubmitted ? (
              <><Check className="mr-1.5 h-3 w-3" /> Submitted</>
            ) : (
              'Submit Selection'
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-0 mb-5 border-b border-border/50">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-2.5 text-[11px] uppercase tracking-[0.08em] border-b-2 transition-colors ${
              filter === 'all' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground/40'
            }`}>All Photos</button>
          <button onClick={() => setFilter('selected')}
            className={`px-3 py-2.5 text-[11px] uppercase tracking-[0.08em] border-b-2 transition-colors flex items-center gap-1.5 ${
              filter === 'selected' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground/40'
            }`}>
            <Check className="h-3 w-3" /> Selected
            {selected.length > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-px leading-none">{selected.length}</span>
            )}
          </button>
        </div>

        {/* Photo grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2">
          {displayPhotos.map((photo) => {
            const idx = selected.indexOf(photo.id);
            const isSelected = idx >= 0;
            return (
              <div
                key={photo.id}
                onClick={() => toggleSelect(photo.id)}
                className={`relative mb-2 break-inside-avoid cursor-pointer group transition-all duration-200 overflow-hidden ${
                  isSelected ? 'ring-[3px] ring-primary scale-[1.01]' : 'hover:brightness-95'
                }`}
              >
                <img src={photo.url} alt="" className="w-full block" loading="lazy" />

                {/* Dark overlay on hover */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-200 pointer-events-none" />
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold shadow-md">
                    {idx + 1}
                  </div>
                )}

                {/* Unselected hover indicator */}
                {!isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </div>
            );
          })}
        </div>

        {filter === 'selected' && selected.length === 0 && (
          <div className="py-20 text-center">
            <Camera className="mx-auto h-8 w-8 text-muted-foreground/15" />
            <p className="mt-3 text-[13px] text-muted-foreground/50">No photos selected yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground/35">Tap any photo to select it</p>
          </div>
        )}
      </div>
    </div>
  );
}
