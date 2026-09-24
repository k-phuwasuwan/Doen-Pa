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

  function showPhoto(index: number) {
    setCurrentPhotoIndex(index);
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
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-2 sm:inset-x-5 sm:bottom-5">
              <button
                type="button"
                onClick={() => showPhoto((visibleIndex - 1 + recordPhotos.length) % recordPhotos.length)}
                className="liquid-glass pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-brand-800 shadow-glass transition-all duration-200 hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                aria-label="ภาพก่อนหน้า"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>

              <span aria-live="polite" className="liquid-glass rounded-full px-4 py-2 text-sm font-semibold tabular-nums text-brand-800 shadow-glass">
                {visibleIndex + 1} / {recordPhotos.length}
              </span>

              <button
                type="button"
                onClick={() => showPhoto((visibleIndex + 1) % recordPhotos.length)}
                className="liquid-glass pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-brand-800 shadow-glass transition-all duration-200 hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                aria-label="ภาพถัดไป"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
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
