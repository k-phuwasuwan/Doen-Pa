export type PlaceType =
  | "mountain"
  | "waterfall"
  | "cave"
  | "island";
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
  /** Onboarding preference only; never grants access to personal data. */
  needsProfileSetup?: boolean;
}

/** Freely licensed park photo; attribution must be shown wherever it is displayed. */
export interface PlaceImage {
  /** File name under `public/images/parks/640/` and `public/images/parks/1280/`. */
  path: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}

export interface Place {
  id: string;
  name: string;
  location: string;
  province: string;
  region: Region;
  description: string;
  type: PlaceType;
  /** Counts toward national park progress even when displayed under another place type. */
  isNationalPark?: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  distance?: string;
  image?: PlaceImage;
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
  totalNationalParks: number;
  visitedNationalParks: number;
  totalProvinces: number;
  totalPhotos: number;
  totalRegions: number;
  byType: Record<PlaceType, number>;
  totalByType: Record<PlaceType, number>;
  byRegion: Record<Region, { count: number; provinces: string[]; totalNationalParks: number; visitedNationalParks: number }>;
}
