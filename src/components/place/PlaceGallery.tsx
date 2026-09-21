import Image from "next/image";

interface PlaceGalleryProps {
  /** User's own uploaded photos from TravelRecord. Empty = no record or no uploads. */
  recordPhotos: string[];
}

export function PlaceGallery({ recordPhotos }: PlaceGalleryProps) {
  const hasPhotos = recordPhotos.length > 0;
  const mainPhoto = hasPhotos ? recordPhotos[0] : null;

  // Show thumbnail row only when user has uploaded > 1 photo
  const thumbnailPhotos = hasPhotos ? recordPhotos.slice(1, 3) : [];
  const overflowCount = hasPhotos ? recordPhotos.length - 3 : 0; // photos beyond first 3
  const showOverflowCard = overflowCount > 0;
  const showThumbnailRow = thumbnailPhotos.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Main image — gray placeholder until user uploads */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-glass-md group">
        {mainPhoto ? (
          <Image
            src={mainPhoto}
            alt="ภาพจากการเดินทางของคุณ"
            fill
            priority
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-beige-100 flex items-center justify-center">
            {/* Plain placeholder — real photos come from user uploads */}
          </div>
        )}
        {/* Inner specular rim */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>

      {/* Thumbnail row — only when user has uploaded multiple photos */}
      {showThumbnailRow && (
        <div className="grid grid-cols-3 gap-3.5">
          {thumbnailPhotos.map((photo, idx) => (
            <div
              key={`${photo}-${idx}`}
              className="aspect-square rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glass-md"
            >
              <div className="relative w-full h-full">
                <Image
                  src={photo}
                  alt={`ภาพความทรงจำที่ ${idx + 2}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              </div>
            </div>
          ))}

          {showOverflowCard && (
            <div className="aspect-square rounded-2xl liquid-glass flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glass-md">
              <span className="text-2xl font-bold text-brand-700 leading-none">
                +{overflowCount}
              </span>
              <span className="text-xs text-slate mt-1">ภาพถ่าย</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
