import type { ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import { getPlaceCatalog } from "@/services/place.service";
import { PlaceCatalogProvider } from "./PlaceCatalogProvider";
import { CatalogUnavailable } from "./CatalogUnavailable";

export async function CatalogContent({ children }: {
  children: (catalog: Awaited<ReturnType<typeof getPlaceCatalog>>) => ReactNode;
}) {
  let catalog;
  try {
    catalog = await getPlaceCatalog();
  } catch (error) {
    unstable_rethrow(error);
    return <CatalogUnavailable />;
  }
  // Render outside the catch so redirect()/notFound() keep Next.js semantics.
  return <PlaceCatalogProvider places={catalog.places}>{children(catalog)}</PlaceCatalogProvider>;
}
