"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MapGL, { NavigationControl, MapRef } from "react-map-gl";
import type { MapLayerMouseEvent, GeoJSONSource } from "mapbox-gl";
import type { Point } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocationData, EpochId } from "@/lib/types";
import { useMapState } from "./MapProvider";
import MapClusters, { INTERACTIVE_LAYER_IDS } from "./MapClusters";
import FlyoverOverlay from "./FlyoverOverlay";
import { FLYOVER_STOPS, FlyoverStop, getTotalDuration } from "@/lib/flyover";

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

  // Flyover state
  const [flyoverActive, setFlyoverActive] = useState(false);
  const [flyoverStop, setFlyoverStop] = useState<FlyoverStop | null>(null);
  const [flyoverProgress, setFlyoverProgress] = useState(0);
  const flyoverAbort = useRef(false);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (flyoverActive) return;
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
    [locations, setSelectedLocation, flyoverActive]
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

  // Fly to epoch center when filter changes
  useEffect(() => {
    if (!mapRef.current || !loaded || flyoverActive) return;
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
  }, [activeEpoch, locations, loaded, flyoverActive]);

  // Run flyover sequence
  const startFlyover = useCallback(async () => {
    if (!mapRef.current || !loaded) return;
    flyoverAbort.current = false;
    setFlyoverActive(true);
    setFlyoverProgress(0);

    const totalDuration = getTotalDuration();
    let elapsed = 0;

    for (let i = 0; i < FLYOVER_STOPS.length; i++) {
      if (flyoverAbort.current) break;

      const stop = FLYOVER_STOPS[i];
      setFlyoverStop(stop);

      mapRef.current.flyTo({
        center: [stop.lng, stop.lat],
        zoom: stop.zoom,
        bearing: stop.bearing ?? 0,
        pitch: stop.pitch ?? 0,
        duration: stop.duration,
        essential: true,
      });

      // Wait for fly animation
      await new Promise<void>((resolve) => {
        let waited = 0;
        const interval = setInterval(() => {
          waited += 100;
          elapsed += 100;
          setFlyoverProgress(Math.min(elapsed / totalDuration, 1));
          if (waited >= stop.duration || flyoverAbort.current) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      if (flyoverAbort.current) break;

      // Pause at stop
      await new Promise<void>((resolve) => {
        let waited = 0;
        const interval = setInterval(() => {
          waited += 100;
          elapsed += 100;
          setFlyoverProgress(Math.min(elapsed / totalDuration, 1));
          if (waited >= stop.pause || flyoverAbort.current) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    setFlyoverActive(false);
    setFlyoverStop(null);
    setFlyoverProgress(0);

    if (mapRef.current && !flyoverAbort.current) {
      mapRef.current.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        bearing: 0,
        pitch: 0,
        duration: 2000,
      });
    }
  }, [loaded]);

  const stopFlyover = useCallback(() => {
    flyoverAbort.current = true;
    setFlyoverActive(false);
    setFlyoverStop(null);
    setFlyoverProgress(0);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        bearing: 0,
        pitch: 0,
        duration: 1500,
      });
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0f]">
          <p className="text-sm text-[#e2e8f0]/50 tracking-wide">
            Loading map...
          </p>
        </div>
      )}

      {/* Watch the Story button */}
      {loaded && !flyoverActive && (
        <button
          onClick={startFlyover}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--amber)]/30 text-[var(--amber)] text-sm hover:bg-[var(--amber)]/10 transition-colors shadow-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch the Story
        </button>
      )}

      {/* Flyover cinematic overlay */}
      <FlyoverOverlay
        active={flyoverActive}
        currentStop={flyoverStop}
        progress={flyoverProgress}
        onStop={stopFlyover}
      />

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
