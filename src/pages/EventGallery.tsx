import { useParams } from "react-router-dom";
import GalleryShell from "@/components/GalleryShell";

interface Props {
  session: any;
}

export default function EventGallery({ session }: Props) {
  const { id } = useParams();

  return (
    <GalleryShell title={`Event Gallery`}>
      <div className="max-w-[480px] mx-auto">
        <p className="text-sm text-muted-foreground">Event ID: {id}</p>
        {!session && (
          <p className="mt-4 text-center text-muted-foreground">Sign in to manage this gallery.</p>
        )}
      </div>
    </GalleryShell>
  );
}
