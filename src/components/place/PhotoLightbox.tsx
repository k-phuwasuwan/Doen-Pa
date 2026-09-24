"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function PhotoLightbox({ photos, activeIndex, onIndexChange, onClose }: PhotoLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
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
        const buttons = [...(overlayRef.current?.querySelectorAll<HTMLButtonElement>("button:not([tabindex='-1'])") ?? [])];
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (buttons.length > 0 && ((event.shiftKey && currentIndex === 0) || (!event.shiftKey && currentIndex === buttons.length - 1))) {
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
      onIndexChange((activeIndex + direction + photos.length) % photos.length);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, onIndexChange, photos.length]);

  function goTo(index: number) {
    setImageStatus("loading");
    onIndexChange(index);
  }

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="ดูรูปภาพจากการเดินทาง"
      className="photo-lightbox"
    >
      <button type="button" onClick={onClose} tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-default" />
      <div className="relative mx-auto flex h-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <p aria-live="polite" className="text-sm font-medium">รูปที่ {activeIndex + 1} จาก {photos.length}</p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="ปิดรูปภาพ"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          {imageStatus === "loading" && <p className="absolute inset-0 flex items-center justify-center text-sm text-white/75">กำลังโหลดรูปภาพ...</p>}
          {imageStatus === "error" ? (
            <p role="alert" className="absolute inset-0 flex items-center justify-center text-sm text-white/75">โหลดรูปภาพไม่ได้</p>
          ) : (
            <Image
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
                className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900/75 transition-colors hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo((activeIndex + 1) % photos.length)}
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900/75 transition-colors hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="รูปถัดไป"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
