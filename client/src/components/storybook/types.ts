export type SlideLayout = "single" | "diptych" | "editorial" | "instagram-grid";

export interface SlidePhoto {
  id: string;
  url: string;
  file_name: string | null;
}

export interface Slide {
  id: string;
  layout: SlideLayout;
  photos: SlidePhoto[];
  title: string;
  caption: string;
  bgColor: string;
}

export const LAYOUT_META: Record<
  SlideLayout,
  { label: string; maxPhotos: number; description: string }
> = {
  single: { label: "Single", maxPhotos: 1, description: "One photo, full bleed" },
  diptych: { label: "Diptych", maxPhotos: 2, description: "Two photos side by side" },
  editorial: { label: "Collage", maxPhotos: 5, description: "Editorial collage" },
  "instagram-grid": { label: "Grid", maxPhotos: 9, description: "3×3 photo grid" },
};

export function createSlide(layout: SlideLayout = "single"): Slide {
  return {
    id: crypto.randomUUID(),
    layout,
    photos: [],
    title: "",
    caption: "",
    bgColor: "#FFFFFF",
  };
}
