import { GuestPassport } from "@/components/passport/GuestPassport";
import { PassportContent } from "@/components/passport/PassportContent";
import { CatalogContent } from "@/components/place/CatalogContent";
import { getAuthUser } from "@/lib/auth/server";

interface PassportPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function PassportPage({ searchParams }: PassportPageProps) {
  const { view } = await searchParams;
  const user = await getAuthUser();
  return !user || view === "guest" ? <GuestPassport /> : <CatalogContent>{() => <PassportContent />}</CatalogContent>;
}
