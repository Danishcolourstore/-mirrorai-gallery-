import { ImageIcon, Columns2, LayoutGrid, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlideLayout } from "./types";
import { LAYOUT_META } from "./types";

const LAYOUT_ICONS: Record<SlideLayout, React.ReactNode> = {
  single: <ImageIcon className="h-5 w-5" />,
  diptych: <Columns2 className="h-5 w-5" />,
  editorial: <LayoutGrid className="h-5 w-5" />,
  "instagram-grid": <Grid3X3 className="h-5 w-5" />,
};

interface SlideLayoutSelectorProps {
  value: SlideLayout;
  onChange: (layout: SlideLayout) => void;
}

export function SlideLayoutSelector({ value, onChange }: SlideLayoutSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
        Layout
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.keys(LAYOUT_META) as SlideLayout[]).map((key) => {
          const meta = LAYOUT_META[key];
          const active = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border py-3 px-2 transition-all text-center",
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground/60 hover:border-foreground/30 hover:text-foreground/80",
              )}
            >
              <div className={active ? "text-primary" : ""}>{LAYOUT_ICONS[key]}</div>
              <span className="text-[10px] font-medium leading-none">{meta.label}</span>
              <span className="text-[8px] text-muted-foreground/50 leading-tight">
                up to {meta.maxPhotos}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
