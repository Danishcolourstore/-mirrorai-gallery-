import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, CheckCheck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  photo_id: string;
  event_id: string;
  guest_name: string;
  comment: string;
  is_read: boolean;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
}

interface Props {
  eventId: string;
}

export function CommentsTab({ eventId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    const { data } = await (supabase
      .from('photo_comments' as any)
      .select('*') as any)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (data) setComments(data as Comment[]);

    // Get photo thumbnails
    const { data: photoData } = await (supabase
      .from('photos')
      .select('id, url') as any)
      .eq('event_id', eventId);
    if (photoData) {
      const map: Record<string, string> = {};
      (photoData as Photo[]).forEach(p => { map[p.id] = p.url; });
      setPhotos(map);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const markAllRead = async () => {
    const unread = comments.filter(c => !c.is_read).map(c => c.id);
    if (unread.length === 0) return;
    for (const id of unread) {
      await (supabase.from('photo_comments' as any).update({ is_read: true }) as any).eq('id', id);
    }
    fetchComments();
    toast({ title: 'All comments marked as read' });
  };

  const deleteComment = async (id: string) => {
    await (supabase.from('photo_comments' as any).delete() as any).eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Comment deleted' });
  };

  const unreadCount = comments.filter(c => !c.is_read).length;

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest">Loading comments…</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-16 text-center">
        <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/15" />
        <p className="mt-3 font-serif text-sm text-muted-foreground/50">No comments yet</p>
        <p className="mt-1 text-[11px] text-muted-foreground/40">Guest comments will appear here</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-muted-foreground/60">
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
          {unreadCount > 0 && <span className="ml-1.5 text-primary font-medium">({unreadCount} new)</span>}
        </p>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}
            className="text-[10px] h-7 px-2.5 uppercase tracking-[0.06em] text-primary hover:bg-primary/10">
            <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {comments.map(c => (
          <div key={c.id} className={`flex items-start gap-3 p-3 border border-border rounded-sm ${!c.is_read ? 'bg-primary/5 border-primary/20' : ''}`}>
            {photos[c.photo_id] && (
              <img src={photos[c.photo_id]} alt="" className="w-10 h-10 object-cover rounded-sm shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!c.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                <span className="text-[12px] font-medium text-foreground">{c.guest_name}</span>
                <span className="text-[10px] text-muted-foreground/40">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{c.comment}</p>
            </div>
            <button onClick={() => deleteComment(c.id)}
              className="shrink-0 text-muted-foreground/30 hover:text-destructive transition-colors p-1">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
