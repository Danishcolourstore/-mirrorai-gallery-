import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  session: any;
}

export default function Events({ session }: Props) {
  const [events] = useState<any[]>([]);

  return (
    <DashboardLayout>
      <div className="max-w-[480px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif">Events</h1>
          <Button size="sm" className="rounded-full">
            <Plus className="h-4 w-4 mr-1" /> New Event
          </Button>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No events yet</p>
            <Button variant="outline" className="rounded-full">Create your first event</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => (
              <div key={event.id} className="bg-card border border-border/50 rounded-lg p-4">
                {event.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
