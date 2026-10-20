import { GuestPassport } from "@/components/passport/GuestPassport";
import { PassportContent } from "@/components/passport/PassportContent";
import { CatalogContent } from "@/components/place/CatalogContent";

export const metadata = {
  title: "พาสปอร์ต | Doen Pa",
};

interface PassportPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function PassportPage({ searchParams }: PassportPageProps) {
  const { view } = await searchParams;
  return view === "guest" ? <GuestPassport /> : <CatalogContent>{() => <PassportContent />}</CatalogContent>;
}
