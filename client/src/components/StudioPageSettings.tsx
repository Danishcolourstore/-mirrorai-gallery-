import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudioPageSettingsProps {
  eventId: string;
  initialBrandName?: string;
  initialBrandLogoUrl?: string;
}

export function StudioPageSettings({
  eventId,
  initialBrandName,
  initialBrandLogoUrl,
}: StudioPageSettingsProps) {
  const [brandName, setBrandName] = useState(initialBrandName ?? "");
  const [brandLogoUrl, setBrandLogoUrl] = useState(initialBrandLogoUrl ?? "");
  const { toast } = useToast();

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ brand_name: brandName, brand_logo_url: brandLogoUrl })
      .eq("id", eventId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Studio settings updated." });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="brand-name">Studio Name</Label>
        <Input
          id="brand-name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Your Studio Name"
        />
      </div>
      <div>
        <Label htmlFor="brand-logo">Logo URL</Label>
        <Input
          id="brand-logo"
          value={brandLogoUrl}
          onChange={(e) => setBrandLogoUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <Button onClick={handleSave}>Save Studio Settings</Button>
    </div>
  );
}
