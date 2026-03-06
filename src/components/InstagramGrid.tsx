import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Download, Grid3X3, CheckSquare, Camera } from 'lucide-react';

interface GridPhoto {
  id: string;
  url: string;
  is_favorite: boolean;
  file_name: string | null;
  section?: string | null;
}

interface Chapter {
  id: string;
  name: string;
  cover_photo_id?: string | null;
}

interface InstagramGridProps {
  photos: GridPhoto[];
  eventName: string;
  eventDate: string;
  coverUrl: string | null;
  studioName: string | null;
  welcomeMessage?: string | null;
  chapters?: Chapter[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  canDownload: boolean;
  onDownload?: (photo: GridPhoto) => void;
  onPhotoClick: (photoId: string) => void;
  watermarkText?: string | null;
  favoriteCount: number;
  filter: 'all' | 'favorites' | 'selected';
  onFilterChange: (f: 'all' | 'favorites' | 'selected') => void;
}

const BATCH_SIZE = 12;

export function InstagramGrid({
  photos,
  eventName,
  eventDate,
  coverUrl,
  studioName,
  welcomeMessage,
  chapters,
  isFavorite,
  toggleFavorite,
  canDownload,
  onDownload,
  onPhotoClick,
  watermarkText,
  favoriteCount,
  filter,
  onFilterChange,
}: InstagramGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(c + BATCH_SIZE, photos.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [photos.length]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filter, activeChapter]);

  let filteredPhotos = photos;
  if (activeChapter && chapters?.length) {
    // Filter by section matching chapter name
    const chapterName = chapters.find((c) => c.id === activeChapter)?.name;
    if (chapterName) {
      filteredPhotos = photos.filter((p) => p.section === chapterName);
    }
  }

  const displayPhotos = filteredPhotos.slice(0, visibleCount);

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <Grid3X3 className="h-12 w-12" style={{ color: '#ccc' }} />
        <p className="mt-4 font-sans text-[14px]" style={{ color: '#888' }}>No photos yet</p>
        <p className="mt-1 font-sans text-[13px]" style={{ color: '#aaa' }}>Photos will appear here once uploaded.</p>
      </div>
    );
  }

  const bioText = welcomeMessage || '';
  const showBioMore = bioText.length > 120 && !bioExpanded;

  return (
    <div style={{ backgroundColor: '#FAFAF8' }} className="min-h-[100dvh]">
      {/* ─── Profile Header ─── */}
      <div className="max-w-[600px] mx-auto px-4 pt-6 pb-3">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={eventName}
                className="rounded-full object-cover"
                style={{ width: 72, height: 72, border: '2px solid #E8E5E0' }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 72, height: 72, backgroundColor: '#E8E5E0' }}
              >
                <Camera className="h-6 w-6" style={{ color: '#999' }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-sans text-[15px] font-bold truncate" style={{ color: '#1A1A1A' }}>
              {eventName}
            </h1>
            <p className="font-sans text-[13px]" style={{ color: '#888' }}>
              {photos.length} photos
            </p>
            {studioName && (
              <p className="font-sans text-[12px] mt-0.5" style={{ color: '#C9A96E' }}>
                {studioName}
              </p>
            )}
          </div>
        </div>

        {/* Bio / welcome message */}
        {bioText && (
          <div className="mt-3">
            <p
              className="font-sans text-[13px] leading-[1.5]"
              style={{
                color: '#1A1A1A',
                display: '-webkit-box',
                WebkitLineClamp: bioExpanded ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: bioExpanded ? 'visible' : 'hidden',
              }}
            >
              {bioText}
            </p>
            {showBioMore && (
              <button
                onClick={() => setBioExpanded(true)}
                className="font-sans text-[13px] font-medium"
                style={{ color: '#888' }}
              >
                more
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px mt-4" style={{ backgroundColor: '#E8E5E0' }} />
      </div>

      {/* ─── Story Highlights (Chapters) ─── */}
      {chapters && chapters.length > 0 && (
        <div className="max-w-[600px] mx-auto px-4 pb-3">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* All button */}
            <button
              onClick={() => setActiveChapter(null)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  border: `2px solid ${!activeChapter ? '#C9A96E' : '#E8E5E0'}`,
                  backgroundColor: '#F5F3EF',
                }}
              >
                <Grid3X3 className="h-5 w-5" style={{ color: !activeChapter ? '#C9A96E' : '#999' }} />
              </div>
              <span
                className="font-sans text-[10px] text-center max-w-[64px] truncate"
                style={{ color: !activeChapter ? '#1A1A1A' : '#888' }}
              >
                All
              </span>
            </button>

            {chapters.map((ch) => {
              const isActive = activeChapter === ch.id;
              const coverPhoto = ch.cover_photo_id
                ? photos.find((p) => p.id === ch.cover_photo_id)
                : photos.find((p) => p.section === ch.name);
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(isActive ? null : ch.id)}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      width: 64,
                      height: 64,
                      border: `2px solid ${isActive ? '#C9A96E' : '#E8E5E0'}`,
                      padding: 2,
                    }}
                  >
                    {coverPhoto ? (
                      <img
                        src={coverPhoto.url}
                        alt={ch.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: '#F5F3EF' }} />
                    )}
                  </div>
                  <span
                    className="font-sans text-[10px] text-center max-w-[64px] truncate"
                    style={{ color: isActive ? '#1A1A1A' : '#888' }}
                  >
                    {ch.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="h-px" style={{ backgroundColor: '#E8E5E0' }} />
        </div>
      )}

      {/* ─── Tab Bar ─── */}
      <div className="max-w-[600px] mx-auto" style={{ borderBottom: '1px solid #E8E5E0' }}>
        <div className="flex">
          <button
            onClick={() => onFilterChange('all')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors"
            style={{
              borderTop: filter === 'all' ? '1.5px solid #1A1A1A' : '1.5px solid transparent',
              color: filter === 'all' ? '#1A1A1A' : '#888',
            }}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="font-sans text-[11px] font-medium hidden sm:inline uppercase tracking-[0.06em]">All</span>
          </button>
          <button
            onClick={() => onFilterChange('favorites')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors"
            style={{
              borderTop: filter === 'favorites' ? '1.5px solid #1A1A1A' : '1.5px solid transparent',
              color: filter === 'favorites' ? '#1A1A1A' : '#888',
            }}
          >
            <Heart className="h-4 w-4" />
            <span className="font-sans text-[11px] font-medium hidden sm:inline uppercase tracking-[0.06em]">Favorites</span>
            {favoriteCount > 0 && (
              <span className="font-sans text-[9px] bg-[#1A1A1A]/10 rounded-full px-1.5 py-px">{favoriteCount}</span>
            )}
          </button>
          <button
            onClick={() => onFilterChange('selected')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors"
            style={{
              borderTop: filter === 'selected' ? '1.5px solid #1A1A1A' : '1.5px solid transparent',
              color: filter === 'selected' ? '#1A1A1A' : '#888',
            }}
          >
            <CheckSquare className="h-4 w-4" />
            <span className="font-sans text-[11px] font-medium hidden sm:inline uppercase tracking-[0.06em]">Selected</span>
          </button>
        </div>
      </div>

      {/* ─── Square Grid ─── */}
      <div className="max-w-[600px] mx-auto">
        {displayPhotos.length === 0 ? (
          <div className="py-20 text-center">
            <Heart className="mx-auto h-8 w-8" style={{ color: '#ddd' }} />
            <p className="mt-3 font-sans text-[13px]" style={{ color: '#888' }}>
              {filter === 'favorites' ? 'No favorites yet' : 'No photos match this filter'}
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-3"
            style={{ gap: 3 }}
          >
            {displayPhotos.map((photo) => (
              <PhotoCell
                key={photo.id}
                photo={photo}
                isFav={isFavorite(photo.id)}
                canDownload={canDownload}
                onDownload={onDownload}
                onClick={() => onPhotoClick(photo.id)}
                watermarkText={watermarkText}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {visibleCount < filteredPhotos.length && (
          <div ref={sentinelRef} className="h-16 flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-[#C9A96E] border-t-transparent rounded-full" />
          </div>
        )}

        {/* Footer */}
        <div className="py-8 text-center">
          <p className="font-sans text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(0,0,0,0.2)' }}>
            Powered by MirrorAI
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Individual Photo Cell ─── */
function PhotoCell({
  photo,
  isFav,
  canDownload,
  onDownload,
  onClick,
  watermarkText,
  toggleFavorite,
}: {
  photo: GridPhoto;
  isFav: boolean;
  canDownload: boolean;
  onDownload?: (p: GridPhoto) => void;
  onClick: () => void;
  watermarkText?: string | null;
  toggleFavorite: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  // Mock stats based on photo index for visual effect
  const heartCount = Math.floor(Math.random() * 40) + 5;
  const dlCount = Math.floor(Math.random() * 20) + 2;

  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={photo.url}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover object-center"
      />

      {/* Watermark */}
      {watermarkText && (
        <span
          className="absolute bottom-1.5 right-2 font-sans text-[10px] pointer-events-none select-none"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          {watermarkText}
        </span>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: hovered ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-6 text-white">
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" fill="white" />
            <span className="font-sans text-[13px] font-bold">{heartCount}</span>
          </span>
          {canDownload && (
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              <span className="font-sans text-[13px] font-bold">{dlCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Favorite button - visible on mobile always, desktop on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(photo.id);
        }}
        className="absolute top-1.5 right-1.5 z-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all sm:opacity-0 sm:group-hover:opacity-100"
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Heart
          className="h-4 w-4 transition-all"
          style={{ color: isFav ? '#C9A96E' : 'rgba(255,255,255,0.8)' }}
          fill={isFav ? '#C9A96E' : 'none'}
        />
      </button>
    </div>
  );
}
