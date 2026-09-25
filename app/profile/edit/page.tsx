import type { Metadata } from "next";
import { BackButton } from "@/components/place/BackButton";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export const metadata: Metadata = {
  title: "แก้ไขโปรไฟล์ | Doen Pa",
};

export default function EditProfilePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <BackButton href="/profile" />
      <div className="mt-7">
        <h1 className="text-3xl font-bold text-brand-800 sm:text-4xl">แก้ไขโปรไฟล์</h1>
        <p className="mt-2 text-sm text-brand-800/65 sm:text-base">ปรับข้อมูลและรูปภาพที่แสดงบนโปรไฟล์ของคุณ</p>
      </div>
      <ProfileEditor />
    </div>
  );
}
