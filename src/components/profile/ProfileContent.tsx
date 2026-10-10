"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { PostGallery } from "@/components/profile/PostGallery";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { useCurrentUser } from "@/lib/use-current-user";

export function ProfileContent() {
  const user = useCurrentUser();
  const { photos: posts, counts } = useTravelRecordReadModel(user.id);
  const { places: placeCount, provinces: provinceCount, photos: photoCount } = counts;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)] lg:items-start">
          <div className="contents lg:block lg:space-y-6">
            <ProfileHeader user={user} coverImage={user.coverImage} />
            <ProfileStats
              placeCount={placeCount}
              provinceCount={provinceCount}
              photoCount={photoCount}
            />
            <Link
              href="/profile?view=guest"
              className="liquid-glass-card group order-last flex items-center gap-4 rounded-3xl px-5 py-3 text-brand-800 transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:order-none"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700 transition-colors group-hover:bg-brand-600/15">
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-semibold leading-6">ออกจากระบบ</span>
            </Link>
          </div>
          <PostGallery posts={posts} />
        </div>
      </div>
    </div>
  );
}
