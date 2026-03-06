import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface StudioPageSettingsProps {
  settings?: Record<string, any>;
  onChange?: (settings: Record<string, any>) => void;
}

export function StudioPageSettings({ settings = {}, onChange }: StudioPageSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Studio Page Title</Label>
        <Input
          placeholder="Your Studio Name"
          value={settings.title || ""}
          onChange={(e) => onChange?.({ ...settings, title: e.target.value })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Contact Form</Label>
        <Switch
          checked={settings.showContact || false}
          onCheckedChange={(checked) => onChange?.({ ...settings, showContact: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Pricing</Label>
        <Switch
          checked={settings.showPricing || false}
          onCheckedChange={(checked) => onChange?.({ ...settings, showPricing: checked })}
        />
      </div>
    </div>
  );
}
