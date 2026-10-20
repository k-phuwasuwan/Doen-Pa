/** Two old cards represented the same park. Resolve them without duplicate progress. */
export function resolvePlaceId(id: string): string {
  return id === "place-khao-sam-rok" ? "place-khao-sam-roi-yod" : id;
}
