"use client";

import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { CategoryStats } from "@/components/stats/CategoryStats";
import { NationalParkProgress } from "@/components/stats/NationalParkProgress";
import { ProvinceProgress } from "@/components/stats/ProvinceProgress";
import { RegionStats } from "@/components/stats/RegionStats";
import { StatsHero } from "@/components/stats/StatsHero";
import { userService } from "@/services/user.service";

export function StatsContent() {
  const currentUser = userService.getCurrentUser();
  const memories = useTravelRecordReadModel(currentUser.id);
  const stats = memories.getStats();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <StatsHero stats={stats} journeyCount={memories.counts.records} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2"><ProvinceProgress stats={stats} /></div>
          <div className="lg:col-span-2">
            <NationalParkProgress visitedCount={stats.visitedNationalParks} totalCount={stats.totalNationalParks} />
          </div>
          <CategoryStats stats={stats} />
          <RegionStats stats={stats} />
        </div>
      </div>
    </div>
  );
}
