"use client";

import { LocationData, AnyEntity, Epoch } from "@/lib/types";
import { MapProvider } from "./MapProvider";
import Map from "./Map";
import EpochTimeline from "./EpochTimeline";

interface MapExplorerProps {
  locations: LocationData[];
  epochs: Epoch[];
  entities?: AnyEntity[];
}

export default function MapExplorer({ locations, epochs, entities }: MapExplorerProps) {
  return (
    <MapProvider>
      <section className="relative w-full bg-[#0a0a0f]">
        <Map locations={locations} />
        <EpochTimeline />
      </section>
    </MapProvider>
  );
}
