"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CalendarDays, FileText, CheckCircle2 } from "lucide-react";
import { PhotoUploader, type UploadedPhoto } from "./PhotoUploader";
import { travelRecordService } from "@/services/travel-record.service";
import type { Place } from "@/types";

interface TravelRecordFormProps {
  place: Place;
}

export function TravelRecordForm({ place }: TravelRecordFormProps) {
  const router = useRouter();

  const todayISO = new Date().toISOString().split("T")[0];

  const [visitedAt, setVisitedAt] = useState(todayISO);
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!visitedAt) errs.visitedAt = "กรุณาเลือกวันที่ไป";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      travelRecordService.createRecord({
        userId: "user-1",
        placeId: place.id,
        visitedAt: new Date(visitedAt),
        note: note.trim(),
        photos: photos.map((p) => p.dataUrl),
        rating,
      });

      setSuccess(true);
      // Brief success flash before redirect
      setTimeout(() => router.push("/passport"), 800);
    } catch {
      setErrors({ submit: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-forest" />
        </div>
        <div>
          <p className="font-bold text-forest text-lg">บันทึกสำเร็จ!</p>
          <p className="text-slate text-sm mt-1">กำลังพาไปที่แพสพอร์ต…</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Place info — read-only */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-forest/5 border border-forest/10">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate mb-0.5">สถานที่</p>
          <p className="font-semibold text-forest truncate">{place.name}</p>
          <p className="text-xs text-slate">{place.location}, {place.province}</p>
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="visitedAt" className="block text-sm font-medium text-forest mb-1.5">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            วันที่ไป <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="visitedAt"
          type="date"
          value={visitedAt}
          max={todayISO}
          onChange={(e) => {
            setVisitedAt(e.target.value);
            setErrors((prev) => ({ ...prev, visitedAt: "" }));
          }}
          required
          aria-invalid={!!errors.visitedAt}
          aria-describedby={errors.visitedAt ? "visitedAt-error" : undefined}
          className="glass-input block w-full px-3 py-2.5 text-forest focus:outline-none focus:ring-2 focus:ring-forest transition-shadow"
        />
        {errors.visitedAt && (
          <p id="visitedAt-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.visitedAt}
          </p>
        )}
      </div>

      {/* Photo uploader */}
      <PhotoUploader value={photos} onChange={setPhotos} />

      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-forest mb-1.5">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            บันทึกความทรงจำ
          </span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="เล่าประสบการณ์การเดินทาง สิ่งที่ประทับใจ หรือเคล็ดลับสำหรับการไปครั้งหน้า..."
          className="glass-input block w-full px-3 py-2.5 text-forest placeholder-slate/60 resize-none focus:outline-none focus:ring-2 focus:ring-forest transition-shadow"
        />
      </div>

      {/* Star rating */}
      <div>
        <p className="text-sm font-medium text-forest mb-2">คะแนนส่วนตัว (ไม่บังคับ)</p>
        <div
          role="radiogroup"
          aria-label="คะแนนส่วนตัว 1 ถึง 5 ดาว"
          className="flex gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} ดาว`}
              onClick={() => setRating(rating === star ? 0 : star)}
              onMouseEnter={() => setHoverRating(star)}
              className="p-0.5 focus:outline-none focus:ring-2 focus:ring-forest rounded transition-transform active:scale-90"
            >
              <Star
                className={`w-7 h-7 transition-colors duration-100 ${
                  star <= (hoverRating || rating)
                    ? "fill-gold text-gold"
                    : "text-beige"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-2 text-xs text-slate hover:text-forest underline"
            >
              ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <p role="alert" className="text-sm text-red-600">
          {errors.submit}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="glass-button w-full py-3 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "กำลังบันทึก…" : "บันทึกลงแพสพอร์ต"}
      </button>
    </form>
  );
}

