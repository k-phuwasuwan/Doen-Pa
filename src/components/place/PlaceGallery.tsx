"use client";

import { photoThumb } from "@/domain/account-data";
import { placeImageCredit, placeImageUrl } from "@/domain/place-image";
import type { PlaceImage } from "@/types";
import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoLightbox } from "./PhotoLightbox";

interface PlaceGalleryProps {
  /** User's own uploaded photos from TravelRecord. Empty = no record or no uploads. */
  recordPhotos: string[];
  initialPhotoIndex?: number;
  /** Freely licensed park photo shown until the user adds their own. */
  placeImage?: PlaceImage;
  placeName?: string;
}

export function PlaceGallery({ recordPhotos, initialPhotoIndex = 0, placeImage, placeName = "" }: PlaceGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const visibleIndex = Math.min(currentPhotoIndex, Math.max(0, recordPhotos.length - 1));
  const visiblePhoto = recordPhotos[visibleIndex];

  function showPhoto(direction: -1 | 1) {
    setCurrentPhotoIndex((index) => (Math.min(index, recordPhotos.length - 1) + direction + recordPhotos.length) % recordPhotos.length);
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
    <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-glass sm:aspect-[2/1] lg:aspect-[21/9] ${visiblePhoto ? "bg-beige-100" : "topo-fill"}`}>
      {!visiblePhoto && placeImage && (
        <>
          <Image unoptimized src={placeImageUrl(placeImage, 1280)} alt={`ภาพ${placeName}`} fill priority className="object-cover object-center" sizes="(max-width: 1152px) 100vw, 1152px" />
          <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/70 to-transparent px-4 pb-3 pt-10 text-xs text-white/90">{placeImageCredit(placeImage)}</p>
        </>
      )}
      {!visiblePhoto && !placeImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#edf1ec]/55 px-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-brand-600 shadow-glass">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="max-w-56 text-sm text-brand-800/70">รูปจากการเดินทางของคุณจะแสดงที่นี่</p>
        </div>
      )}
      {visiblePhoto && (
        <>
          <button
            type="button"
            onClick={(event) => openPhoto(visibleIndex, event.currentTarget)}
            className="absolute inset-0 h-full w-full focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-500"
            aria-label={`ดูภาพจากการเดินทาง รูปที่ ${visibleIndex + 1} แบบเต็มจอ`}
          >
            <Image unoptimized
              key={visiblePhoto}
              src={photoThumb(visiblePhoto, 1280)}
              alt={`ภาพจากการเดินทางของคุณ รูปที่ ${visibleIndex + 1}`}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1152px) 100vw, 1152px"
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
                className="place-gallery-control place-gallery-control--previous backdrop-blur-md"
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
                className="place-gallery-control place-gallery-control--next backdrop-blur-md"
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
