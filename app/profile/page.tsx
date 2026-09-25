"use client";

import { useTravelRecords } from "@/lib/use-travel-records";
import { PostGallery } from "@/components/profile/PostGallery";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { placeService } from "@/services/place.service";
import { userService } from "@/services/user.service";

export default function ProfilePage() {
  const user = userService.getCurrentUser();
  const records = useTravelRecords(user.id);
  const entries = records.flatMap((record) => {
    const place = placeService.getPlaceById(record.placeId);
    return place ? [{ record, place }] : [];
  });
  const posts = entries.flatMap(({ record, place }) =>
    record.photos.map((photo) => ({ photo, place, recordId: record.id })),
  );
  const provinceCount = new Set(entries.map(({ place }) => place.province)).size;
  const placeCount = new Set(entries.map(({ place }) => place.id)).size;
  const badgeCount = Math.min(14, placeCount);
  const coverImage = placeService.getAll()[0]?.image;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)] lg:items-start">
          <div className="space-y-6">
            <ProfileHeader user={user} coverImage={coverImage} />
            <ProfileStats
              placeCount={placeCount}
              provinceCount={provinceCount}
              badgeCount={badgeCount}
            />
          </div>
          <PostGallery posts={posts} />
        </div>
      </div>
    </div>
  );
}
