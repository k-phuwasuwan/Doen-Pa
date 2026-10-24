"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
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
    <div className="page-shell">
      <ProfileHeader user={user} coverImage={user.coverImage} />
      <div className="mt-4">
        <ProfileStats
          placeCount={placeCount}
          provinceCount={provinceCount}
          photoCount={photoCount}
        />
      </div>
      <div className="mt-8">
        <PostGallery posts={posts} />
      </div>
      <div className="mt-10 border-t border-brand-800/10 pt-5">
        <LogoutButton />
      </div>
    </div>
  );
}
