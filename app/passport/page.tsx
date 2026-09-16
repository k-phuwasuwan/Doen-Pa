"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";
import { PassportFilter } from "@/components/passport/PassportFilter";
import { PassportHeader } from "@/components/passport/PassportHeader";
import { TravelRecordCard } from "@/components/passport/TravelRecordCard";
import { placeService } from "@/services/place.service";
import { travelRecordService } from "@/services/travel-record.service";
import { userService } from "@/services/user.service";
import type { PlaceType } from "@/types";

export default function PassportPage() {
  const [passportState] = useState(() => {
    try {
      const currentUser = userService.getCurrentUser();
      const records = travelRecordService.getRecordsByUser(currentUser.id);
      const recordEntries = records.flatMap((record) => {
        const place = placeService.getPlaceById(record.placeId);
        return place ? [{ record, place }] : [];
      });

      return { user: currentUser, entries: recordEntries, error: null };
    } catch {
      return {
        user: null,
        entries: [],
        error: "ไม่สามารถโหลดพาสปอร์ตได้ กรุณาลองใหม่อีกครั้ง",
      };
    }
  });
  const [selectedType, setSelectedType] = useState<PlaceType | "all">("all");

  const { user, entries, error } = passportState;

  const filteredEntries = selectedType === "all"
    ? entries
    : entries.filter(({ place }) => place.type === selectedType);
  const provinceCount = new Set(entries.map(({ place }) => place.province)).size;
  const photoCount = entries.reduce((total, { record }) => total + record.photos.length, 0);

  if (error || !user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-[1280px] items-center justify-center px-4 py-8">
        <div className="card-glass max-w-md p-8 text-center">
          <p className="font-medium text-forest">{error || "ไม่พบข้อมูลผู้ใช้"}</p>
          <button type="button" onClick={() => window.location.reload()} className="glass-button mt-5 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-forest">
            ลองใหม่
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PassportHeader
        user={user}
        placeCount={entries.length}
        provinceCount={provinceCount}
        photoCount={photoCount}
      />

      <section className="mt-6 sm:mt-8" aria-labelledby="records-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="records-heading" className="text-2xl font-bold text-forest">บันทึกการเดินทาง</h2>
            <p className="mt-1 text-sm text-slate">รวมความทรงจำจากเส้นทางที่คุณเคยไป</p>
          </div>
          <span className="shrink-0 text-sm text-slate">{filteredEntries.length} แห่ง</span>
        </div>
        <PassportFilter currentType={selectedType} onChange={setSelectedType} />
      </section>

      {filteredEntries.length > 0 ? (
        <section className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="รายการบันทึกการเดินทาง">
          {filteredEntries.map(({ record, place }) => (
            <TravelRecordCard key={record.id} record={record} place={place} />
          ))}
        </section>
      ) : (
        <section className="card-glass mt-6 flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
            {entries.length === 0 ? <BookOpen className="h-7 w-7" aria-hidden="true" /> : <Compass className="h-7 w-7" aria-hidden="true" />}
          </div>
          <h3 className="mt-4 text-xl font-bold text-forest">
            {entries.length === 0 ? "พาสปอร์ตของคุณยังว่างเปล่า" : "ไม่พบบันทึกในหมวดนี้"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate">
            {entries.length === 0 ? "เริ่มต้นด้วยการเพิ่มสถานที่ที่คุณเคยไป" : "ลองเลือกประเภทสถานที่อื่นเพื่อดูบันทึกของคุณ"}
          </p>
          {entries.length === 0 && (
            <Link href="/search" className="glass-button mt-5 inline-flex items-center px-5 py-3 text-sm font-medium transition hover:bg-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest">
              สำรวจสถานที่
            </Link>
          )}
        </section>
      )}
    </main>
  );
}
