import { BadgeGrid } from "@/components/stats/BadgeGrid";
import { BadgeTeaser } from "@/components/stats/BadgeTeaser";
import { CategoryStats } from "@/components/stats/CategoryStats";
import { ProvinceProgress } from "@/components/stats/ProvinceProgress";
import { RegionStats } from "@/components/stats/RegionStats";
import { StatsHero } from "@/components/stats/StatsHero";
import { statsService } from "@/services/stats.service";
import { userService } from "@/services/user.service";

export default function StatsPage() {
  const currentUser = userService.getCurrentUser();
  const stats = statsService.calculateStats(currentUser.id);

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <StatsHero stats={stats} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <BadgeTeaser stats={stats} />
          <BadgeGrid stats={stats} />
          <ProvinceProgress stats={stats} />
          <CategoryStats stats={stats} />
          <RegionStats stats={stats} />
        </div>
      </div>
    </main>
  );
}
