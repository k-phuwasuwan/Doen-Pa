"use client";

import { useState, useRef, useCallback, useId } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

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
  onChange: (photos: UploadedPhoto[]) => void;
}

interface PhotoError {
  filename: string;
  message: string;
}

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<PhotoError[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const newErrors: PhotoError[] = [];
      const remaining = MAX_FILES - value.length;

      if (remaining <= 0) {
        setErrors([{ filename: "", message: `อัปโหลดได้สูงสุด ${MAX_FILES} รูป` }]);
        return;
      }

      const toProcess = fileArray.slice(0, remaining);
      const skipped = fileArray.slice(remaining);
      if (skipped.length > 0) {
        newErrors.push({
          filename: "",
          message: `เลือกได้อีก ${remaining} รูป (ข้ามไป ${skipped.length} รูป)`,
        });
      }

      setLoading(true);

      const results = await Promise.all(
        toProcess.map(
          (file) =>
            new Promise<UploadedPhoto | PhotoError>((resolve) => {
              if (!ACCEPTED_TYPES.includes(file.type)) {
                resolve({ filename: file.name, message: "รองรับเฉพาะ JPG, PNG, WebP" });
                return;
              }
              if (file.size > MAX_SIZE_BYTES) {
                resolve({ filename: file.name, message: "ไฟล์ต้องไม่เกิน 5 MB" });
                return;
              }

              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  dataUrl: e.target!.result as string,
                  name: file.name,
                  alt: "",
                });
              };
              reader.onerror = () => {
                resolve({ filename: file.name, message: "อ่านไฟล์ไม่ได้ กรุณาลองใหม่" });
              };
              reader.readAsDataURL(file);
            }),
        ),
      );

      const successes: UploadedPhoto[] = [];
      results.forEach((r) => {
        if ("dataUrl" in r) {
          successes.push(r);
        } else {
          newErrors.push(r);
        }
      });

      onChange([...value, ...successes]);
      setErrors(newErrors);
      setLoading(false);

      // Reset file input so the same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = "";
    },
    [value, onChange],
  );

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
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const handleAltChange = (index: number, alt: string) => {
    const next = [...value];
    next[index] = { ...next[index], alt };
    onChange(next);
  };

  const canUploadMore = value.length < MAX_FILES;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-brand-800">
          รูปภาพ
          <span className="ml-1 text-brand-800/65 font-normal">
            ({value.length}/{MAX_FILES} ต่อบันทึก)
          </span>
        </label>
        {value.length === MAX_FILES && (
          <span className="flex items-center gap-1 text-xs text-brand-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ครบ {MAX_FILES} รูปแล้ว
          </span>
        )}
      </div>

      {/* Drop zone */}
      {canUploadMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="อัปโหลดรูปภาพ"
          className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
            ${dragging ? "border-brand-600 bg-brand-600/5" : "border-brand-800/10 hover:border-brand-600/50 hover:bg-brand-600/[0.02]"}
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${loading ? "opacity-60 pointer-events-none" : ""}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
        >
          <Upload className={`w-8 h-8 ${dragging ? "text-brand-800" : "text-brand-800/65"}`} />
          <div className="text-center">
            <p className="text-sm font-medium text-brand-800">
              {loading ? "กำลังโหลด..." : "คลิกหรือลากไฟล์มาวางที่นี่"}
            </p>
            <p className="text-xs text-brand-800/65 mt-0.5">JPG, PNG, WebP · สูงสุด 5 MB ต่อรูป</p>
          </div>

          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            className="sr-only"
            onChange={handleInputChange}
            aria-label="เลือกไฟล์รูปภาพ"
          />
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((photo, index) => (
            <div key={index} className="group relative rounded-xl overflow-hidden bg-beige-100/20">
              <div className="relative aspect-square">
                <Image
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
                className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity duration-150 sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
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
                  className="w-full text-xs px-2 py-1 glass-input placeholder-brand-800/50 text-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
