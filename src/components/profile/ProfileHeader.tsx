import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
  coverImage?: string;
  showEditButton?: boolean;
  headingLevel?: 1 | 2;
}

export function ProfileHeader({ user, coverImage, showEditButton = true, headingLevel = 1 }: ProfileHeaderProps) {
  const initials = user.name.slice(0, 1);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="liquid-glass-card overflow-hidden" aria-labelledby="profile-heading">
      <div className="relative h-40 bg-brand-600 sm:h-48">
        {coverImage && (
          <Image src={coverImage} alt="ภาพปกโปรไฟล์" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 600px" />
        )}
        <div className="absolute inset-0 bg-brand-600/25" />
        {showEditButton && (
          <Link href="/profile/edit" className="absolute right-4 top-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-brand-800 shadow-glass transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="แก้ไขโปรไฟล์">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            แก้ไขโปรไฟล์
          </Link>
        )}
      </div>
      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-3xl font-bold text-white ring-4 ring-white/90 sm:h-28 sm:w-28">
            {user.avatar ? <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="112px" /> : initials}
          </div>
          <div className="min-w-0 pb-1">
            <Heading id="profile-heading" className="break-words text-2xl font-bold text-brand-800">{user.name}</Heading>
            <p className="text-sm text-brand-800/65">@{user.username}</p>
          </div>
        </div>
        <p className="mt-5 max-w-md text-sm leading-6 text-brand-800/65">{user.bio || "บันทึกการเดินทางและความทรงจำจากทุกเส้นทาง"}</p>
      </div>
    </section>
  );
}
