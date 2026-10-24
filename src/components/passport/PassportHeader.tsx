import { photoThumb } from "@/domain/account-data";
import Image from "next/image";
import { UserRound } from "lucide-react";
import type { User } from "@/types";

interface PassportHeaderProps {
  user: User;
  placeCount: number;
  provinceCount: number;
  photoCount: number;
}

const MRZ_LENGTH = 44;

/** Machine-readable-zone lines in the style of a passport data page; purely decorative. */
function mrzLines(username: string, counts: number[]): [string, string] {
  const name = username.toUpperCase().replace(/[^A-Z0-9]/g, "<");
  const first = `P<THA${name}<<DOEN<PA`.padEnd(MRZ_LENGTH, "<").slice(0, MRZ_LENGTH);
  const second = `DP${counts.map((count) => String(count).padStart(4, "0")).join("<")}<<HIKER`.padEnd(MRZ_LENGTH, "<").slice(0, MRZ_LENGTH);
  return [first, second];
}

export function PassportHeader({
  user,
  placeCount,
  provinceCount,
  photoCount,
}: PassportHeaderProps) {
  const counts = [
    { value: placeCount, label: "สถานที่" },
    { value: provinceCount, label: "จังหวัด" },
    { value: photoCount, label: "รูปภาพ" },
  ];
  const [mrzTop, mrzBottom] = mrzLines(user.username, [placeCount, provinceCount, photoCount]);

  return (
    <section className="passport-data-page relative overflow-hidden rounded-3xl p-5 text-white sm:p-7" aria-labelledby="passport-heading">
      <div className="relative grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-6 lg:grid-cols-[auto_1fr_auto] lg:gap-10">
        <div className="relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/25 sm:h-28 sm:w-24">
          {user.avatar ? (
            <Image unoptimized src={photoThumb(user.avatar, 256)} alt={user.name} fill priority sizes="96px" className="object-cover" />
          ) : (
            <UserRound className="h-10 w-10 text-white/70" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-white/60 sm:text-sm">พาสปอร์ตนักเดินป่าของ</p>
          <h1 id="passport-heading" className="mt-0.5 break-words text-2xl font-bold leading-tight sm:text-[1.75rem]">
            {user.name}
          </h1>
          <p className="mt-0.5 text-sm text-white/65">@{user.username}</p>
        </div>
        <dl className="col-span-2 grid grid-cols-3 gap-2 lg:col-span-1 lg:gap-8">
          {counts.map((count) => (
            <div key={count.label} className="rounded-xl bg-white/[0.07] px-3 py-2 ring-1 ring-white/10 lg:bg-transparent lg:p-0 lg:ring-0">
              <dt className="text-xs text-white/60">{count.label}</dt>
              <dd className="font-num text-2xl font-semibold text-lichen sm:text-[1.75rem]">{count.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mrz-line relative mt-6 hidden select-none space-y-0.5 text-[11px] text-white/30 sm:block lg:text-xs" aria-hidden="true">
        <p>{mrzTop}</p>
        <p>{mrzBottom}</p>
      </div>
    </section>
  );
}
