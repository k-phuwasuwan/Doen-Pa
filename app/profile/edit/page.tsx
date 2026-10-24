import { BackButton } from "@/components/place/BackButton";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { requireAuthUser } from "@/lib/auth/server";

export default async function EditProfilePage() {
  const user = await requireAuthUser("/profile/edit");
  const setup = user.needsProfileSetup === true;
  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl">
        {!setup && <BackButton href="/profile" />}
        <div className={setup ? "mt-2" : "mt-5"}>
          <h1 className="text-2xl font-bold text-brand-800 sm:text-[1.75rem]">{setup ? "ตั้งค่าโปรไฟล์ของคุณ" : "แก้ไขโปรไฟล์"}</h1>
          <p className="mt-1 text-sm text-brand-800/65">{setup ? "ตั้งชื่อและชื่อผู้ใช้ของคุณ แล้วเลือกเพิ่มรูปโปรไฟล์ได้ตามต้องการ" : "ปรับข้อมูลและรูปภาพที่แสดงบนโปรไฟล์ของคุณ"}</p>
        </div>
        <ProfileEditor setup={setup} />
      </div>
    </div>
  );
}
