import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Chapter {
  id: string;
  name: string;
  description: string | null;
  cover_photo_id: string | null;
  order_index: number;
  photo_count?: number;
  cover_url?: string;
}

interface ChapterViewProps {
  eventId: string;
  eventName: string;
  onSelectChapter: (chapterId: string) => void;
  onViewAll: () => void;
}

export function ChapterView({ eventId, eventName, onSelectChapter, onViewAll }: ChapterViewProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChapters = useCallback(async () => {
    const { data } = await (supabase
      .from('gallery_chapters' as any)
      .select('*') as any)
      .eq('event_id', eventId)
      .order('order_index', { ascending: true });

    if (data) {
      const chapters = data as Chapter[];

      // Get photo counts and cover URLs
      for (const ch of chapters) {
        const { count } = await (supabase
          .from('chapter_photos' as any)
          .select('*', { count: 'exact', head: true }) as any)
          .eq('chapter_id', ch.id);
        ch.photo_count = count ?? 0;

        if (ch.cover_photo_id) {
          const { data: photo } = await (supabase
            .from('photos')
            .select('url') as any)
            .eq('id', ch.cover_photo_id)
            .maybeSingle();
          ch.cover_url = (photo as any)?.url;
        }
      }

      setChapters(chapters);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest">Loading chapters…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground text-center mb-8 tracking-tight">{eventName}</h1>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className="group relative aspect-[4/3] overflow-hidden text-left"
          >
            {chapter.cover_url ? (
              <img src={chapter.cover_url} alt={chapter.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            ) : (
              <div className="absolute inset-0 bg-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <h3 className="font-serif text-lg sm:text-xl text-white font-light leading-tight">{chapter.name}</h3>
              <p className="text-[11px] text-white/50 mt-1 font-sans">{chapter.photo_count ?? 0} photos</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onViewAll}
          className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60 hover:text-foreground transition-colors font-sans">
          View All Photos →
        </button>
      </div>
    </div>
  );
}

interface ChapterNavigationProps {
  chapters: { id: string; name: string }[];
  currentIndex: number;
  onNavigate: (chapterId: string) => void;
  onBack: () => void;
}

export function ChapterNavigation({ chapters, currentIndex, onNavigate, onBack }: ChapterNavigationProps) {
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="border-t border-border mt-10 pt-6 px-4">
      <button onClick={onBack}
        className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60 hover:text-foreground transition-colors mb-6 flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> All Chapters
      </button>
      <div className="flex items-center justify-between">
        {prev ? (
          <button onClick={() => onNavigate(prev.id)}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> {prev.name}
          </button>
        ) : <div />}
        {next ? (
          <button onClick={() => onNavigate(next.id)}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            {next.name} <ArrowRight className="h-3 w-3" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
