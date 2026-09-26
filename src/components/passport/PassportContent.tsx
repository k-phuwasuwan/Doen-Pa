"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";
import { PassportFilter } from "@/components/passport/PassportFilter";
import { PassportHeader } from "@/components/passport/PassportHeader";
import { TravelRecordCard } from "@/components/passport/TravelRecordCard";
import { placeService } from "@/services/place.service";
import { useTravelRecords } from "@/lib/use-travel-records";
import { useCurrentUser } from "@/lib/use-current-user";
import type { PlaceType } from "@/types";

export function PassportContent() {
  const user = useCurrentUser();
  const records = useTravelRecords(user.id);
  const entries = records.flatMap((record) => {
    const place = placeService.getPlaceById(record.placeId);
    return place ? [{ record, place }] : [];
  });
  const [selectedType, setSelectedType] = useState<PlaceType | "all">("all");

  const filteredEntries = selectedType === "all"
    ? entries
    : entries.filter(({ place }) => placeService.matchesType(place, selectedType));
  const provinceCount = new Set(entries.map(({ place }) => place.province)).size;
  const placeCount = new Set(entries.map(({ place }) => place.id)).size;
  const photoCount = entries.reduce((total, { record }) => total + record.photos.length, 0);

  return (
    <div className="mx-auto min-h-screen max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PassportHeader
        user={user}
        placeCount={placeCount}
        provinceCount={provinceCount}
        photoCount={photoCount}
      />

      <section className="mt-10 sm:mt-12" aria-labelledby="records-heading">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 id="records-heading" className="text-2xl font-bold text-brand-800 sm:text-3xl">บันทึกการเดินทาง</h2>
            <p className="mt-1 text-sm text-brand-800/65 sm:text-base">รวมความทรงจำจากเส้นทางที่คุณเคยไป</p>
          </div>
          <span className="liquid-glass shrink-0 rounded-full px-3 py-1 text-xs font-medium text-brand-800/75 sm:px-4 sm:py-1.5 sm:text-sm">{filteredEntries.length} บันทึก</span>
        </div>
        <PassportFilter currentType={selectedType} onChange={setSelectedType} />
      </section>

      {filteredEntries.length > 0 ? (
        <section className="mt-9 grid gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3" aria-label="รายการบันทึกการเดินทาง">
          {filteredEntries.map(({ record, place }) => (
            <TravelRecordCard key={record.id} record={record} place={place} />
          ))}
        </section>
      ) : (
        <section className="liquid-glass-card mt-9 flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center sm:mt-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/10 text-brand-800">
            {entries.length === 0 ? <BookOpen className="h-7 w-7" aria-hidden="true" /> : <Compass className="h-7 w-7" aria-hidden="true" />}
          </div>
          <h3 className="mt-4 text-xl font-bold text-brand-800">
            {entries.length === 0 ? "พาสปอร์ตของคุณยังว่างเปล่า" : "ไม่พบบันทึกในหมวดนี้"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-brand-800/65">
            {entries.length === 0 ? "เริ่มต้นด้วยการเพิ่มสถานที่ที่คุณเคยไป" : "ลองเลือกประเภทสถานที่อื่นเพื่อดูบันทึกของคุณ"}
          </p>
          {entries.length === 0 && (
            <Link href="/search" className="glass-button mt-5 inline-flex items-center px-5 py-3 text-sm font-medium transition hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              สำรวจสถานที่
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
