"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle2, Stamp } from "lucide-react";
import { PhotoUploader, type UploadedPhoto } from "./PhotoUploader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useImageImport } from "@/lib/use-image-import";
import type { Place } from "@/types";
import { formatStampDate } from "@/lib/utils";
import { InkStamp } from "@/components/ui/InkStamp";

interface TravelRecordFormProps {
  place: Place;
}

export function TravelRecordForm({ place }: TravelRecordFormProps) {
  const { records } = useAuth();
  const router = useRouter();
  const { importer, loading: readingPhotos } = useImageImport();

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [submissionId] = useState(() => crypto.randomUUID());
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
    if (!visitedAt) {
      errs.visitedAt = "กรุณาเลือกวันที่ไป";
    } else {
      const parsed = new Date(`${visitedAt}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(visitedAt) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== visitedAt || visitedAt > todayISO) {
        errs.visitedAt = "กรุณาเลือกวันที่ที่ไม่เกินวันนี้";
      }
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (importer.isPending() || submitting) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await records.createRecord({
        id: submissionId,
        placeId: place.id,
        visitedAt: new Date(`${visitedAt}T12:00:00Z`),
        note: note.trim(),
        photos: photos.map((p) => p.dataUrl),
        rating,
      });

      setSuccess(true);
      // Brief success flash before redirect
      setTimeout(() => router.push("/passport"), 800);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่" });
      setSubmitting(false);
    }
  };

  const stampDate = /^\d{4}-\d{2}-\d{2}$/.test(visitedAt) ? formatStampDate(new Date(`${visitedAt}T12:00:00Z`)) : null;

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-8">
      <aside className="liquid-glass-card flex items-center gap-4 p-4 lg:sticky lg:top-24 lg:flex-col lg:gap-5 lg:px-8 lg:py-10 lg:text-center" aria-label="ตัวอย่างตราประทับ">
        <InkStamp
          key={`${visitedAt}-${success}`}
          top={place.name}
          bottom={place.province || "DOEN PA"}
          center={stampDate?.dayMonth ?? "—"}
          sub={stampDate?.year}
          seed={place.id}
          press
          className="h-24 w-24 shrink-0 lg:h-52 lg:w-52"
        />
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-brand-800 lg:text-lg">{place.name}</p>
          <p className="mt-0.5 text-sm text-brand-800/65">{place.location} {place.province}</p>
        </div>
      </aside>

      <section className="liquid-glass-card p-5 sm:p-7" aria-labelledby="record-heading">
        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center" role="status">
            <CheckCircle2 className="h-10 w-10 text-brand-600" aria-hidden="true" />
            <p className="text-lg font-bold text-brand-800">บันทึกสำเร็จ!</p>
            <p className="text-sm text-brand-800/65">กำลังพาไปที่พาสปอร์ต…</p>
          </div>
        ) : (
          <>
            <h1 id="record-heading" className="text-xl font-bold text-brand-800 sm:text-2xl">บันทึกการเดินทาง</h1>
            <p className="mt-1 text-sm text-brand-800/65">เลือกวันที่ไป แล้วเพิ่มรูปและความทรงจำของทริปนี้</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
              <div>
                <label htmlFor="visitedAt" className="mb-1.5 block text-sm font-medium text-brand-800">
                  วันที่ไป <span className="text-red-600" aria-hidden="true">*</span>
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
                  className="glass-input block min-h-12 w-full px-4 text-brand-800 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.visitedAt && (
                  <p id="visitedAt-error" role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.visitedAt}
                  </p>
                )}
              </div>

              <PhotoUploader value={photos} onChange={setPhotos} importer={importer} loading={readingPhotos} />

              <div>
                <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-brand-800">
                  บันทึกความทรงจำ
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="สิ่งที่ประทับใจ หรือเคล็ดลับสำหรับครั้งหน้า"
                  className="glass-input block w-full resize-none px-4 py-3 text-brand-800 placeholder-brand-800/45 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-brand-800">คะแนนส่วนตัว</p>
                <div
                  role="radiogroup"
                  aria-label="คะแนนส่วนตัว 1 ถึง 5 ดาว"
                  className="-ml-1.5 mt-1 flex"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} ดาว`}
                      onClick={() => {
                        setRating(rating === star ? 0 : star);
                        setHoverRating(0);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-90"
                    >
                      <Star
                        aria-hidden="true"
                        className={`h-6 w-6 transition-colors duration-100 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-brand-800/25"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <p role="alert" className="text-sm text-red-700">
                  {errors.submit}
                </p>
              )}

              <div className="border-t border-brand-800/10 pt-5">
                <button
                  type="submit"
                  disabled={submitting || readingPhotos}
                  className="glass-button flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Stamp className="h-5 w-5" aria-hidden="true" />
                  {readingPhotos ? "กำลังอ่านรูปภาพ…" : submitting ? "กำลังบันทึก…" : "บันทึกลงพาสปอร์ต"}
                </button>
                <p className="mt-2 text-center text-xs text-brand-800/60">บันทึกและรูปภาพจะเก็บในบัญชีของคุณเท่านั้น</p>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
