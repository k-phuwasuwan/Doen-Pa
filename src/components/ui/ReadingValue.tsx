import { displayPlaceValue } from "@/domain/place-display";

/** A measurement such as "1024 m" or "3 กม.": the figure is emphasized, its unit stays regular weight. */
export function ReadingValue({ value }: { value: string | undefined }) {
  const text = displayPlaceValue(value);
  const match = /^(\S+)\s+(.+)$/.exec(text);
  if (!match) return <>{text}</>;

  return (
    <>
      {match[1]} <span className="font-normal">{match[2]}</span>
    </>
  );
}
