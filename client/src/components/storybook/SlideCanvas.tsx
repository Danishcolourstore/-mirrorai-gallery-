import React from "react";
import { ImageIcon } from "lucide-react";
import type { Slide, SlidePhoto } from "./types";

interface SlideCanvasProps {
  slide: Slide;
  size?: number;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}

export function SlideCanvas({ slide, size = 540, className = "", innerRef }: SlideCanvasProps) {
  const { layout, photos, title, caption, bgColor } = slide;

  return (
    <div
      ref={innerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size, backgroundColor: bgColor, flexShrink: 0 }}
    >
      {photos.length === 0 ? (
        <EmptySlide />
      ) : layout === "single" ? (
        <SingleLayout photo={photos[0]} />
      ) : layout === "diptych" ? (
        <DiptychSlideLayout photos={photos} />
      ) : layout === "editorial" ? (
        <EditorialSlideLayout photos={photos} />
      ) : layout === "instagram-grid" ? (
        <GridSlideLayout photos={photos} />
      ) : (
        <SingleLayout photo={photos[0]} />
      )}

      {(title || caption) && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 pt-16 pointer-events-none">
          {title && (
            <h3 className="font-serif text-white text-xl font-semibold leading-tight drop-shadow-lg">
              {title}
            </h3>
          )}
          {caption && (
            <p className="text-white/80 text-sm mt-1 leading-snug drop-shadow">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EmptySlide() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-3">
      <ImageIcon className="h-12 w-12" />
      <p className="text-sm font-medium">Add photos to this slide</p>
    </div>
  );
}

function SingleLayout({ photo }: { photo: SlidePhoto }) {
  return (
    <img
      src={photo.url}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      crossOrigin="anonymous"
    />
  );
}

function DiptychSlideLayout({ photos }: { photos: SlidePhoto[] }) {
  const left = photos[0];
  const right = photos[1];
  return (
    <div className="w-full h-full grid grid-cols-2" style={{ gap: 3 }}>
      {left && (
        <img src={left.url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
      )}
      {right ? (
        <img src={right.url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
      ) : (
        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
}

function EditorialSlideLayout({ photos }: { photos: SlidePhoto[] }) {
  if (photos.length === 0) return <EmptySlide />;
  if (photos.length === 1) return <SingleLayout photo={photos[0]} />;

  const hero = photos[0];
  const rest = photos.slice(1, 5);
  const cols = rest.length >= 3 ? 3 : rest.length;

  return (
    <div className="w-full h-full flex flex-col" style={{ gap: 3 }}>
      <div className="flex-[2] min-h-0 overflow-hidden">
        <img src={hero.url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex" style={{ gap: 3 }}>
        {rest.map((p, i) => (
          <div key={p.id} className="flex-1 overflow-hidden" style={{ flex: i === 0 && cols === 3 ? 1.3 : 1 }}>
            <img src={p.url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
        ))}
        {rest.length === 0 && (
          <div className="flex-1 bg-muted/20 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
          </div>
        )}
      </div>
    </div>
  );
}

function GridSlideLayout({ photos }: { photos: SlidePhoto[] }) {
  const cells = Array.from({ length: 9 }, (_, i) => photos[i] ?? null);
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3" style={{ gap: 3 }}>
      {cells.map((photo, i) =>
        photo ? (
          <img
            key={photo.id}
            src={photo.url}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div key={`empty-${i}`} className="w-full h-full bg-muted/10" />
        )
      )}
    </div>
  );
}
