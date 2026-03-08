import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GalleryShell from "@/components/GalleryShell";
import { GalleryExpiredPage } from "@/components/GalleryExpiredPage";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicGallery() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setEvent(data);
        supabase
          .from("photos")
          .select("*")
          .eq("event_id", data.id)
          .order("created_at", { ascending: false })
          .then(({ data: photoData }) => {
            if (photoData) setPhotos(photoData);
            setLoading(false);
          });
      });
  }, [slug]);

  if (loading) {
    return (
      <GalleryShell title="Loading...">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </GalleryShell>
    );
  }

  if (notFound) {
    return <GalleryExpiredPage />;
  }

  return (
    <GalleryShell title={event?.name ?? "Gallery"}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
            <img
              src={photo.url}
              alt={photo.file_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        {photos.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            No photos yet.
          </p>
        )}
      </div>
    </GalleryShell>
  );
}
