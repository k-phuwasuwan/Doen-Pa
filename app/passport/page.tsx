import { GuestPassport } from "@/components/passport/GuestPassport";
import { PassportContent } from "@/components/passport/PassportContent";

interface PassportPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function PassportPage({ searchParams }: PassportPageProps) {
  const { view } = await searchParams;
  return view === "guest" ? <GuestPassport /> : <PassportContent />;
}
