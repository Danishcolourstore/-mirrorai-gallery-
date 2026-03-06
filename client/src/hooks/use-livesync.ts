import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LivePhoto {
  id: string;
  url: string;
  file_name: string;
  created_at: string;
  ai_blur_score?: number;
  ai_duplicate?: boolean;
  ai_hero?: boolean;
}

export interface AiCullingStats {
  total: number;
  accepted: number;
  rejected_blur: number;
  rejected_duplicate: number;
  hero_picks: number;
}

export function useLiveSync(eventId: string | undefined) {
  const [photos, setPhotos] = useState<LivePhoto[]>([]);
  const [connected, setConnected] = useState(false);
  const [cullingStats, setCullingStats] = useState<AiCullingStats>({
    total: 0,
    accepted: 0,
    rejected_blur: 0,
    rejected_duplicate: 0,
    hero_picks: 0,
  });

  const refresh = useCallback(async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    if (data) setPhotos(data as unknown as LivePhoto[]);
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    refresh();

    const channel = supabase
      .channel(`live-photos-${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "photos", filter: `event_id=eq.${eventId}` },
        (payload) => {
          setPhotos((prev) => [payload.new as unknown as LivePhoto, ...prev]);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, refresh]);

  return { photos, connected, cullingStats, refresh };
}
