"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { PhotoLightbox } from "./PhotoLightbox";

interface PlaceGalleryProps {
  /** User's own uploaded photos from TravelRecord. Empty = no record or no uploads. */
  recordPhotos: string[];
}

export function PlaceGallery({ recordPhotos }: PlaceGalleryProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const mainPhoto = recordPhotos[0];
  const thumbnailPhotos = recordPhotos.slice(1, 3);
  const overflowCount = Math.max(0, recordPhotos.length - 3);
  const showThumbnailRow = thumbnailPhotos.length > 0 || overflowCount > 0;

  function openPhoto(index: number, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setActivePhotoIndex(index);
  }

  function closePhoto() {
    setActivePhotoIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      {mainPhoto ? (
        <button
          type="button"
          onClick={(event) => openPhoto(0, event.currentTarget)}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-glass-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label="ดูภาพจากการเดินทาง รูปที่ 1"
        >
          <Image
            src={mainPhoto}
            alt="ภาพจากการเดินทางของคุณ"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
        </button>
      ) : (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-beige-100 shadow-glass-card" />
      )}

      {showThumbnailRow && (
        <div className="grid grid-cols-3 gap-3.5 overflow-hidden">
          {thumbnailPhotos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={(event) => openPhoto(index + 1, event.currentTarget)}
              className="relative aspect-square overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              aria-label={`ดูภาพจากการเดินทาง รูปที่ ${index + 2}`}
            >
              <Image
                src={photo}
                alt={`ภาพความทรงจำที่ ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
            </button>
          ))}

          {overflowCount > 0 && (
            <button
              type="button"
              onClick={(event) => openPhoto(3, event.currentTarget)}
              className="liquid-glass flex aspect-square flex-col items-center justify-center rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              aria-label={`ดูภาพถ่ายที่เหลืออีก ${overflowCount} รูป`}
            >
              <span className="text-2xl font-bold leading-none text-brand-700">+{overflowCount}</span>
              <span className="mt-1 text-xs text-brand-800/65">ภาพถ่าย</span>
            </button>
          )}
        </div>
      )}

      {activePhotoIndex !== null && (
        <PhotoLightbox
          photos={recordPhotos}
          activeIndex={activePhotoIndex}
          onIndexChange={setActivePhotoIndex}
          onClose={closePhoto}
        />
      )}
    </div>
  );
}
