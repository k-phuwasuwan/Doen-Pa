import Image from "next/image";

interface PlaceGalleryProps {
  defaultImage: string;
  recordPhotos: string[];
}

export function PlaceGallery({ defaultImage, recordPhotos }: PlaceGalleryProps) {
  const hasPhotos = recordPhotos.length > 0;
  const mainImage = hasPhotos ? recordPhotos[0] : defaultImage;
  const hasOverflow = recordPhotos.length > 4;
  const remainingPhotoCount = recordPhotos.length - 3;
  const thumbnails = hasOverflow ? recordPhotos.slice(1, 3) : recordPhotos.slice(1);

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
        {mainImage ? (
          <Image
            src={mainImage}
            alt="ภาพสถานที่"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-beige/30 text-sm text-slate">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>

      {hasPhotos && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {thumbnails.map((photo, index) => (
            <div key={`${photo}-${index}`} className="relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={photo}
                alt={`ภาพความทรงจำที่ ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
            </div>
          ))}

          {hasOverflow && (
            <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-beige/40">
              <span className="text-2xl font-bold text-forest">+{remainingPhotoCount}</span>
              <span className="mt-1 text-sm text-slate">ภาพถ่าย</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
