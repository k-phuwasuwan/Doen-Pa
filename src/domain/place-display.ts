/** Placeholders belong to the view, never to measurements or searchable data. */
export function displayPlaceValue(value: string | undefined): string {
  return value?.trim() || "-";
}
