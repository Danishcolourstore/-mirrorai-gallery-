import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { StorybookEditor } from "@/components/storybook/StorybookEditor";
import { Skeleton } from "@/components/ui/skeleton";
import type { SlidePhoto } from "@/components/storybook/types";

const SAMPLE_PHOTOS: SlidePhoto[] = [
  { id: "sample-1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", file_name: "ceremony-1.jpg" },
  { id: "sample-2", url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80", file_name: "couple-portrait.jpg" },
  { id: "sample-3", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80", file_name: "bride-prep.jpg" },
  { id: "sample-4", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80", file_name: "venue-wide.jpg" },
  { id: "sample-5", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80", file_name: "rings-detail.jpg" },
  { id: "sample-6", url: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&q=80", file_name: "first-dance.jpg" },
  { id: "sample-7", url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80", file_name: "cake-cutting.jpg" },
  { id: "sample-8", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80", file_name: "bouquet-toss.jpg" },
  { id: "sample-9", url: "https://images.unsplash.com/photo-1549417229-7686ac5595fd?w=600&q=80", file_name: "reception-table.jpg" },
  { id: "sample-10", url: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=600&q=80", file_name: "sparkler-exit.jpg" },
  { id: "sample-11", url: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=600&q=80", file_name: "ceremony-arch.jpg" },
  { id: "sample-12", url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80", file_name: "sunset-portrait.jpg" },
];

interface Props {
  session: Session | null;
}

export default function StorybookEditorPage({ session }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("Wedding Gallery");
  const [photos, setPhotos] = useState<SlidePhoto[]>(SAMPLE_PHOTOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    if (!session) {
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.from("events").select("name").eq("id", id).single(),
      supabase
        .from("photos")
        .select("id, url, file_name")
        .eq("event_id", id)
        .order("created_at", { ascending: false }),
    ]).then(([eventRes, photosRes]) => {
      if (eventRes.data) setEventName(eventRes.data.name);
      if (photosRes.data && photosRes.data.length > 0) {
        setPhotos(photosRes.data as SlidePhoto[]);
      }
      setLoading(false);
    });
  }, [session, id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <p className="text-xs text-muted-foreground">Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <StorybookEditor
      eventId={id!}
      eventName={eventName}
      photos={photos}
    />
  );
}
