import { ArrowLeft, Play, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { ExportProgress } from "@/hooks/use-export-slides";

interface SlideToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onBack: () => void;
  onPreview: () => void;
  onExport: () => void;
  exporting: boolean;
  exportProgress: ExportProgress;
  slideCount: number;
}

function progressLabel(p: ExportProgress): string {
  if (p.phase === "rendering") return `Rendering slide ${p.current} of ${p.total}…`;
  if (p.phase === "packaging") return "Packaging ZIP…";
  return "";
}

export function SlideToolbar({
  title,
  onTitleChange,
  onBack,
  onPreview,
  onExport,
  exporting,
  exportProgress,
  slideCount,
}: SlideToolbarProps) {
  const pct =
    exportProgress.total > 0
      ? Math.round((exportProgress.current / exportProgress.total) * 100)
      : 0;

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-2">
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
              <Instagram className="h-3.5 w-3.5" />
            )}
            {exporting
              ? "Exporting…"
              : `Download Instagram Carousel${slideCount > 0 ? ` (${slideCount})` : ""}`}
          </Button>
        </div>
      </div>

      {exporting && (
        <div className="px-4 pb-2 flex items-center gap-3">
          <Progress value={pct} className="flex-1 h-1.5" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap min-w-[140px]">
            {progressLabel(exportProgress)}
          </span>
        </div>
      )}
    </div>
  );
}
