import type { Place } from "../types";

/** History only: this old place is outside the supplied national-park catalog.
 * Keep saved memories readable without inventing a replacement park or measurements.
 */
export const archivedPlaces: Place[] = [{
  id: "place-doi-chiang-dao",
  name: "ดอยหลวงเชียงดาว",
  location: "อำเภอเชียงดาว",
  province: "เชียงใหม่",
  region: "north",
  description: "",
  type: "mountain",
  isNationalPark: false,
}];
