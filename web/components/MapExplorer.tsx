"use client";

import { LocationData, AnyEntity, Epoch } from "@/lib/types";
import { MapProvider } from "./MapProvider";
import Map from "./Map";
import EpochTimeline from "./EpochTimeline";
import CityPanel from "./CityPanel";
import EntityDetail from "./EntityDetail";
import Sidebar from "./Sidebar";
import ContributeCTA from "./ContributeCTA";

interface MapExplorerProps {
  locations: LocationData[];
  epochs: Epoch[];
  entities?: AnyEntity[];
}

export default function MapExplorer({
  locations,
  epochs,
  entities = [],
}: MapExplorerProps) {
  return (
    <MapProvider>
      <section id="map" className="relative w-full bg-[#0a0a0f]">
        {/* Sidebar */}
        <Sidebar epochs={epochs} entities={entities} />

        {/* Map + Timeline */}
        <Map locations={locations} />
        <EpochTimeline />

        {/* Panels that appear on interaction */}
        <CityPanel entities={entities} />
        <EntityDetail allEntities={entities} />
        <ContributeCTA />
      </section>
    </MapProvider>
  );
}
