"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import type { Place } from "@/types";
import "leaflet/dist/leaflet.css";

const THAILAND_BOUNDS: L.LatLngBoundsExpression = [[5.5, 97.5], [20.5, 105.7]];
const COUNTRY_LABELS = [
  { name: "เมียนมา", position: [17.1, 97.1] },
  { name: "ลาว", position: [18.1, 103.1] },
  { name: "กัมพูชา", position: [12.6, 104.6] },
  { name: "เวียดนาม", position: [16.4, 107.2] },
  { name: "มาเลเซีย", position: [6.1, 101.1] },
] as const;
const STADIA_API_KEY = process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY;
const TERRAIN_URL =
  "https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}.png" +
  (STADIA_API_KEY ? `?api_key=${encodeURIComponent(STADIA_API_KEY)}` : "");

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
      zoomSnap: 0.25,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    });
    mapRef.current = map;
    map.fitBounds(THAILAND_BOUNDS, { padding: [24, 24] });

    L.tileLayer(TERRAIN_URL, {
      maxZoom: 18,
      attribution:
        '© <a href="https://stadiamaps.com/">Stadia Maps</a> · © <a href="https://stamen.com/">Stamen Design</a> · © <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    for (const country of COUNTRY_LABELS) {
      L.marker([...country.position], {
        icon: L.divIcon({
          className: "map-country-label",
          html: country.name,
          iconSize: [96, 28],
          iconAnchor: [48, 14],
        }),
        interactive: false,
        keyboard: false,
        pane: "shadowPane",
      }).addTo(map);
    }
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
          style: { fillColor: "#dcf0e2", fillOpacity: 0.14, color: "#2d6a4f", opacity: 0.38, weight: 1 },
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
    const map = mapRef.current;
    if (!map) return;
    const coordinates = places.flatMap((place): L.LatLngTuple[] =>
      place.latitude === undefined || place.longitude === undefined
        ? []
        : [[place.latitude, place.longitude]],
    );
    if (coordinates.length === 0) {
      map.fitBounds(THAILAND_BOUNDS, { padding: [24, 24] });
      return;
    }
    map.fitBounds(L.latLngBounds(coordinates), {
      paddingTopLeft: [48, 144],
      paddingBottomRight: [48, 112],
      maxZoom: 6,
    });
  }, [places]);

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
