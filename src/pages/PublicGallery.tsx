import { useParams } from "react-router-dom";
import GalleryShell from "@/components/GalleryShell";

export default function PublicGallery() {
  const { slug } = useParams();

  return (
    <GalleryShell title="Gallery">
      <div className="max-w-[480px] mx-auto text-center">
        <p className="text-sm text-muted-foreground">Gallery: {slug}</p>
      </div>
    </GalleryShell>
  );
}
