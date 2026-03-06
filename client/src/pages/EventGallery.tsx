import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  session: Session | null;
}

export default function EventGallery({ session }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/");
      return;
    }
    if (!id) return;

    Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase
        .from("photos")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: false }),
    ]).then(([eventRes, photosRes]) => {
      if (eventRes.data) setEvent(eventRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
      setLoading(false);
    });
  }, [session, id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {event && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground mt-1">
            {photos.length} photos
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={photo.url}
              alt={photo.file_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
