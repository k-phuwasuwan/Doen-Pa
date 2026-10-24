"use client";

import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { CategoryStats } from "@/components/stats/CategoryStats";
import { NationalParkProgress } from "@/components/stats/NationalParkProgress";
import { ProvinceProgress } from "@/components/stats/ProvinceProgress";
import { RegionStats } from "@/components/stats/RegionStats";
import { StatsHero } from "@/components/stats/StatsHero";
import { useCurrentUser } from "@/lib/use-current-user";

export function StatsContent() {
  const currentUser = useCurrentUser();
  const memories = useTravelRecordReadModel(currentUser.id);
  const stats = memories.getStats();

  return (
    <div className="page-shell">
      <StatsHero stats={stats} journeyCount={memories.counts.records} />

      <div className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-2">
        <ProvinceProgress stats={stats} />
        <NationalParkProgress visitedCount={stats.visitedNationalParks} totalCount={stats.totalNationalParks} />
        <CategoryStats stats={stats} />
        <RegionStats stats={stats} />
      </div>
    </div>
  );
}
