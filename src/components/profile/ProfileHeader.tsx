import Image from "next/image";
import { photoThumb } from "@/domain/account-data";
import Link from "next/link";
import { Pencil, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
  coverImage?: string;
  showEditButton?: boolean;
  headingLevel?: 1 | 2;
  /** Control placed on the cover, e.g. the editor's cover picker. */
  coverAction?: ReactNode;
  /** Control pinned to the avatar, e.g. the editor's avatar picker. */
  avatarAction?: ReactNode;
}

export function ProfileHeader({ user, coverImage, showEditButton = true, headingLevel = 1, coverAction, avatarAction }: ProfileHeaderProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="liquid-glass-card overflow-hidden" aria-labelledby="profile-heading">
      <div className="relative h-32 bg-brand-600 sm:h-44">
        {coverImage && <>
          <Image unoptimized src={photoThumb(coverImage, 1280)} alt="ภาพปกโปรไฟล์" fill priority className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
          <div className="absolute inset-0 bg-brand-600/20" />
        </>}
        {showEditButton && (
          <Link href="/profile/edit" className="absolute right-3 top-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-brand-800 shadow-lg shadow-brand-950/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:top-4" aria-label="แก้ไขโปรไฟล์">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            แก้ไขโปรไฟล์
          </Link>
        )}
        {coverAction && <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">{coverAction}</div>}
      </div>
      <div className="px-5 pb-5 sm:px-7 sm:pb-6">
        <div className="-mt-10 flex items-start gap-4 sm:-mt-12">
          <div className="relative shrink-0">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-white ring-4 ring-white/90 sm:h-24 sm:w-24">
              {user.avatar ? <Image unoptimized src={photoThumb(user.avatar, 256)} alt={user.name} fill priority className="object-cover" sizes="96px" /> : <UserRound className="h-10 w-10" aria-hidden="true" />}
            </div>
            {avatarAction && <div className="absolute -bottom-1 -right-1">{avatarAction}</div>}
          </div>
          <div className="min-w-0 pt-11 sm:pt-14">
            <Heading id="profile-heading" className="break-words text-xl font-bold leading-snug text-brand-800 sm:text-2xl">{user.name}</Heading>
            <p className="text-sm text-brand-800/60">@{user.username}</p>
          </div>
        </div>
        {user.bio && <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-800/70">{user.bio}</p>}
      </div>
    </section>
  );
}
