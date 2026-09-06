"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoJsonObject, Feature } from "geojson";
import { PROVINCE_TH_TO_EN } from "./constants";

// Leaflet CSS
import "leaflet/dist/leaflet.css";

const FOREST_GREEN = "#2D5F4F";
const BEIGE = "#D4C5B0";

interface ThailandMapProps {
  visitedProvinces: string[];
}

export default function ThailandMap({ visitedProvinces }: ThailandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const visitedSet = new Set(
    visitedProvinces.map((p) => PROVINCE_TH_TO_EN[p] ?? p),
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.0, 101.0],
      zoom: 5.5,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    mapRef.current = map;

    fetch("/data/thailand.json")
      .then((res) => res.json())
      .then((geojson: GeoJsonObject) => {
        L.geoJSON(geojson, {
          style: (feature?: Feature) => {
            const name = (feature?.properties as { name: string } | undefined)?.name ?? "";
            const visited = visitedSet.has(name);
            return {
              fillColor: visited ? FOREST_GREEN : BEIGE,
              fillOpacity: visited ? 0.75 : 0.45,
              color: "rgba(255,255,255,0.6)",
              weight: 1,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = (feature.properties as { name: string }).name;
            const visited = visitedSet.has(name);
            layer.bindTooltip(
              `<span style="font-size:13px;font-weight:600;color:${visited ? FOREST_GREEN : "#7A8FA3"}">${name}</span>`,
              { sticky: true, opacity: 0.95 },
            );
          },
        }).addTo(map);

        // Fit to Thailand bounds
        const bounds = L.latLngBounds([5.5, 97.5], [20.5, 105.7]);
        map.fitBounds(bounds, { padding: [16, 16] });
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden"
      aria-label="แผนที่จังหวัดที่เคยไปในประเทศไทย"
    />
  );
}

