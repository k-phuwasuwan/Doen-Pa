import { redirect } from "next/navigation";
import { placeService } from "@/services/place.service";
import { TravelRecordForm } from "@/components/records/TravelRecordForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "เพิ่มบันทึกใหม่ | Doen Pa",
};

interface RecordsNewPageProps {
  searchParams: Promise<{ placeId?: string }>;
}

export default async function RecordsNewPage({ searchParams }: RecordsNewPageProps) {
  const { placeId } = await searchParams;

  if (!placeId) {
    redirect("/search");
  }

  const place = placeService.getPlaceById(placeId);
  if (!place) {
    redirect("/search");
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href={`/places/${place.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-forest transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปหน้า {place.name}
      </Link>

      {/* Centered card */}
      <div className="max-w-xl mx-auto">
        <div className="card-glass p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-forest">บันทึกการเดินทาง</h1>
            <p className="text-slate text-sm mt-1">
              บันทึกความทรงจำและรูปภาพของทริปนี้ลงแพสพอร์ต
            </p>
          </div>

          <TravelRecordForm place={place} />
        </div>
      </div>
    </div>
  );
}
