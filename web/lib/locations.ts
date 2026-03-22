import locationsData from '@/data/locations.json';
import type { LocationData, EpochId } from './types';

export function getAllLocations(): LocationData[] {
  return (locationsData as any).locations as LocationData[];
}

export function getLocationById(id: string): LocationData | null {
  return getAllLocations().find((loc) => loc.id === id) ?? null;
}

export function filterLocationsByEpoch(epoch: EpochId): LocationData[] {
  return getAllLocations().filter((loc) =>
    loc.epoch_range.includes(epoch)
  );
}

export function toGeoJSON(locations: LocationData[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: locations.map((loc) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [loc.lng, loc.lat],
      },
      properties: {
        id: loc.id,
        name: loc.name,
        significance_sum: loc.significance_sum,
        entity_count: loc.entities.length,
        epoch_range: loc.epoch_range,
        entities: loc.entities,
        events: loc.events,
      },
    })),
  };
}
