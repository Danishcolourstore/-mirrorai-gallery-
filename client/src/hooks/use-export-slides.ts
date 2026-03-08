import { useState, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { Slide } from "@/components/storybook/types";

const EXPORT_SIZE = 1080;

export interface ExportProgress {
  current: number;
  total: number;
  phase: "idle" | "rendering" | "packaging" | "done" | "error";
}

export function useExportSlides() {
  const [progress, setProgress] = useState<ExportProgress>({
    current: 0,
    total: 0,
    phase: "idle",
  });

  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const registerNode = useCallback(
    (slideId: string) => (el: HTMLDivElement | null) => {
      if (el) nodeRefs.current.set(slideId, el);
      else nodeRefs.current.delete(slideId);
    },
    [],
  );

  const renderSlide = useCallback(
    async (slideId: string): Promise<string | null> => {
      const el = nodeRefs.current.get(slideId);
      if (!el) return null;
      return toPng(el, {
        width: EXPORT_SIZE,
        height: EXPORT_SIZE,
        pixelRatio: 1,
        cacheBust: true,
      });
    },
    [],
  );

  const exportSlides = useCallback(
    async (slides: Slide[], title: string) => {
      const exportable = slides.filter((s) => s.photos.length > 0);
      if (exportable.length === 0) return { success: false, reason: "empty" as const };

      const total = exportable.length;
      setProgress({ current: 0, total, phase: "rendering" });

      try {
        const rendered: { name: string; dataUrl: string }[] = [];

        for (let i = 0; i < slides.length; i++) {
          if (slides[i].photos.length === 0) continue;

          const dataUrl = await renderSlide(slides[i].id);
          if (!dataUrl) continue;

          rendered.push({
            name: `storybook-slide-${String(i + 1).padStart(2, "0")}.png`,
            dataUrl,
          });

          setProgress({ current: rendered.length, total, phase: "rendering" });
        }

        if (rendered.length === 0) {
          setProgress({ current: 0, total: 0, phase: "error" });
          return { success: false, reason: "render-failed" as const };
        }

        if (rendered.length === 1) {
          const response = await fetch(rendered[0].dataUrl);
          const blob = await response.blob();
          saveAs(blob, rendered[0].name);
        } else {
          setProgress((p) => ({ ...p, phase: "packaging" }));

          const zip = new JSZip();
          for (const item of rendered) {
            const base64 = item.dataUrl.split(",")[1];
            zip.file(item.name, base64, { base64: true });
          }
          const blob = await zip.generateAsync({ type: "blob" });
          const safeName = title.replace(/[^a-zA-Z0-9_-]/g, "_") || "storybook";
          saveAs(blob, `${safeName}.zip`);
        }

        setProgress({ current: total, total, phase: "done" });
        return { success: true, count: rendered.length };
      } catch (err) {
        console.error("Export failed:", err);
        setProgress({ current: 0, total: 0, phase: "error" });
        return { success: false, reason: "error" as const };
      }
    },
    [renderSlide],
  );

  const resetProgress = useCallback(() => {
    setProgress({ current: 0, total: 0, phase: "idle" });
  }, []);

  const exporting = progress.phase === "rendering" || progress.phase === "packaging";

  return {
    progress,
    exporting,
    exportSlides,
    registerNode,
    resetProgress,
  };
}
