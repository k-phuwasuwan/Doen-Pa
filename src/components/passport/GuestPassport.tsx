import { Compass } from "lucide-react";
import { GuestPrivatePage } from "@/components/ui/GuestPrivatePage";

export function GuestPassport() {
  return (
    <GuestPrivatePage
      emptyTitle="พาสปอร์ตของคุณยังว่างเปล่า"
      description="เข้าสู่ระบบเพื่อเก็บสถานที่ที่เคยไป รูปภาพ และความทรงจำไว้ในพาสปอร์ตของคุณ"
      previewHref="/passport"
      emptyIcon={Compass}
    />
  );
}
