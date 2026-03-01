import { useState, useRef, useCallback, ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export function ImageWithFallback({ fallbackClassName, className, alt, onLoad, src, ...props }: Props) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle case where image loads before React attaches onLoad
  const handleRef = useCallback((node: HTMLImageElement | null) => {
    (imgRef as any).current = node;
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${fallbackClassName || className || ''}`}>
        <ImageOff className="h-8 w-8 text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <img
      {...props}
      ref={handleRef}
      src={src}
      alt={alt}
      loading="lazy"
      className={`${className || ''} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={() => {
        console.error('Image failed to load:', src);
        setError(true);
      }}
    />
  );
}
