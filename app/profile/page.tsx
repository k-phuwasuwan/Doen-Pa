import { UserRound, UserRoundPen } from "lucide-react";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { CatalogContent } from "@/components/place/CatalogContent";
import { GuestPrivatePage } from "@/components/ui/GuestPrivatePage";
import { getAuthUser } from "@/lib/auth/server";

export const metadata = {
  title: "โปรไฟล์ | Doen Pa",
};

interface ProfilePageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { view } = await searchParams;

  if (view === "guest" || !(await getAuthUser())) {
    return (
      <GuestPrivatePage
        label="Doen Pa Profile"
        title="โปรไฟล์ของคุณ"
        emptyTitle="โปรไฟล์ของคุณยังว่างเปล่า"
        description="เข้าสู่ระบบเพื่อเก็บข้อมูลการเดินทาง รูปภาพ และความทรงจำไว้ในโปรไฟล์ของคุณ"
        previewHref="/profile"
        previewLabel="ค้นหาสถานที่"
        headerIcon={UserRound}
        emptyIcon={UserRoundPen}
      />
    );
  }

  return <CatalogContent>{() => <ProfileContent />}</CatalogContent>;
}
