import { photoThumb } from "@/domain/account-data";
import Image from "next/image";
import { UserRound } from "lucide-react";
import type { User } from "@/types";
import { StatCard } from "@/components/ui/StatCard";

interface PassportHeaderProps {
  user: User;
  placeCount: number;
  provinceCount: number;
  photoCount: number;
}

export function PassportHeader({
  user,
  placeCount,
  provinceCount,
  photoCount,
}: PassportHeaderProps) {
  return (
    <section className="liquid-glass-card p-6 md:p-8" aria-labelledby="passport-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-2xl font-bold text-white ring-4 ring-white/70">
            {user.avatar ? (
              <Image unoptimized src={photoThumb(user.avatar, 256)} alt={user.name} fill className="object-cover" />
            ) : (
              <UserRound className="h-8 w-8" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-brand-800/65">บันทึกการเดินทางของ</p>
            <h1 id="passport-heading" className="text-2xl font-bold text-brand-800">
              {user.name}
            </h1>
            <p className="text-sm text-brand-800/65">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard value={placeCount} label="สถานที่" />
          <StatCard value={provinceCount} label="จังหวัด" />
          <StatCard value={photoCount} label="รูปภาพ" />
        </div>
      </div>
    </section>
  );
}
