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
        {/* Main layout: sidebar + map side by side */}
        <div className="flex h-[75vh] md:h-[85vh]">
          {/* Sidebar — desktop only, fixed width */}
          <Sidebar epochs={epochs} entities={entities} />

          {/* Map fills remaining space */}
          <div className="relative flex-1 flex flex-col">
            <div className="flex-1">
              <Map locations={locations} />
            </div>
            <EpochTimeline />
          </div>
        </div>

        {/* Overlay panels — positioned absolutely on top */}
        <CityPanel entities={entities} />
        <EntityDetail allEntities={entities} />
        <ContributeCTA />
      </section>
    </MapProvider>
  );
}
