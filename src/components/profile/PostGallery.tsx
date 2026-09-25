import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import type { Place } from "@/types";

interface GalleryPost {
  photo: string;
  place: Place;
  recordId: string;
}

interface PostGalleryProps {
  posts: GalleryPost[];
}

export function PostGallery({ posts }: PostGalleryProps) {
  return (
    <section className="liquid-glass-card p-5 sm:p-6" aria-labelledby="gallery-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="gallery-heading" className="text-xl font-bold text-brand-800">Post Gallery</h2>
          <p className="mt-1 text-sm text-brand-800/65">รูปภาพจากการเดินทางของคุณ</p>
        </div>
        <span className="text-sm text-brand-800/65">{posts.length} รูป</span>
      </div>
      {posts.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <Link key={`${post.recordId}-${post.photo}`} href={`/places/${post.place.id}?from=profile`} className="group relative aspect-square overflow-hidden rounded-xl bg-beige-100/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <Image src={post.photo} alt={`ภาพความทรงจำจาก ${post.place.name}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
              <span className="absolute inset-x-0 bottom-0 truncate bg-brand-600/75 px-3 py-2 text-xs font-medium text-white sm:opacity-0 sm:transition sm:group-hover:opacity-100">{post.place.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <Images className="h-10 w-10 text-brand-800/30" aria-hidden="true" />
          <p className="mt-3 font-medium text-brand-800">ยังไม่มีรูปภาพในแกลเลอรี</p>
          <p className="mt-1 text-sm text-brand-800/65">เพิ่มรูปภาพเมื่อบันทึกการเดินทางครั้งถัดไป</p>
        </div>
      )}
    </section>
  );
}
