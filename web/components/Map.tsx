"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MapGL, { NavigationControl, MapRef } from "react-map-gl";
import type { MapLayerMouseEvent, GeoJSONSource } from "mapbox-gl";
import type { Point } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocationData, EpochId } from "@/lib/types";
import { useMapState } from "./MapProvider";
import MapClusters, { INTERACTIVE_LAYER_IDS } from "./MapClusters";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const INITIAL_VIEW = {
  latitude: 30,
  longitude: -20,
  zoom: 2,
};

interface MapProps {
  locations: LocationData[];
}

function computeEpochCenter(
  locations: LocationData[],
  epoch: EpochId
): { lat: number; lng: number } | null {
  const matching = locations.filter((l) => l.epoch_range.includes(epoch));
  if (matching.length === 0) return null;
  let totalLat = 0;
  let totalLng = 0;
  let totalWeight = 0;
  for (const loc of matching) {
    const w = loc.significance_sum || 1;
    totalLat += loc.lat * w;
    totalLng += loc.lng * w;
    totalWeight += w;
  }
  return { lat: totalLat / totalWeight, lng: totalLng / totalWeight };
}

export default function Map({ locations }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const { activeEpoch, setSelectedLocation } = useMapState();

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!e.features?.length || !mapRef.current) return;
      const feature = e.features[0];
      const layerId = feature.layer?.id;

      if (layerId === "clusters") {
        const clusterId = feature.properties?.cluster_id;
        const source = mapRef.current.getSource("retrospec-locations") as GeoJSONSource;
        if (!source) return;
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err || zoom == null) return;
          const coords = (feature.geometry as Point).coordinates;
          mapRef.current?.flyTo({
            center: [coords[0], coords[1]],
            zoom,
            duration: 500,
          });
        });
      } else if (layerId === "unclustered-point") {
        const locId = feature.properties?.id;
        if (!locId) return;
        const loc = locations.find((l) => l.id === locId);
        if (loc) setSelectedLocation(loc);
      }
    },
    [locations, setSelectedLocation]
  );

  const handleMouseEnter = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  // Fly to epoch center of gravity when epoch filter changes
  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    if (!activeEpoch) {
      mapRef.current.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        duration: 1200,
      });
      return;
    }
    const center = computeEpochCenter(locations, activeEpoch);
    if (!center) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: 3.5,
      duration: 1200,
    });
  }, [activeEpoch, locations, loaded]);

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh]">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0f]">
          <p className="text-sm text-[#e2e8f0]/50 tracking-wide">
            Loading map...
          </p>
        </div>
      )}
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={handleLoad}
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={INTERACTIVE_LAYER_IDS}
        reuseMaps
      >
        <NavigationControl position="top-right" showCompass={false} />
        {loaded && <MapClusters locations={locations} />}
      </MapGL>
    </div>
  );
}
