import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { photoThumb } from "@/domain/account-data";
import type { TravelPhoto } from "@/domain/travel-record-read-model";

interface PostGalleryProps {
  posts: TravelPhoto[];
}

export function PostGallery({ posts }: PostGalleryProps) {
  return (
    <section aria-labelledby="gallery-heading">
      <div className="flex items-baseline justify-between gap-4 px-1">
        <h2 id="gallery-heading" className="text-lg font-bold text-brand-800 sm:text-xl">ภาพจากการเดินทาง</h2>
        <span className="font-num text-sm text-brand-800/60">{posts.length} รูป</span>
      </div>
      {posts.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-5">
          {posts.map((post) => (
            <Link key={`${post.recordId}-${post.photoIndex}`} href={`/places/${post.place.id}?from=profile&photo=${post.photoIndex}`} className="group relative aspect-square overflow-hidden rounded-xl bg-beige-100 sm:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <Image unoptimized src={photoThumb(post.photo, 640)} alt={`ภาพความทรงจำจาก ${post.place.name}`} fill loading="eager" className="object-cover" sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw" />
              <span className="absolute inset-x-0 bottom-0 hidden truncate bg-gradient-to-t from-brand-950/80 to-transparent px-2.5 pb-2 pt-6 text-xs font-medium text-white sm:block">{post.place.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-800/15 bg-white/30 px-6 text-center">
          <Images className="h-8 w-8 text-brand-800/35" aria-hidden="true" />
          <p className="mt-3 font-medium text-brand-800">ยังไม่มีรูปภาพในแกลเลอรี</p>
          <p className="mt-1 text-sm text-brand-800/65">เพิ่มรูปภาพเมื่อบันทึกการเดินทางครั้งถัดไป</p>
        </div>
      )}
    </section>
  );
}
