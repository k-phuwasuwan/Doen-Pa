import { UserRound, UserRoundPen } from "lucide-react";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { GuestPrivatePage } from "@/components/ui/GuestPrivatePage";

interface ProfilePageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { view } = await searchParams;

  if (view === "guest") {
    return (
      <GuestPrivatePage
        label="Doen Pa Profile"
        title="โปรไฟล์ของคุณ"
        emptyTitle="โปรไฟล์ของคุณยังว่างเปล่า"
        description="เข้าสู่ระบบเพื่อเก็บข้อมูลการเดินทาง รูปภาพ และความทรงจำไว้ในโปรไฟล์ของคุณ"
        previewHref="/profile"
        previewLabel="ดูตัวอย่างโปรไฟล์"
        headerIcon={UserRound}
        emptyIcon={UserRoundPen}
      />
    );
  }

  return <ProfileContent />;
}
