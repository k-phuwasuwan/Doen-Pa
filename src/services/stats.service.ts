import { travelRecordService } from "./travel-record.service";
import { placeService } from "./place.service";
import type { Stats, PlaceType } from "@/types";

export const statsService = {
  calculateStats(userId: string, records = travelRecordService.getRecordsByUser(userId)): Stats {
    const allPlaces = placeService.getAll();
    
    // Get unique places visited
    const placeIds = new Set(allPlaces.map((place) => place.id));
    const validRecords = records.filter((record) => placeIds.has(record.placeId));
    const visitedPlaceIds = new Set(validRecords.map((r) => r.placeId));
    const visitedPlaces = allPlaces.filter((place) => visitedPlaceIds.has(place.id));
    const nationalParks = placeService.getNationalParks();
    
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
    const totalByType: Record<PlaceType, number> = {
      mountain: 0,
      waterfall: 0,
      cave: 0,
      island: 0,
      national_park: 0,
    };

    allPlaces.forEach((place) => {
      totalByType[place.type]++;
    });
    
    visitedPlaces.forEach((place) => {
      byType[place.type]++;
    });
    
    // Count by region with provinces
    const byRegion: Stats["byRegion"] = {
      north: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
      central: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
      south: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
      northeast: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
      east: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
      west: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
    };

    nationalParks.forEach((place) => {
      byRegion[place.region].totalNationalParks++;
      if (visitedPlaceIds.has(place.id)) {
        byRegion[place.region].visitedNationalParks++;
      }
    });
    
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
      totalNationalParks: nationalParks.length,
      visitedNationalParks: nationalParks.filter((place) => visitedPlaceIds.has(place.id)).length,
      totalProvinces: visitedProvinces.size,
      totalPhotos,
      totalRegions: visitedRegions.size,
      byType,
      totalByType,
      byRegion,
    };
  },
};
