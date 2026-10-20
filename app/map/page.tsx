import { MapOverview } from "@/components/map/MapOverview";
import { CatalogContent } from "@/components/place/CatalogContent";

export const metadata = {
  title: "แผนที่ | Doen Pa",
};

export default function MapPage() {
  return <CatalogContent>{() => <MapOverview />}</CatalogContent>;
}
