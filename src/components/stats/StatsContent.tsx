"use client";

import { useMemo } from "react";
import { useTravelRecords } from "@/lib/use-travel-records";
import { CategoryStats } from "@/components/stats/CategoryStats";
import { NationalParkProgress } from "@/components/stats/NationalParkProgress";
import { ProvinceProgress } from "@/components/stats/ProvinceProgress";
import { RegionStats } from "@/components/stats/RegionStats";
import { StatsHero } from "@/components/stats/StatsHero";
import { statsService } from "@/services/stats.service";
import { placeService } from "@/services/place.service";
import { userService } from "@/services/user.service";

const totalNationalParks = placeService.getAll().length;

export function StatsContent() {
  const currentUser = userService.getCurrentUser();
  const records = useTravelRecords(currentUser.id);
  const stats = useMemo(() => statsService.calculateStats(currentUser.id, records), [currentUser.id, records]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <StatsHero stats={stats} journeyCount={records.length} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2"><ProvinceProgress stats={stats} /></div>
          <div className="lg:col-span-2">
            <NationalParkProgress visitedCount={stats.totalPlaces} totalCount={totalNationalParks} />
          </div>
          <CategoryStats stats={stats} />
          <RegionStats stats={stats} />
        </div>
      </div>
    </div>
  );
}
