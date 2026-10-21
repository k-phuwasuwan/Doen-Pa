import { BarChart3, ChartNoAxesCombined } from "lucide-react";
import { StatsContent } from "@/components/stats/StatsContent";
import { CatalogContent } from "@/components/place/CatalogContent";
import { GuestPrivatePage } from "@/components/ui/GuestPrivatePage";
import { getAuthUser } from "@/lib/auth/server";

export const metadata = {
  title: "สถิติ | Doen Pa",
};

interface StatsPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const { view } = await searchParams;

  if (view === "guest" || !(await getAuthUser())) {
    return (
      <GuestPrivatePage
        label="Doen Pa Stats"
        title="สถิติของคุณ"
        emptyTitle="ยังไม่มีสถิติการเดินทาง"
        description="เข้าสู่ระบบเพื่อดูจำนวนสถานที่ จังหวัด ภูมิภาค และสถิติจากการเดินทางของคุณ"
        previewHref="/stats"
        headerIcon={BarChart3}
        emptyIcon={ChartNoAxesCombined}
      />
    );
  }

  return <CatalogContent>{() => <StatsContent />}</CatalogContent>;
}
