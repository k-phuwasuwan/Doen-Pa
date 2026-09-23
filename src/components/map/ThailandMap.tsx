"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import type { Place } from "@/types";
import "leaflet/dist/leaflet.css";

const THAILAND_BOUNDS: L.LatLngBoundsExpression = [[5.5, 97.5], [20.5, 105.7]];

interface ThailandMapProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string | null) => void;
}

function pinIcon(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: "visited-map-pin-wrapper",
    html: `<span class="visited-map-pin${selected ? " visited-map-pin--selected" : ""}"><span class="visited-map-pin__center"></span></span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 42],
  });
}

export default function ThailandMap({ places, selectedPlaceId, onSelectPlace }: ThailandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectPlace);

  useEffect(() => {
    onSelectRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [13, 101],
      zoom: 6,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    });
    mapRef.current = map;
    map.fitBounds(THAILAND_BOUNDS, { padding: [24, 24] });

    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 17,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM · © <a href="https://opentopomap.org/">OpenTopoMap</a> (CC-BY-SA)',
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    map.on("click", () => onSelectRef.current(null));

    const controller = new AbortController();
    fetch("/data/thailand.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Province boundaries unavailable");
        return response.json() as Promise<GeoJsonObject>;
      })
      .then((geojson) => {
        if (controller.signal.aborted) return;
        L.geoJSON(geojson, {
          interactive: false,
          style: { fillOpacity: 0, color: "#345344", opacity: 0.45, weight: 1 },
        }).addTo(map);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error("Failed to load province boundaries:", error);
      });

    return () => {
      controller.abort();
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = markersRef.current;
    if (!layer) return;

    layer.clearLayers();
    for (const place of places) {
      if (place.latitude === undefined || place.longitude === undefined) continue;
      L.marker([place.latitude, place.longitude], {
        icon: pinIcon(place.id === selectedPlaceId),
        title: place.name,
        alt: `สถานที่ที่เคยไป ${place.name}`,
        keyboard: true,
        riseOnHover: true,
      })
        .on("click", (event: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(event);
          onSelectRef.current(place.id);
        })
        .addTo(layer);
    }
  }, [places, selectedPlaceId]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-brand-100"
      role="application"
      aria-label="แผนที่ภูมิประเทศประเทศไทย แสดงหมุดสถานที่ที่เคยไป"
    />
  );
}
