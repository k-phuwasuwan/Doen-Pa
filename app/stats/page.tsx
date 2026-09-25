import { BarChart3, ChartNoAxesCombined } from "lucide-react";
import { StatsContent } from "@/components/stats/StatsContent";
import { GuestPrivatePage } from "@/components/ui/GuestPrivatePage";

interface StatsPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const { view } = await searchParams;

  if (view === "guest") {
    return (
      <GuestPrivatePage
        label="Doen Pa Stats"
        title="สถิติของคุณ"
        emptyTitle="ยังไม่มีสถิติการเดินทาง"
        description="เข้าสู่ระบบเพื่อดูจำนวนสถานที่ จังหวัด รูปภาพ และตราที่สะสมจากการเดินทางของคุณ"
        previewHref="/stats"
        previewLabel="ดูตัวอย่างสถิติ"
        headerIcon={BarChart3}
        emptyIcon={ChartNoAxesCombined}
      />
    );
  }

  return <StatsContent />;
}
