import Image from "next/image";
import { Pencil } from "lucide-react";
import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
  coverImage?: string;
}

export function ProfileHeader({ user, coverImage }: ProfileHeaderProps) {
  const initials = user.name.slice(0, 1);

  return (
    <section className="liquid-glass-card overflow-hidden" aria-labelledby="profile-heading">
      <div className="relative h-40 bg-brand-600 sm:h-48">
        {coverImage && (
          <Image src={coverImage} alt="ภาพปกโปรไฟล์" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 320px" />
        )}
        <div className="absolute inset-0 bg-brand-600/25" />
        <button type="button" className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg bg-white/85 px-3 py-2 text-sm font-medium text-brand-800 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="แก้ไขโปรไฟล์">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          แก้ไขโปรไฟล์
        </button>
      </div>
      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-14 sm:flex-row sm:items-end">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-3xl font-bold text-white ring-4 ring-white/90 sm:h-28 sm:w-28">
            {user.avatar ? <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="112px" /> : initials}
          </div>
          <div className="pb-1">
            <h1 id="profile-heading" className="text-2xl font-bold text-brand-800">{user.name}</h1>
            <p className="text-sm text-brand-800/65">@{user.username}</p>
          </div>
        </div>
        <p className="mt-5 max-w-md text-sm leading-6 text-brand-800/65">{user.bio || "บันทึกการเดินทางและความทรงจำจากทุกเส้นทาง"}</p>
      </div>
    </section>
  );
}
