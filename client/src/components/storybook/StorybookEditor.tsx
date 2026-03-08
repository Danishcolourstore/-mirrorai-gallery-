import { useState, useCallback } from "react";
import { Check, X, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useExportSlides } from "@/hooks/use-export-slides";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { SlideToolbar } from "./SlideToolbar";
import { SlideThumbnailList } from "./SlideThumbnailList";
import { SlideCanvas } from "./SlideCanvas";
import { SlideLayoutSelector } from "./SlideLayoutSelector";
import type { Slide, SlideLayout, SlidePhoto } from "./types";
import { LAYOUT_META, createSlide } from "./types";

interface StorybookEditorProps {
  eventId: string;
  eventName: string;
  photos: SlidePhoto[];
}

export function StorybookEditor({ eventId, eventName, photos }: StorybookEditorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [storyTitle, setStoryTitle] = useState(`${eventName} — Story`);
  const [slides, setSlides] = useState<Slide[]>([createSlide("single")]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rightTab, setRightTab] = useState<string>("photos");

  const { progress, exporting, exportSlides, registerNode } = useExportSlides();

  const activeSlide = slides[activeIndex] ?? slides[0];

  const updateSlide = useCallback(
    (index: number, patch: Partial<Slide>) => {
      setSlides((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const handleAddSlide = useCallback(() => {
    const newSlide = createSlide("single");
    setSlides((prev) => [...prev, newSlide]);
    setActiveIndex(slides.length);
  }, [slides.length]);

  const handleDeleteSlide = useCallback(
    (index: number) => {
      if (slides.length <= 1) return;
      setSlides((prev) => prev.filter((_, i) => i !== index));
      setActiveIndex((prev) =>
        prev >= index ? Math.max(0, prev - 1) : prev,
      );
    },
    [slides.length],
  );

  const handleReorder = useCallback(
    (from: number, to: number) => {
      setSlides((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
      setActiveIndex(to);
    },
    [],
  );

  const handleLayoutChange = useCallback(
    (layout: SlideLayout) => {
      const maxPhotos = LAYOUT_META[layout].maxPhotos;
      updateSlide(activeIndex, {
        layout,
        photos: activeSlide.photos.slice(0, maxPhotos),
      });
    },
    [activeIndex, activeSlide.photos, updateSlide],
  );

  const handleAddPhoto = useCallback(
    (photo: SlidePhoto) => {
      const max = LAYOUT_META[activeSlide.layout].maxPhotos;
      if (activeSlide.photos.length >= max) {
        toast({
          title: "Slide full",
          description: `${LAYOUT_META[activeSlide.layout].label} layout supports up to ${max} photos.`,
        });
        return;
      }
      if (activeSlide.photos.some((p) => p.id === photo.id)) return;
      updateSlide(activeIndex, {
        photos: [...activeSlide.photos, photo],
      });
    },
    [activeIndex, activeSlide, updateSlide, toast],
  );

  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      updateSlide(activeIndex, {
        photos: activeSlide.photos.filter((p) => p.id !== photoId),
      });
    },
    [activeIndex, activeSlide.photos, updateSlide],
  );

  const handleExport = useCallback(async () => {
    if (slides.every((s) => s.photos.length === 0)) {
      toast({ title: "Nothing to export", description: "Add photos to at least one slide." });
      return;
    }
    const result = await exportSlides(slides, storyTitle);
    if (result.success) {
      toast({
        title: "Instagram Carousel Ready!",
        description: `${result.count} slide${result.count !== 1 ? "s" : ""} exported at 1080×1080.`,
      });
    } else if (result.reason === "render-failed") {
      toast({ title: "Export failed", description: "Could not render slides.", variant: "destructive" });
    } else if (result.reason === "error") {
      toast({ title: "Export failed", description: "An unexpected error occurred.", variant: "destructive" });
    }
  }, [slides, storyTitle, exportSlides, toast]);

  const selectedPhotoIds = new Set(activeSlide.photos.map((p) => p.id));

  return (
    <div className="flex flex-col h-screen bg-background">
      <SlideToolbar
        title={storyTitle}
        onTitleChange={setStoryTitle}
        onBack={() => navigate(`/event/${eventId}`)}
        onPreview={() => setPreviewOpen(true)}
        onExport={handleExport}
        exporting={exporting}
        exportProgress={progress}
        slideCount={slides.filter((s) => s.photos.length > 0).length}
      />

      <div className="flex flex-1 min-h-0">
        {/* Left: Slide filmstrip */}
        <div className="w-[160px] border-r border-border bg-card flex-shrink-0">
          <SlideThumbnailList
            slides={slides}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            onAdd={handleAddSlide}
            onDelete={handleDeleteSlide}
            onReorder={handleReorder}
          />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-auto p-6">
          <div className="shadow-2xl rounded-lg overflow-hidden">
            <SlideCanvas slide={activeSlide} size={540} />
          </div>
        </div>

        {/* Right: Layout + Photos */}
        <div className="w-[280px] border-l border-border bg-card flex-shrink-0 flex flex-col">
          <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
            <TabsList className="mx-2 mt-2 grid grid-cols-3">
              <TabsTrigger value="photos" className="text-xs">Photos</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
              <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="flex-1 overflow-y-auto p-2 m-0">
              <PhotoPicker
                photos={photos}
                selectedIds={selectedPhotoIds}
                onAdd={handleAddPhoto}
                onRemove={handleRemovePhoto}
              />
            </TabsContent>

            <TabsContent value="layout" className="flex-1 overflow-y-auto p-3 m-0">
              <SlideLayoutSelector
                value={activeSlide.layout}
                onChange={handleLayoutChange}
              />
              <div className="mt-4 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Slide photos ({activeSlide.photos.length}/{LAYOUT_META[activeSlide.layout].maxPhotos})
                </p>
                {activeSlide.photos.length === 0 && (
                  <p className="text-xs text-muted-foreground/50 py-2">
                    Select photos from the Photos tab
                  </p>
                )}
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {activeSlide.photos.map((p) => (
                    <div key={p.id} className="relative group aspect-square rounded overflow-hidden">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemovePhoto(p.id)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="flex-1 overflow-y-auto p-3 m-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Slide Title
                </Label>
                <Input
                  value={activeSlide.title}
                  onChange={(e) => updateSlide(activeIndex, { title: e.target.value })}
                  placeholder="Optional title overlay"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Caption
                </Label>
                <Input
                  value={activeSlide.caption}
                  onChange={(e) => updateSlide(activeIndex, { caption: e.target.value })}
                  placeholder="Optional caption"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Background Color
                </Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={activeSlide.bgColor}
                    onChange={(e) => updateSlide(activeIndex, { bgColor: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={activeSlide.bgColor}
                    onChange={(e) => updateSlide(activeIndex, { bgColor: e.target.value })}
                    className="h-8 text-sm font-mono flex-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden export containers — rendered at 1080×1080 offscreen */}
      <div className="fixed" style={{ left: -9999, top: -9999 }}>
        {slides.map((slide) => (
          <SlideCanvas
            key={slide.id}
            slide={slide}
            size={1080}
            innerRef={registerNode(slide.id)}
          />
        ))}
      </div>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-white font-serif">{storyTitle}</DialogTitle>
          </DialogHeader>
          <div className="px-10 pb-6">
            <Carousel className="w-full">
              <CarouselContent>
                {slides.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <div className="flex items-center justify-center">
                      <SlideCanvas slide={slide} size={480} className="rounded-lg" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
              <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
            </Carousel>
            <p className="text-center text-white/40 text-xs mt-3">
              {slides.length} slide{slides.length !== 1 ? "s" : ""} — swipe to preview
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Photo Picker Sub-component ─── */

function PhotoPicker({
  photos,
  selectedIds,
  onAdd,
  onRemove,
}: {
  photos: SlidePhoto[];
  selectedIds: Set<string>;
  onAdd: (p: SlidePhoto) => void;
  onRemove: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? photos.filter(
        (p) =>
          p.file_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.id.includes(search),
      )
    : photos;

  return (
    <div className="space-y-2">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search photos…"
        className="h-8 text-xs"
      />
      {filtered.length === 0 ? (
        <div className="py-8 text-center">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50 mt-2">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {filtered.map((photo) => {
            const selected = selectedIds.has(photo.id);
            return (
              <button
                key={photo.id}
                onClick={() => (selected ? onRemove(photo.id) : onAdd(photo))}
                className={`relative aspect-square overflow-hidden rounded transition-all ${
                  selected
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : "hover:opacity-80"
                }`}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
