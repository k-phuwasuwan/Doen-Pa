"use client";

import { useState, useRef, useId, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { IMAGE_ACCEPT, RECORD_PHOTO_LIMIT, RECORD_IMAGE_POLICY, type ImageImporter, type ImageImportError } from "@/lib/images/image-import";

export interface UploadedPhoto {
  /** data-URL from FileReader */
  dataUrl: string;
  /** original filename for display */
  name: string;
  /** user-supplied alt text */
  alt: string;
}

interface PhotoUploaderProps {
  value: UploadedPhoto[];
  onChange: Dispatch<SetStateAction<UploadedPhoto[]>>;
  importer: ImageImporter;
  loading: boolean;
}

export function PhotoUploader({ value, onChange, importer, loading }: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ImageImportError[]>([]);
  const [dragging, setDragging] = useState(false);

  function processFiles(files: FileList | File[]) {
    if (importer.isPending()) return;
    const remaining = RECORD_PHOTO_LIMIT - value.length;
    if (remaining <= 0) {
      setErrors([{ filename: "", message: `อัปโหลดได้สูงสุด ${RECORD_PHOTO_LIMIT} รูป` }]);
      return;
    }
    const selected = Array.from(files);
    const skipped: ImageImportError[] = selected.length > remaining
      ? [{ filename: "", message: `เลือกได้อีก ${remaining} รูป (ข้ามไป ${selected.length - remaining} รูป)` }]
      : [];
    if (inputRef.current) inputRef.current.value = "";
    void importer.importImages("record", selected.slice(0, remaining), RECORD_IMAGE_POLICY, ({ images, errors }) => {
      // Apply to current photos, preserving edits/removals made while files were read.
      onChange((current) => [...current, ...images.map((image) => ({ ...image, alt: "" }))].slice(0, RECORD_PHOTO_LIMIT));
      setErrors([...skipped, ...errors]);
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    onChange((current) => current.filter((_, photoIndex) => photoIndex !== index));
  };

  const handleAltChange = (index: number, alt: string) => {
    onChange((current) => current.map((photo, photoIndex) => photoIndex === index ? { ...photo, alt } : photo));
  };

  const canUploadMore = value.length < RECORD_PHOTO_LIMIT;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-brand-800">
          รูปภาพ
          <span className="font-num ml-1.5 font-normal text-brand-800/60">
            {value.length}/{RECORD_PHOTO_LIMIT}
          </span>
        </label>
        {value.length === RECORD_PHOTO_LIMIT && (
          <span className="flex items-center gap-1 text-xs text-brand-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ครบ {RECORD_PHOTO_LIMIT} รูปแล้ว
          </span>
        )}
      </div>

      {/* Drop zone */}
      {canUploadMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="อัปโหลดรูปภาพ"
          aria-disabled={loading}
          aria-busy={loading}
          className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4 transition-colors duration-200
            ${dragging ? "border-brand-600 bg-brand-600/5" : "border-brand-800/15 bg-white/30 hover:border-brand-600/50 hover:bg-white/50"}
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${loading ? "opacity-60 pointer-events-none" : ""}`}
          onClick={(event) => {
            if (!loading && event.target !== inputRef.current) inputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !loading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-brand-800">
              {loading ? "กำลังโหลด..." : "เลือกรูป หรือลากมาวางที่นี่"}
            </p>
            <p className="mt-0.5 text-xs text-brand-800/60">JPG, PNG, WebP ไม่เกิน 5 MB ต่อรูป</p>
          </div>

          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={handleInputChange}
            disabled={loading}
            aria-label="เลือกไฟล์รูปภาพ"
          />
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1" role="alert">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {err.filename && <strong>{err.filename}: </strong>}
                {err.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {value.map((photo, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl bg-white/50 ring-1 ring-brand-800/10">
              <div className="relative aspect-square">
                <Image unoptimized
                  src={photo.dataUrl}
                  alt={photo.alt || photo.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`ลบรูป ${photo.name}`}
                className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity duration-150 sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Alt text input */}
              <div className="p-1.5">
                <input
                  type="text"
                  value={photo.alt}
                  onChange={(e) => handleAltChange(index, e.target.value)}
                  placeholder="คำอธิบายรูป (alt)"
                  aria-label={`คำอธิบายสำหรับรูปที่ ${index + 1}`}
                  className="glass-input w-full px-2 py-1.5 text-xs text-brand-800 placeholder-brand-800/45 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
