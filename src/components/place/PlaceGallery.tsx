"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoLightbox } from "./PhotoLightbox";

interface PlaceGalleryProps {
  /** User's own uploaded photos from TravelRecord. Empty = no record or no uploads. */
  recordPhotos: string[];
}

export function PlaceGallery({ recordPhotos }: PlaceGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const visibleIndex = Math.min(currentPhotoIndex, Math.max(0, recordPhotos.length - 1));
  const visiblePhoto = recordPhotos[visibleIndex];

  function showPhoto(direction: -1 | 1) {
    setCurrentPhotoIndex((index) => (index + direction + recordPhotos.length) % recordPhotos.length);
  }

  function openPhoto(index: number, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setActivePhotoIndex(index);
  }

  function closePhoto() {
    setActivePhotoIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function showLightboxPhoto(index: number) {
    setCurrentPhotoIndex(index);
    setActivePhotoIndex(index);
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-beige-100 shadow-glass-card">
      {visiblePhoto && (
        <>
          <button
            type="button"
            onClick={(event) => openPhoto(visibleIndex, event.currentTarget)}
            className="absolute inset-0 h-full w-full focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-500"
            aria-label={`ดูภาพจากการเดินทาง รูปที่ ${visibleIndex + 1} แบบเต็มจอ`}
          >
            <Image
              key={visiblePhoto}
              src={visiblePhoto}
              alt={`ภาพจากการเดินทางของคุณ รูปที่ ${visibleIndex + 1}`}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
          </button>

          {recordPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPhoto(-1);
                }}
                className="absolute left-2 top-1/2 z-10 flex h-12 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/55 text-brand-900 backdrop-blur-sm transition-colors hover:bg-white/85 active:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:left-4"
                aria-label="ภาพก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <span aria-live="polite" className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-brand-950/45 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm">
                {visibleIndex + 1} / {recordPhotos.length}
              </span>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPhoto(1);
                }}
                className="absolute right-2 top-1/2 z-10 flex h-12 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/55 text-brand-900 backdrop-blur-sm transition-colors hover:bg-white/85 active:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-4"
                aria-label="ภาพถัดไป"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </>
      )}

      {activePhotoIndex !== null && (
        <PhotoLightbox
          photos={recordPhotos}
          activeIndex={activePhotoIndex}
          onIndexChange={showLightboxPhoto}
          onClose={closePhoto}
        />
      )}
    </div>
  );
}
