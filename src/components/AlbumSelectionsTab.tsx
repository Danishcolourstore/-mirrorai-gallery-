import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileDown, Check, Copy, MessageCircle, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface AlbumSelection {
  id: string;
  client_name: string;
  client_phone: string;
  selected_photo_ids: string[];
  selection_order: { photo_id: string; order: number }[];
  submitted_at: string;
  is_reviewed: boolean;
  reviewed_at: string | null;
}

interface Photo {
  id: string;
  url: string;
  file_name: string | null;
}

interface Props {
  eventId: string;
  eventName: string;
  eventSlug: string;
}

export function AlbumSelectionsTab({ eventId, eventName, eventSlug }: Props) {
  const { toast } = useToast();
  const [selections, setSelections] = useState<AlbumSelection[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: sels } = await (supabase.from('album_selections' as any).select('*') as any)
        .eq('event_id', eventId).order('submitted_at', { ascending: false });
      setSelections((sels || []) as AlbumSelection[]);

      const { data: photoData } = await (supabase.from('photos').select('id, url, file_name') as any)
        .eq('event_id', eventId);
      setPhotos((photoData || []) as Photo[]);
      setLoading(false);
    };
    load();
  }, [eventId]);

  const markReviewed = async (selId: string) => {
    await (supabase.from('album_selections' as any).update({
      is_reviewed: true,
      reviewed_at: new Date().toISOString(),
    } as any) as any).eq('id', selId);
    setSelections(prev => prev.map(s => s.id === selId ? { ...s, is_reviewed: true, reviewed_at: new Date().toISOString() } : s));
    toast({ title: 'Marked as reviewed' });
  };

  const downloadZip = async (sel: AlbumSelection) => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${sel.client_name}_Album_Selection`);
      const selectedPhotos = sel.selected_photo_ids.map(id => photos.find(p => p.id === id)).filter(Boolean) as Photo[];
      for (let i = 0; i < selectedPhotos.length; i++) {
        const p = selectedPhotos[i];
        const res = await fetch(p.url);
        const blob = await res.blob();
        folder?.file(p.file_name ?? `photo-${i + 1}.jpg`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${sel.client_name}_Album_Selection.zip`);
      toast({ title: `${selectedPhotos.length} photos downloaded` });
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
    setDownloading(false);
  };

  const exportCSV = (sel: AlbumSelection) => {
    const rows = sel.selection_order.map(s => {
      const photo = photos.find(p => p.id === s.photo_id);
      return `${s.order},${photo?.file_name || s.photo_id},${s.order}`;
    });
    const csv = `Order,Filename,Selection Order\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sel.client_name}_Album_Selection.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const galleryUrl = `${window.location.origin}/event/${eventSlug}`;

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center mt-6">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Download className="h-7 w-7 text-muted-foreground/20" />
        </div>
        <p className="font-serif text-lg text-muted-foreground">Waiting for client selection</p>
        <p className="mt-2 text-[12px] text-muted-foreground/50 max-w-sm">
          Share the gallery link with your client. They'll see the album selection mode and can choose their favorite photos.
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="rounded-full h-9 text-[10px] uppercase tracking-wider"
            onClick={() => { navigator.clipboard.writeText(galleryUrl); toast({ title: 'Link copied!' }); }}>
            <Copy className="mr-1.5 h-3 w-3" /> Copy Link
          </Button>
          <Button variant="outline" className="rounded-full h-9 text-[10px] uppercase tracking-wider"
            onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`Check out your gallery and select your album photos: ${galleryUrl}`)}`, '_blank'); }}>
            <MessageCircle className="mr-1.5 h-3 w-3" /> WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {selections.length === 1 ? (
        <SelectionView sel={selections[0]} photos={photos} onMarkReviewed={markReviewed}
          onDownloadZip={downloadZip} onExportCSV={exportCSV} downloading={downloading} />
      ) : (
        <Tabs defaultValue={selections[0].id}>
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-0">
            {selections.map((sel, i) => (
              <TabsTrigger key={sel.id} value={sel.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground/50 data-[state=active]:text-foreground">
                Submission {i + 1} — {sel.client_name}
              </TabsTrigger>
            ))}
          </TabsList>
          {selections.map(sel => (
            <TabsContent key={sel.id} value={sel.id}>
              <SelectionView sel={sel} photos={photos} onMarkReviewed={markReviewed}
                onDownloadZip={downloadZip} onExportCSV={exportCSV} downloading={downloading} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function SelectionView({ sel, photos, onMarkReviewed, onDownloadZip, onExportCSV, downloading }: {
  sel: AlbumSelection;
  photos: Photo[];
  onMarkReviewed: (id: string) => void;
  onDownloadZip: (sel: AlbumSelection) => void;
  onExportCSV: (sel: AlbumSelection) => void;
  downloading: boolean;
}) {
  const orderedPhotos = sel.selection_order
    .sort((a, b) => a.order - b.order)
    .map(s => photos.find(p => p.id === s.photo_id))
    .filter(Boolean) as Photo[];

  return (
    <div className="space-y-5 mt-4">
      {/* Summary card */}
      <div className="bg-card border border-border/50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-semibold text-foreground">{sel.client_name}</p>
          {sel.client_phone && <p className="text-[12px] text-muted-foreground/60 mt-0.5">{sel.client_phone}</p>}
          <p className="text-[12px] text-muted-foreground/60 mt-1">
            {sel.selected_photo_ids.length} photos selected · Submitted {format(new Date(sel.submitted_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sel.is_reviewed ? (
            <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> Reviewed
            </span>
          ) : (
            <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-wider rounded-full h-8"
              onClick={() => onMarkReviewed(sel.id)}>
              Mark as Reviewed
            </Button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-wider rounded-full h-8"
          disabled={downloading} onClick={() => onDownloadZip(sel)}>
          <Download className="mr-1.5 h-3 w-3" /> Download ZIP
        </Button>
        <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-wider rounded-full h-8"
          onClick={() => onExportCSV(sel)}>
          <FileDown className="mr-1.5 h-3 w-3" /> Export List
        </Button>
      </div>

      {/* Photo grid with selection numbers */}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2">
        {orderedPhotos.map((photo, idx) => (
          <div key={photo.id} className="relative mb-2 break-inside-avoid overflow-hidden ring-2 ring-primary/30">
            <img src={photo.url} alt="" className="w-full block" loading="lazy" />
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold shadow-md">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
