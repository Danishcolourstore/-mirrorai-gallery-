import { useState } from 'react';
import { EyeOff, Eye, Download, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GalleryOwnerToolbarProps {
  ownerName: string;
  eventId: string;
  onDownloadAll: () => void;
}

export function GalleryOwnerToolbar({ ownerName, eventId, onDownloadAll }: GalleryOwnerToolbarProps) {
  const { toast } = useToast();
  const [notesOpen, setNotesOpen] = useState(false);
  const [note, setNote] = useState('');

  const saveNote = async () => {
    // Save as a photo_comment with the owner's name
    if (!note.trim()) return;
    await (supabase.from('photo_comments').insert({
      event_id: eventId,
      photo_id: eventId, // general event note
      guest_name: `${ownerName} (Owner)`,
      comment: note.trim(),
    } as any) as any);
    toast({ title: 'Note saved' });
    setNote('');
    setNotesOpen(false);
  };

  return (
    <div className="sticky top-0 z-30 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Gallery Owner</span>
          <span className="text-[11px] opacity-70">— {ownerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotesOpen(!notesOpen)}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-7 text-[10px] uppercase tracking-wider"
          >
            <MessageSquare className="h-3 w-3 mr-1" /> Notes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadAll}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-7 text-[10px] uppercase tracking-wider"
          >
            <Download className="h-3 w-3 mr-1" /> Download All
          </Button>
        </div>
      </div>
      {notesOpen && (
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="bg-primary-foreground/10 p-3 space-y-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder="Leave a note for the photographer..."
              rows={3}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-[13px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-[9px] opacity-50">{note.length}/500</span>
              <Button size="sm" onClick={saveNote} className="h-7 text-[10px] bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HidePhotoButton({ photoId, isHidden, onToggle }: { photoId: string; isHidden: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`absolute top-2 left-2 z-10 p-1.5 rounded-full transition-all ${
        isHidden ? 'bg-destructive text-destructive-foreground' : 'bg-background/80 text-foreground/60 hover:bg-background'
      }`}
      title={isHidden ? 'Unhide photo' : 'Hide photo'}
    >
      {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
    </button>
  );
}
