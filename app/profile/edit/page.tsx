import { BackButton } from "@/components/place/BackButton";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { requireAuthUser } from "@/lib/auth/server";

export default async function EditProfilePage() {
  const user = await requireAuthUser("/profile/edit");
  const setup = user.needsProfileSetup === true;
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {!setup && <BackButton href="/profile" />}
      <div className={setup ? "" : "mt-7"}>
        <h1 className="text-3xl font-bold text-brand-800 sm:text-4xl">{setup ? "ตั้งค่าโปรไฟล์ของคุณ" : "แก้ไขโปรไฟล์"}</h1>
        <p className="mt-2 text-sm text-brand-800/65 sm:text-base">{setup ? "ตั้งชื่อและชื่อผู้ใช้ของคุณ แล้วเลือกเพิ่มรูปโปรไฟล์ได้ตามต้องการ" : "ปรับข้อมูลและรูปภาพที่แสดงบนโปรไฟล์ของคุณ"}</p>
      </div>
      <ProfileEditor setup={setup} />
    </div>
  );
}
