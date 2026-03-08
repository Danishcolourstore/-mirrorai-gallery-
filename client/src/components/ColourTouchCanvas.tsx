import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { Maximize, Upload, Minus, Plus, ImageIcon } from "lucide-react";

const MIN_SCALE = 0.05;
const MAX_SCALE = 32;
const PADDING = 40;

interface ColourTouchCanvasProps {
  initialImageUrl?: string;
}

export default function ColourTouchCanvas({
  initialImageUrl,
}: ColourTouchCanvasProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(
    initialImageUrl ?? null,
  );
  const [imageKey, setImageKey] = useState(0);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const computeFitScale = useCallback(
    (imgW: number, imgH: number): number => {
      const container = containerRef.current;
      if (!container || imgW === 0 || imgH === 0) return 1;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const sx = (cw - PADDING) / imgW;
      const sy = (ch - PADDING) / imgH;
      return Math.min(sx, sy, 1);
    },
    [],
  );

  const applyFit = useCallback(
    (scale?: number) => {
      const api = transformRef.current;
      if (!api) return;
      const s = scale ?? fitScale;
      api.centerView(s, 0, "easeOut");
      setCurrentScale(s);
    },
    [fitScale],
  );

  const handleImageLoad = useCallback(
    (img: HTMLImageElement) => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setNaturalSize({ w, h });
      const s = computeFitScale(w, h);
      setFitScale(s);
      setCurrentScale(s);

      requestAnimationFrame(() => {
        const api = transformRef.current;
        if (api) {
          api.centerView(s, 0, "easeOut");
        }
      });
    },
    [computeFitScale],
  );

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setNaturalSize(null);
    setImageKey((k) => k + 1);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
      if (e.target) e.target.value = "";
    },
    [loadFile],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!naturalSize) return;
    const onResize = () => {
      const s = computeFitScale(naturalSize.w, naturalSize.h);
      setFitScale(s);
      const api = transformRef.current;
      if (api) {
        api.centerView(s, 0, "easeOut");
        setCurrentScale(s);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [naturalSize, computeFitScale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        applyFit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyFit]);

  const handleTransform = useCallback(
    (ref: ReactZoomPanPinchRef) => {
      setCurrentScale(ref.state.scale);
    },
    [],
  );

  const zoomPercent = Math.round(currentScale * 100);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#111111] text-white select-none">
      {/* Top bar */}
      <div className="h-11 flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
        <span className="text-sm font-medium tracking-wide opacity-80">
          ColourTouch
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 transition-colors rounded px-3 py-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: "#111111" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {dragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/5 border-2 border-dashed border-white/40 pointer-events-none">
            <span className="text-lg text-white/70">Drop image here</span>
          </div>
        )}

        {imageSrc ? (
          <TransformWrapper
            key={imageKey}
            ref={transformRef}
            initialScale={1}
            minScale={MIN_SCALE}
            maxScale={MAX_SCALE}
            centerOnInit
            limitToBounds={false}
            doubleClick={{ mode: "reset" }}
            onTransformed={handleTransform}
            panning={{ velocityDisabled: false }}
            wheel={{ step: 0.08 }}
          >
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
              contentStyle={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={imageSrc}
                alt="Canvas"
                draggable={false}
                onLoad={(e) => handleImageLoad(e.currentTarget)}
                style={{
                  maxWidth: "none",
                  maxHeight: "none",
                  imageRendering: "auto",
                  willChange: "transform",
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                dragging
                  ? "border-white/40"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <ImageIcon className="h-12 w-12 text-white/30" />
              <span className="text-sm text-white/50">
                Drop an image or click to upload
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="h-10 flex items-center justify-center gap-2 bg-[#1a1a1a] border-t border-white/10 shrink-0">
        <button
          onClick={() => {
            const api = transformRef.current;
            if (api) {
              const next = Math.max(currentScale * 0.8, MIN_SCALE);
              api.centerView(next, 200, "easeOut");
            }
          }}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span className="text-xs tabular-nums w-14 text-center opacity-70">
          {zoomPercent}%
        </span>

        <button
          onClick={() => {
            const api = transformRef.current;
            if (api) {
              const next = Math.min(currentScale * 1.25, MAX_SCALE);
              api.centerView(next, 200, "easeOut");
            }
          }}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <button
          onClick={() => applyFit()}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
          title="Fit to Screen (F)"
        >
          <Maximize className="h-3.5 w-3.5" />
          Fit
        </button>
      </div>
    </div>
  );
}
