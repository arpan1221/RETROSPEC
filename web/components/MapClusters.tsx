"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl";
import type { FeatureCollection, Point } from "geojson";
import { LocationData } from "@/lib/types";
import { useMapState } from "./MapProvider";

interface MapClustersProps {
  locations: LocationData[];
}

export default function MapClusters({ locations }: MapClustersProps) {
  const { activeEpoch } = useMapState();

  const geojson: FeatureCollection<Point> = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: locations.map((loc) => ({
        type: "Feature" as const,
        id: loc.id,
        properties: {
          id: loc.id,
          name: loc.name,
          significance_sum: loc.significance_sum,
          entity_count: loc.entities.length + loc.events.length,
          epoch_range: JSON.stringify(loc.epoch_range),
          matches_epoch: activeEpoch
            ? loc.epoch_range.includes(activeEpoch)
              ? 1
              : 0
            : 1,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [loc.lng, loc.lat],
        },
      })),
    };
  }, [locations, activeEpoch]);

  return (
    <Source
      id="retrospec-locations"
      type="geojson"
      data={geojson}
      cluster
      clusterRadius={50}
      clusterMaxZoom={14}
    >
      {/* Cluster circles */}
      <Layer
        id="clusters"
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-color": "#0a0a0f",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            5,
            24,
            10,
            30,
            20,
            36,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f59e0b",
          "circle-opacity": 0.95,
        }}
      />

      {/* Cluster count labels */}
      <Layer
        id="cluster-count"
        type="symbol"
        filter={["has", "point_count"]}
        layout={{
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 13,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#f59e0b",
        }}
      />

      {/* Unclustered pins */}
      <Layer
        id="unclustered-point"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-color": "#f59e0b",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "significance_sum"],
            0,
            5,
            10,
            7,
            20,
            10,
            35,
            14,
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#fbbf24",
          "circle-opacity": [
            "case",
            ["==", ["get", "matches_epoch"], 0],
            0.15,
            1.0,
          ],
          "circle-stroke-opacity": [
            "case",
            ["==", ["get", "matches_epoch"], 0],
            0.15,
            1.0,
          ],
        }}
      />

      {/* Glow ring for high-significance pins */}
      <Layer
        id="unclustered-glow"
        type="circle"
        filter={[
          "all",
          ["!", ["has", "point_count"]],
          [">", ["get", "significance_sum"], 20],
          ["==", ["get", "matches_epoch"], 1],
        ]}
        paint={{
          "circle-color": "transparent",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "significance_sum"],
            20,
            16,
            35,
            22,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f59e0b",
          "circle-opacity": 0.4,
          "circle-stroke-opacity": 0.4,
        }}
      />

      {/* City name labels */}
      <Layer
        id="unclustered-label"
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "text-field": [
            "concat",
            ["get", "name"],
            " \u00b7 ",
            ["to-string", ["get", "entity_count"]],
            " entries",
          ],
          "text-size": 11,
          "text-offset": [0, 1.6],
          "text-anchor": "top",
          "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
          "text-optional": true,
        }}
        paint={{
          "text-color": "#e2e8f0",
          "text-halo-color": "#0a0a0f",
          "text-halo-width": 1,
          "text-opacity": [
            "case",
            ["==", ["get", "matches_epoch"], 0],
            0.15,
            0.85,
          ],
        }}
      />
    </Source>
  );
}

// Export interactive layer IDs for the Map component to use
export const INTERACTIVE_LAYER_IDS = ["clusters", "unclustered-point"];
