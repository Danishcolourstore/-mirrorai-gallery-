import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { EventCard } from "@/components/EventCard";
import { CreateEventModal } from "@/components/CreateEventModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  session: Session | null;
}

export default function Events({ session }: Props) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/");
      return;
    }
    supabase
      .from("events")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, [session, navigate]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>
      {events.length === 0 ? (
        <p className="text-muted-foreground">No events yet. Create your first event to get started.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              slug={event.slug}
              date={event.date}
              photoCount={event.photo_count ?? 0}
              coverUrl={event.cover_url}
              galleryMode={event.gallery_mode}
              onShare={() => {}}
              onEdit={() => navigate(`/event/${event.id}`)}
              onDelete={() => {}}
              onClick={() => navigate(`/event/${event.id}`)}
            />
          ))}
        </div>
      )}
      <CreateEventModal open={showCreate} onOpenChange={setShowCreate} />
    </DashboardLayout>
  );
}
