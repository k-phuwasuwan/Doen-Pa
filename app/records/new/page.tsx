import { redirect } from "next/navigation";
import { placeService } from "@/services/place.service";
import { TravelRecordForm } from "@/components/records/TravelRecordForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "เพิ่มบันทึกใหม่ | Doen Pa",
};

interface RecordsNewPageProps {
  searchParams: Promise<{ placeId?: string; returnTo?: string }>;
}

export default async function RecordsNewPage({ searchParams }: RecordsNewPageProps) {
  const { placeId, returnTo } = await searchParams;

  if (!placeId) {
    redirect("/search");
  }

  const place = placeService.getPlaceById(placeId);
  if (!place) {
    redirect("/search");
  }

  const backHref = returnTo === "search" ? "/search" : `/places/${place.id}`;
  const backLabel = returnTo === "search" ? "กลับหน้าค้นหา" : `กลับไปหน้า ${place.name}`;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-forest transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      {/* Centered card */}
      <div className="max-w-xl mx-auto">
        <div className="card-glass p-4 sm:p-6 md:p-8">
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
