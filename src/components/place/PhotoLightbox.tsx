"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function PhotoLightbox({ photos, activeIndex, onIndexChange, onClose }: PhotoLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [photoInset, setPhotoInset] = useState(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const buttons = [...(overlayRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (buttons.length === 0) {
          event.preventDefault();
        } else if ((event.shiftKey && currentIndex <= 0) || (!event.shiftKey && currentIndex === buttons.length - 1)) {
          event.preventDefault();
          buttons[event.shiftKey ? buttons.length - 1 : 0].focus();
        }
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (photos.length < 2) return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      setImageStatus("loading");
      setPhotoInset(0);
      onIndexChange((activeIndex + direction + photos.length) % photos.length);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, onIndexChange, photos.length]);

  useEffect(() => {
    if (imageStatus !== "loaded") return;
    const container = imageContainerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    function updateInset() {
      if (!container || !image || !image.naturalWidth || !image.naturalHeight) return;
      const { width, height } = container.getBoundingClientRect();
      const displayedWidth = Math.min(width, height * image.naturalWidth / image.naturalHeight);
      setPhotoInset((width - displayedWidth) / 2);
    }

    updateInset();
    const observer = new ResizeObserver(updateInset);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeIndex, imageStatus]);

  function goTo(index: number) {
    setImageStatus("loading");
    setPhotoInset(0);
    onIndexChange(index);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;

    const image = imageRef.current;
    if (image?.naturalWidth && image.naturalHeight) {
      const bounds = image.getBoundingClientRect();
      const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const photoWidth = image.naturalWidth * scale;
      const photoHeight = image.naturalHeight * scale;
      const photoLeft = bounds.left + (bounds.width - photoWidth) / 2;
      const photoTop = bounds.top + (bounds.height - photoHeight) / 2;
      if (event.clientX >= photoLeft && event.clientX <= photoLeft + photoWidth
        && event.clientY >= photoTop && event.clientY <= photoTop + photoHeight) return;
    }

    onClose();
  }

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="ดูรูปภาพจากการเดินทาง"
      aria-describedby="photo-lightbox-instructions"
      tabIndex={-1}
      onClick={handleBackdropClick}
      className="photo-lightbox"
    >
      <p id="photo-lightbox-instructions" className="sr-only">แตะพื้นที่นอกรูปภาพหรือกด Escape เพื่อปิด</p>
      <div className="relative mx-auto flex h-full max-w-6xl flex-col gap-4">
        <div className="text-center">
          <p aria-live="polite" className="text-sm font-medium">รูปที่ {activeIndex + 1} จาก {photos.length}</p>
        </div>

        <div ref={imageContainerRef} className="relative min-h-0 flex-1">
          {imageStatus === "loading" && <p className="absolute inset-0 flex items-center justify-center text-sm text-white/75">กำลังโหลดรูปภาพ...</p>}
          {imageStatus === "error" ? (
            <p role="alert" className="absolute inset-0 flex items-center justify-center text-sm text-white/75">โหลดรูปภาพไม่ได้</p>
          ) : (
            <Image
              ref={imageRef}
              key={`${activeIndex}-${photos[activeIndex]}`}
              src={photos[activeIndex]}
              alt={`ภาพจากการเดินทาง รูปที่ ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1152px) 100vw, 1152px"
              onLoad={() => setImageStatus("loaded")}
              onError={() => setImageStatus("error")}
            />
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo((activeIndex - 1 + photos.length) % photos.length)}
                className="place-gallery-control place-gallery-control--previous backdrop-blur-md"
                style={{ left: photoInset + 12 }}
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo((activeIndex + 1) % photos.length)}
                className="place-gallery-control place-gallery-control--next backdrop-blur-md"
                style={{ right: photoInset + 12 }}
                aria-label="รูปถัดไป"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
