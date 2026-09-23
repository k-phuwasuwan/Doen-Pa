"use client";

import { useTravelRecords } from "@/lib/use-travel-records";
import { placeService } from "@/services/place.service";
import { userService } from "@/services/user.service";
import DynamicThailandMap from "@/components/map/DynamicThailandMap";
import { PROVINCE_TH_TO_EN } from "@/components/map/constants";
import { MapPin } from "lucide-react";

export function MapOverview() {
  const userRecords = useTravelRecords(userService.getCurrentUser().id);
  const visitedProvinces = Array.from(
    new Set(
      userRecords
        .map((r) => placeService.getPlaceById(r.placeId)?.province)
        .filter((p): p is string => !!p),
    ),
  );

  const visitedCount = new Set(userRecords.map((record) => record.placeId)).size;

  // For side panel: list provinces with their English name for display
  const visitedProvincesList = visitedProvinces.map((th) => ({
    th,
    en: PROVINCE_TH_TO_EN[th] ?? th,
  }));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 sm:py-8 lg:h-[calc(100vh-4rem)]">
      <div className="relative flex flex-col gap-4 lg:h-full lg:flex-row lg:gap-6">

        {/* Badge overlay — top-center */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none lg:left-auto lg:translate-x-0 lg:right-80">
          <div className="liquid-glass-card px-4 py-2 flex items-center gap-2 text-sm font-semibold text-brand-800 whitespace-nowrap shadow-glass">
            <MapPin className="w-4 h-4 shrink-0" />
            อุทยานที่ไปแล้ว {visitedCount} แห่ง
          </div>
        </div>

        {/* Map — takes all available height */}
        <div className="relative h-[55vh] min-h-[360px] flex-1 lg:h-full">
          <DynamicThailandMap visitedProvinces={visitedProvinces} />
        </div>

        {/* Side panel — desktop only */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0">
          <div className="liquid-glass-card p-5 flex flex-col h-full">
            <h2 className="text-lg font-bold text-brand-800 mb-1">จังหวัดที่ไปแล้ว</h2>
            <p className="text-brand-800/65 text-xs mb-4">
              {visitedProvinces.length} จาก 77 จังหวัด
            </p>

            {visitedProvincesList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <MapPin className="w-8 h-8 text-brand-800/30 mb-3" />
                <p className="text-brand-800/65 text-sm">ยังไม่มีการเดินทาง</p>
                <p className="text-brand-800/65 text-xs mt-1">เริ่มบันทึกการเดินทางแรกของคุณ</p>
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto space-y-2 pr-1">
                {visitedProvincesList.map(({ th, en }) => (
                  <li
                    key={th}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-brand-600/5 hover:bg-brand-600/10 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-800 truncate">{th}</p>
                      <p className="text-xs text-brand-800/65 truncate">{en}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Mobile province list below map */}
        {visitedProvincesList.length > 0 && (
          <div className="lg:hidden liquid-glass-card p-4">
            <h2 className="text-base font-bold text-brand-800 mb-3">
              จังหวัดที่ไปแล้ว ({visitedProvinces.length}/77)
            </h2>
            <div className="flex flex-wrap gap-2">
              {visitedProvincesList.map(({ th }) => (
                <span
                  key={th}
                  className="px-3 py-1 rounded-full bg-brand-600/10 text-brand-800 text-xs font-medium"
                >
                  {th}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
