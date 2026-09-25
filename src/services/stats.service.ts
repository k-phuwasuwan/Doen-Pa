import { travelRecordService } from "./travel-record.service";
import { placeService } from "./place.service";
import type { Stats, PlaceType, Region } from "@/types";

export const statsService = {
  calculateStats(userId: string, records = travelRecordService.getRecordsByUser(userId)): Stats {
    const allPlaces = placeService.getAll();
    
    // Get unique places visited
    const placeIds = new Set(allPlaces.map((place) => place.id));
    const validRecords = records.filter((record) => placeIds.has(record.placeId));
    const visitedPlaceIds = new Set(validRecords.map((r) => r.placeId));
    const visitedPlaces = allPlaces.filter((place) => visitedPlaceIds.has(place.id));
    
    // Get unique provinces
    const visitedProvinces = new Set(visitedPlaces.map((place) => place.province));
    
    // Get unique regions
    const visitedRegions = new Set(visitedPlaces.map((place) => place.region));
    
    // Count by type
    const byType: Record<PlaceType, number> = {
      mountain: 0,
      waterfall: 0,
      cave: 0,
      island: 0,
      national_park: 0,
    };
    
    visitedPlaces.forEach((place) => {
      byType[place.type]++;
    });
    
    // Count by region with provinces
    const byRegion: Record<Region, { count: number; provinces: string[] }> = {
      north: { count: 0, provinces: [] },
      central: { count: 0, provinces: [] },
      south: { count: 0, provinces: [] },
      northeast: { count: 0, provinces: [] },
      east: { count: 0, provinces: [] },
      west: { count: 0, provinces: [] },
    };
    
    visitedPlaces.forEach((place) => {
      const regionData = byRegion[place.region];
      regionData.count++;
      if (!regionData.provinces.includes(place.province)) {
        regionData.provinces.push(place.province);
      }
    });
    
    // Count total photos
    const totalPhotos = validRecords.reduce((sum, record) => sum + record.photos.length, 0);
    
    return {
      totalPlaces: visitedPlaces.length,
      totalProvinces: visitedProvinces.size,
      totalPhotos,
      totalRegions: visitedRegions.size,
      byType,
      byRegion,
    };
  },
};
