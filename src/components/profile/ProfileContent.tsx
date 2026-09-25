"use client";

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
          </div>
          <PostGallery posts={posts} />
        </div>
      </div>
    </div>
  );
}
