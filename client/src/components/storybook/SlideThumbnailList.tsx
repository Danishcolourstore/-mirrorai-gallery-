import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideCanvas } from "./SlideCanvas";
import type { Slide } from "./types";

interface SlideThumbnailListProps {
  slides: Slide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}

export function SlideThumbnailList({
  slides,
  activeIndex,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: SlideThumbnailListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== toIndex) {
        onReorder(dragIndex, toIndex);
      }
      setDragIndex(null);
      setDropTarget(null);
    },
    [dragIndex, onReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropTarget(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
          Slides ({slides.length})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(i)}
            className={`group relative rounded-md border-2 cursor-pointer transition-all ${
              activeIndex === i
                ? "border-primary ring-1 ring-primary/20"
                : "border-border hover:border-foreground/20"
            } ${dropTarget === i && dragIndex !== i ? "border-dashed border-primary/50" : ""} ${
              dragIndex === i ? "opacity-40" : ""
            }`}
          >
            <div className="absolute top-1 left-1 z-10 flex items-center gap-0.5">
              <div className="bg-black/50 backdrop-blur-sm text-white rounded px-1.5 py-0.5 text-[9px] font-bold">
                {i + 1}
              </div>
              <GripVertical className="h-3 w-3 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            </div>

            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(i);
                }}
                className="absolute top-1 right-1 z-10 bg-black/50 backdrop-blur-sm rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>
            )}

            <div className="p-1">
              <SlideCanvas slide={slide} size={120} className="w-full rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border">
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Slide
        </Button>
      </div>
    </div>
  );
}
