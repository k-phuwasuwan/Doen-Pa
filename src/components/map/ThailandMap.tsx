"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoJsonObject, Feature } from "geojson";
import { PROVINCE_TH_TO_EN } from "./constants";

// Leaflet CSS
import "leaflet/dist/leaflet.css";

const BRAND_GREEN = "#1b4332";
const BRAND_LIGHT = "#dcf0e2";

interface ThailandMapProps {
  visitedProvinces: string[];
}

export default function ThailandMap({ visitedProvinces }: ThailandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const visitedKey = visitedProvinces.join("|");

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const visitedSet = new Set(
      visitedKey.split("|").filter(Boolean).map((p) => PROVINCE_TH_TO_EN[p] ?? p),
    );

    const map = L.map(mapContainerRef.current, {
      center: [13.0, 101.0],
      zoom: 5.5,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    mapRef.current = map;

    let isMounted = true;

    fetch("/data/thailand.json")
      .then((res) => res.json())
      .then((geojson: GeoJsonObject) => {
        if (!isMounted) return;

        L.geoJSON(geojson, {
          style: (feature?: Feature) => {
            const name = (feature?.properties as { name: string } | undefined)?.name ?? "";
            const visited = visitedSet.has(name);
            return {
              fillColor: visited ? BRAND_GREEN : BRAND_LIGHT,
              fillOpacity: visited ? 0.75 : 0.45,
              color: "rgba(255,255,255,0.6)",
              weight: 1,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = (feature.properties as { name: string }).name;
            const visited = visitedSet.has(name);
            layer.bindTooltip(
              `<span style="font-size:13px;font-weight:600;color:${visited ? BRAND_GREEN : "#0f291e"}">${name}</span>`,
              { sticky: true, opacity: 0.95 },
            );
          },
        }).addTo(map);

        // Fit to Thailand bounds
        const bounds = L.latLngBounds([5.5, 97.5], [20.5, 105.7]);
        map.fitBounds(bounds, { padding: [16, 16] });
      });

    return () => {
      isMounted = false;
      map.remove();
      mapRef.current = null;
    };
  }, [visitedKey]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden"
      aria-label="แผนที่จังหวัดที่เคยไปในประเทศไทย"
    />
  );
}
