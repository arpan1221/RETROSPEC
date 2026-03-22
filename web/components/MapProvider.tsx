"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { LocationData, AnyEntity, EpochId } from "@/lib/types";

interface MapState {
  selectedLocation: LocationData | null;
  setSelectedLocation: (loc: LocationData | null) => void;
  selectedEntity: AnyEntity | null;
  setSelectedEntity: (entity: AnyEntity | null) => void;
  activeEpoch: EpochId | null;
  setActiveEpoch: (epoch: EpochId | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  entityViewCount: number;
  incrementEntityViewCount: () => void;
}

const MapContext = createContext<MapState | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<AnyEntity | null>(null);
  const [activeEpoch, setActiveEpoch] = useState<EpochId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entityViewCount, setEntityViewCount] = useState(0);

  const incrementEntityViewCount = useCallback(() => {
    setEntityViewCount((c) => c + 1);
  }, []);

  return (
    <MapContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        selectedEntity,
        setSelectedEntity,
        activeEpoch,
        setActiveEpoch,
        sidebarOpen,
        setSidebarOpen,
        entityViewCount,
        incrementEntityViewCount,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapState(): MapState {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("useMapState must be used within a MapProvider");
  }
  return ctx;
}
