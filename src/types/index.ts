export type PlaceType =
  | "mountain"
  | "waterfall"
  | "cave"
  | "island"
  | "national_park";
export type Region =
  | "north"
  | "central"
  | "south"
  | "northeast"
  | "east"
  | "west";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
}

export interface Place {
  id: string;
  name: string;
  location: string;
  province: string;
  region: Region;
  description: string;
  type: PlaceType;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  distance?: string;
  /** Static copy for now — TODO: replace with real data */
  bestSeason?: string;
  /** Static copy for now — TODO: replace with real data */
  campingInfo?: string;
}

export interface TravelRecord {
  id: string;
  userId: string;
  placeId: string;
  visitedAt: Date;
  note: string;
  photos: string[];
  rating: number;
  createdAt: Date;
}

export interface Stats {
  totalPlaces: number;
  totalProvinces: number;
  totalPhotos: number;
  totalRegions: number;
  byType: Record<PlaceType, number>;
  byRegion: Record<Region, { count: number; provinces: string[] }>;
}
