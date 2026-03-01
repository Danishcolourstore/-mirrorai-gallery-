import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { Grid2X2, LayoutGrid, AlignJustify, Newspaper, GalleryHorizontalEnd, Clapperboard, Sparkles, LayoutDashboard, Loader2, Copy, ExternalLink, Instagram } from 'lucide-react';
import { StudioPageSettings } from '@/components/StudioPageSettings';
import { DualStorySetup } from '@/components/DualStorySetup';
import { GalleryModeSelector } from '@/components/GalleryModeSelector';
import { CameraSetupCard } from '@/components/CameraSetupCard';

const LAYOUT_OPTIONS = [
  { value: 'classic', label: 'Classic', icon: Grid2X2 },
  { value: 'masonry', label: 'Masonry', icon: LayoutGrid },
  { value: 'justified', label: 'Justified', icon: AlignJustify },
  { value: 'editorial', label: 'Editorial', icon: Newspaper },
  { value: 'editorial-collage', label: 'Collage', icon: GalleryHorizontalEnd },
  { value: 'cascade', label: 'Cascade', icon: Sparkles },
  { value: 'cinematic', label: 'Cinematic', icon: Clapperboard },
  { value: 'mosaic', label: 'Mosaic', icon: LayoutDashboard },
  { value: 'timeline', label: 'Timeline', icon: LayoutGrid },
  { value: 'story', label: 'Story', icon: Clapperboard },
  { value: 'diptych', label: 'Diptych', icon: GalleryHorizontalEnd },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
] as const;

const PREVIEW_HEIGHTS: Record<string, number[]> = {
  classic:    [1, 1, 1, 1, 1, 1],
  masonry:    [3, 2, 4, 2, 3, 2],
  justified:  [2, 3, 2, 3, 2, 3],
  editorial:  [4, 3, 5, 3, 4, 3],
  'editorial-collage': [5, 2, 3, 1, 4, 2],
  cascade:    [5, 3, 3, 4, 3, 4],
  cinematic:  [4, 2, 5, 2, 4, 3],
  mosaic:     [5, 1, 3, 2, 4, 1],
  timeline:   [4, 2, 3, 5, 2, 4],
  story:      [5, 5, 5, 5, 5, 5],
  diptych:    [3, 3, 3, 3, 3, 3],
  instagram:  [1, 1, 1, 1, 1, 1],
};

interface EventData {
  id: string;
  name: string;
  slug: string;
  event_date: string;
  location: string | null;
  cover_url: string | null;
  gallery_pin: string | null;
  gallery_layout: string;
  gallery_style?: string;
  downloads_enabled: boolean;
  download_resolution: string;
  watermark_enabled: boolean;
  is_published: boolean;
  selection_mode_enabled?: boolean;
  album_selection_enabled?: boolean;
  album_min_photos?: number;
  album_max_photos?: number;
  album_message?: string | null;
  album_deadline?: string | null;
  album_require_contact?: boolean;
  expires_at?: string | null;
  delivery_status?: string;
  retouch_enabled?: boolean;
  retouch_limit?: number;
  user_id?: string;
  owner_email?: string | null;
  owner_name?: string | null;
  dual_story_enabled?: boolean;
  person1_name?: string;
  person2_name?: string;
  person1_face_token?: string | null;
  person2_face_token?: string | null;
  gallery_mode?: string;
}

interface EventSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventData;
  onUpdated: () => void;
}

export function EventSettingsModal({ open, onOpenChange, event, onUpdated }: EventSettingsModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(event.name);
  const [date, setDate] = useState(event.event_date);
  const [location, setLocation] = useState(event.location ?? '');
  const [password, setPassword] = useState(event.gallery_pin ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryLayout, setGalleryLayout] = useState(event.gallery_layout);
  const [downloadsEnabled, setDownloadsEnabled] = useState(event.downloads_enabled);
  const [watermarkEnabled, setWatermarkEnabled] = useState(event.watermark_enabled);
  const [isPublished, setIsPublished] = useState(event.is_published);
  const [selectionModeEnabled, setSelectionModeEnabled] = useState(event.selection_mode_enabled ?? false);
  const [albumEnabled, setAlbumEnabled] = useState(event.album_selection_enabled ?? false);
  const [albumMin, setAlbumMin] = useState(event.album_min_photos ?? 1);
  const [albumMax, setAlbumMax] = useState(event.album_max_photos ?? 50);
  const [albumMessage, setAlbumMessage] = useState(event.album_message ?? '');
  const [albumDeadline, setAlbumDeadline] = useState(event.album_deadline ?? '');
  const [albumRequireContact, setAlbumRequireContact] = useState(event.album_require_contact ?? false);
  const [expiresAt, setExpiresAt] = useState(event.expires_at ? event.expires_at.split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const [ownerName, setOwnerName] = useState(event.owner_name ?? '');
  const [ownerEmail, setOwnerEmail] = useState(event.owner_email ?? '');
  const [dualStoryEnabled, setDualStoryEnabled] = useState(event.dual_story_enabled ?? false);
  const [person1Name, setPerson1Name] = useState(event.person1_name ?? 'Bride');
  const [person2Name, setPerson2Name] = useState(event.person2_name ?? 'Groom');
  const [person1FaceToken, setPerson1FaceToken] = useState(event.person1_face_token ?? null);
  const [person2FaceToken, setPerson2FaceToken] = useState(event.person2_face_token ?? null);
  const [galleryMode, setGalleryMode] = useState(event.gallery_mode ?? 'mirrorai');

  // Sync when event changes
  useEffect(() => {
    setTitle(event.name);
    setDate(event.event_date);
    setLocation(event.location ?? '');
    setPassword(event.gallery_pin ?? '');
    setGalleryLayout(event.gallery_layout);
    setDownloadsEnabled(event.downloads_enabled);
    setWatermarkEnabled(event.watermark_enabled);
    setIsPublished(event.is_published);
    setSelectionModeEnabled(event.selection_mode_enabled ?? false);
    setAlbumEnabled(event.album_selection_enabled ?? false);
    setAlbumMin(event.album_min_photos ?? 1);
    setAlbumMax(event.album_max_photos ?? 50);
    setAlbumMessage(event.album_message ?? '');
    setAlbumDeadline(event.album_deadline ?? '');
    setAlbumRequireContact(event.album_require_contact ?? false);
    setExpiresAt(event.expires_at ? event.expires_at.split('T')[0] : '');
    setRetouchEnabled((event as any).retouch_enabled ?? false);
    setRetouchLimit((event as any).retouch_limit ?? 5);
    setOwnerName(event.owner_name ?? '');
    setOwnerEmail(event.owner_email ?? '');
    setDualStoryEnabled(event.dual_story_enabled ?? false);
    setPerson1Name(event.person1_name ?? 'Bride');
    setPerson2Name(event.person2_name ?? 'Groom');
    setPerson1FaceToken(event.person1_face_token ?? null);
    setPerson2FaceToken(event.person2_face_token ?? null);
    setGalleryMode(event.gallery_mode ?? 'mirrorai');
  }, [event]);

  const [retouchEnabled, setRetouchEnabled] = useState((event as any).retouch_enabled ?? false);
  const [retouchLimit, setRetouchLimit] = useState((event as any).retouch_limit ?? 5);

  const handleSave = async () => {
    setSaving(true);

    let coverUrl = event.cover_url;

    if (coverFile) {
      const ext = coverFile.name.split('.').pop();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('event-covers').upload(path, coverFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('event-covers').getPublicUrl(path);
        coverUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('events').update({
      name: title,
      event_date: date,
      location: location || null,
      cover_url: coverUrl,
      gallery_pin: password || null,
      gallery_layout: galleryLayout,
      downloads_enabled: downloadsEnabled,
      watermark_enabled: watermarkEnabled,
      is_published: isPublished,
      selection_mode_enabled: selectionModeEnabled,
      album_selection_enabled: albumEnabled,
      album_min_photos: albumMin,
      album_max_photos: albumMax,
      album_message: albumMessage || null,
      album_deadline: albumDeadline || null,
      album_require_contact: albumRequireContact,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      retouch_enabled: retouchEnabled,
      retouch_limit: retouchLimit,
      owner_name: ownerName || null,
      owner_email: ownerEmail || null,
      dual_story_enabled: dualStoryEnabled,
      person1_name: person1Name,
      person2_name: person2Name,
      gallery_mode: galleryMode,
    } as any).eq('id', event.id);

    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved' });
      onUpdated();
      onOpenChange(false);
    }
    setSaving(false);
  };

  const previewBars = PREVIEW_HEIGHTS[galleryLayout] ?? PREVIEW_HEIGHTS.masonry;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-card border-border p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold">Event Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 mt-1">
          {/* Gallery Link */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Gallery Link</Label>
            <div className="flex gap-1.5">
              <Input value={`${window.location.origin}/event/${event.slug}`} readOnly className="bg-background h-9 text-[12px] font-mono" />
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/event/${event.slug}`); toast({ title: 'Gallery link copied' }); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
                <a href={`/event/${event.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Event Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background h-9 text-[13px]" />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Event Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background h-9 text-[13px]" />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="bg-background h-9 text-[13px]" />
          </div>

          {/* Cover */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Cover Photo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="bg-background h-9 text-[13px]" />
            {event.cover_url && !coverFile && (
              <p className="text-[10px] text-muted-foreground/50">Current cover set. Upload to replace.</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Gallery Password (Optional)</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="4-digit PIN" maxLength={6} className="bg-background h-9 text-[13px]" />
          </div>

          {/* Layout with live preview */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Gallery Layout</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {LAYOUT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGalleryLayout(value)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 border transition-colors text-center ${
                    galleryLayout === value
                      ? 'border-foreground bg-foreground/5 text-foreground'
                      : 'border-border text-muted-foreground/60 hover:border-foreground/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[9px] uppercase tracking-wider leading-none">{label}</span>
                </button>
              ))}
            </div>

            {/* Mini live preview */}
            <div className="border border-border bg-background p-2.5 mt-1.5">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 mb-1.5">Preview</p>
              <div className="flex gap-[2px] items-end h-12">
                {previewBars.map((h, i) => (
                  <div
                    key={`${galleryLayout}-${i}`}
                    className="flex-1 bg-muted-foreground/15 transition-all duration-300"
                    style={{ height: `${(h / 5) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Gallery Mode */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Gallery Mode</Label>
            <GalleryModeSelector value={galleryMode} onChange={setGalleryMode} userId={event.user_id} />
          </div>

          {/* Download & publish permissions */}
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Settings</p>
            <div className="flex items-center justify-between">
              <Label className="text-[12px] text-foreground/80 font-normal">Downloads enabled</Label>
              <Switch checked={downloadsEnabled} onCheckedChange={setDownloadsEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[12px] text-foreground/80 font-normal">Watermark enabled</Label>
              <Switch checked={watermarkEnabled} onCheckedChange={setWatermarkEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[12px] text-foreground/80 font-normal">Published</Label>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[12px] text-foreground/80 font-normal">Photo Selection Mode</Label>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Guests can select & submit photos</p>
              </div>
              <Switch checked={selectionModeEnabled} onCheckedChange={setSelectionModeEnabled} />
            </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[12px] text-foreground/80 font-normal">Gallery Expiry</Label>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Auto-expire gallery on a date</p>
              </div>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-[140px] h-8 text-[12px] bg-background" />
            </div>

          {/* AI Retouch Settings */}
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">AI Retouch</p>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[12px] text-foreground/80 font-normal">Enable AI Retouch</Label>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Guests can retouch photos with AI</p>
              </div>
              <Switch checked={retouchEnabled} onCheckedChange={setRetouchEnabled} />
            </div>
            {retouchEnabled && (
              <div className="space-y-1 pl-1">
                <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Retouches per guest</Label>
                <Input type="number" min={1} max={50} value={retouchLimit} onChange={(e) => setRetouchLimit(parseInt(e.target.value) || 5)} className="h-8 text-[12px] bg-background w-24" />
              </div>
            )}
          </div>

          {/* Album Selection Settings */}
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Album Selection</p>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[12px] text-foreground/80 font-normal">Enable Album Selection</Label>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Clients pick photos for their album</p>
              </div>
              <Switch checked={albumEnabled} onCheckedChange={setAlbumEnabled} />
            </div>

            {albumEnabled && (
              <div className="space-y-3 pl-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Min Photos</Label>
                    <Input type="number" min={1} value={albumMin} onChange={(e) => setAlbumMin(parseInt(e.target.value) || 1)} className="h-8 text-[12px] bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Max Photos</Label>
                    <Input type="number" min={1} value={albumMax} onChange={(e) => setAlbumMax(parseInt(e.target.value) || 50)} className="h-8 text-[12px] bg-background" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Message to Client</Label>
                  <Input value={albumMessage} onChange={(e) => setAlbumMessage(e.target.value.slice(0, 200))}
                    placeholder="Please select photos for your album…" className="h-8 text-[12px] bg-background" />
                  <p className="text-[9px] text-muted-foreground/40 text-right">{albumMessage.length}/200</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Deadline (Optional)</Label>
                  <Input type="date" value={albumDeadline} onChange={(e) => setAlbumDeadline(e.target.value)} className="h-8 text-[12px] bg-background" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[12px] text-foreground/80 font-normal">Require name & phone</Label>
                  <Switch checked={albumRequireContact} onCheckedChange={setAlbumRequireContact} />
                </div>
              </div>
            )}
          </div>

          {/* Live Camera Setup */}
          {event.user_id && (
            <div className="pt-2 border-t border-border">
              <CameraSetupCard eventId={event.id} userId={event.user_id} />
            </div>
          )}

          {/* Dual Story Mode */}
          <DualStorySetup
            eventId={event.id}
            dualStoryEnabled={dualStoryEnabled}
            person1Name={person1Name}
            person2Name={person2Name}
            person1FaceToken={person1FaceToken}
            person2FaceToken={person2FaceToken}
            onUpdate={(fields) => {
              if ('dual_story_enabled' in fields) setDualStoryEnabled(fields.dual_story_enabled);
              if ('person1_name' in fields) setPerson1Name(fields.person1_name);
              if ('person2_name' in fields) setPerson2Name(fields.person2_name);
              if ('person1_face_token' in fields) setPerson1FaceToken(fields.person1_face_token);
              if ('person2_face_token' in fields) setPerson2FaceToken(fields.person2_face_token);
            }}
          />

          {/* Gallery Owner Invite */}
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">Gallery Owner (Couple)</p>
            <p className="text-[10px] text-muted-foreground/50">Invite the couple to manage this gallery — hide photos, download all, leave notes.</p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Name</Label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Aisha & Rahul" className="h-8 text-[12px] bg-background" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Email</Label>
                <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="couple@email.com" className="h-8 text-[12px] bg-background" />
              </div>
              {ownerEmail && (
                <div className="bg-secondary/40 p-2.5 space-y-1">
                  <p className="text-[10px] text-muted-foreground/60">Owner Link:</p>
                  <p className="text-[11px] font-mono text-foreground/70 break-all">{window.location.origin}/event/{event.slug}/gallery?owner=true</p>
                </div>
              )}
            </div>
          </div>

          {/* Studio Page Settings - show when gallery_style is 'studio' */}
          {event.gallery_style === 'studio' && event.user_id && (
            <div className="pt-2 border-t border-border">
              <StudioPageSettings userId={event.user_id} />
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-gold-hover text-primary-foreground h-9 text-[12px] tracking-wide uppercase font-medium mt-1"
          >
            {saving ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving...</>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
