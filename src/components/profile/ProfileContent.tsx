"use client";

import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { useTravelRecords } from "@/lib/use-travel-records";
import { PostGallery } from "@/components/profile/PostGallery";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { placeService } from "@/services/place.service";
import { useCurrentUser } from "@/lib/use-current-user";

export function ProfileContent() {
  const user = useCurrentUser();
  const records = useTravelRecords(user.id);
  const entries = records.flatMap((record) => {
    const place = placeService.getPlaceById(record.placeId);
    return place ? [{ record, place }] : [];
  });
  const photoCounts = new Map<string, number>();
  const posts = [...entries]
    .sort((a, b) => b.record.visitedAt.getTime() - a.record.visitedAt.getTime() || b.record.createdAt.getTime() - a.record.createdAt.getTime())
    .flatMap(({ record, place }) => record.photos.map((photo) => {
      const photoIndex = photoCounts.get(place.id) ?? 0;
      photoCounts.set(place.id, photoIndex + 1);
      return { photo, place, recordId: record.id, photoIndex };
    }));
  const provinceCount = new Set(entries.map(({ place }) => place.province)).size;
  const placeCount = new Set(entries.map(({ place }) => place.id)).size;
  const photoCount = posts.length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)] lg:items-start">
          <div className="space-y-6">
            <ProfileHeader user={user} coverImage={user.coverImage} />
            <ProfileStats
              placeCount={placeCount}
              provinceCount={provinceCount}
              photoCount={photoCount}
            />
            <Link
              href="/profile?view=guest"
              className="liquid-glass-card group flex min-h-16 items-center gap-4 rounded-3xl px-5 py-4 text-brand-800 transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700 transition-colors group-hover:bg-brand-600/15">
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">ออกจากระบบ</span>
                <span className="block text-sm text-brand-800/60">กลับสู่หน้าเยี่ยมชม</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-700/70 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
          <PostGallery posts={posts} />
        </div>
      </div>
    </div>
  );
}
