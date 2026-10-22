import { MapOverview } from "@/components/map/MapOverview";
import { CatalogContent } from "@/components/place/CatalogContent";

export default function MapPage() {
  return <CatalogContent>{() => <MapOverview />}</CatalogContent>;
}
