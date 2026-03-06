import { ArrowLeft, Play, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SlideToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onBack: () => void;
  onPreview: () => void;
  onExport: () => void;
  exporting: boolean;
}

export function SlideToolbar({
  title,
  onTitleChange,
  onBack,
  onPreview,
  onExport,
  exporting,
}: SlideToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      <div className="flex-1 max-w-xs">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Story title…"
          className="h-8 text-sm border-transparent hover:border-border focus:border-primary bg-transparent"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview} className="gap-1.5">
          <Play className="h-3.5 w-3.5" />
          Preview
        </Button>
        <Button size="sm" onClick={onExport} disabled={exporting} className="gap-1.5">
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export
        </Button>
      </div>
    </div>
  );
}
