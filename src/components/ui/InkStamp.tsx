import { useId } from "react";

interface InkStampProps {
  /** Text set along the upper arc, e.g. the place type. */
  top: string;
  /** Text set along the lower arc, e.g. the province. */
  bottom: string;
  /** Large center line, e.g. the visit date. */
  center: string;
  /** Small line under the center, e.g. the Buddhist-era year. */
  sub?: string;
  /** Any stable string; decides the hand-pressed tilt so it never jumps between renders. */
  seed: string;
  className?: string;
  light?: boolean;
  press?: boolean;
}

const TOP_ARC_LENGTH = 119;
const TOP_FONT_MAX = 10.5;
const TOP_FONT_MIN = 6.5;

function arcFontSize(text: string): number {
  return Math.max(TOP_FONT_MIN, Math.min(TOP_FONT_MAX, TOP_ARC_LENGTH / (text.length * 0.62)));
}

function tiltFor(seed: string): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return (Math.abs(hash) % 24) - 14;
}

/** Decorative passport stamp. Hidden from assistive tech; callers state the visit in text. */
export function InkStamp({ top, bottom, center, sub, seed, className = "", light = false, press = false }: InkStampProps) {
  const id = useId().replace(/:/g, "");
  const tilt = tiltFor(seed);

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={`ink-stamp ${light ? "ink-stamp--light" : ""} ${press ? "ink-stamp--press" : ""} ${className}`}
      style={{ transform: `rotate(${tilt}deg)`, ["--stamp-rotate" as string]: `${tilt}deg` }}
    >
      <defs>
        <path id={`${id}-top`} d="M 22 60 A 38 38 0 0 1 98 60" />
        <path id={`${id}-bottom`} d="M 12 60 A 48 48 0 0 0 108 60" />
        <filter id={`${id}-worn`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.abs(tilt)} result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.65" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-worn)`} fill="currentColor" stroke="currentColor">
        <circle cx="60" cy="60" r="56" fill="none" strokeWidth="3.6" />
        <circle cx="60" cy="60" r="51" fill="none" strokeWidth="1.3" />
        <circle cx="60" cy="60" r="29" fill="none" strokeWidth="1.6" strokeDasharray="2.4 2.4" />
        <text fontSize={arcFontSize(top)} fontWeight="600" stroke="none" letterSpacing="0.2">
          <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">{top}</textPath>
        </text>
        <text fontSize="10" fontWeight="600" stroke="none" letterSpacing="0.3">
          <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">{bottom}</textPath>
        </text>
        <text x="60" y={sub ? 61 : 65} fontSize="14.5" fontWeight="700" stroke="none" textAnchor="middle">{center}</text>
        {sub && <text x="60" y="76" fontSize="10.5" fontWeight="600" stroke="none" textAnchor="middle" letterSpacing="1">{sub}</text>}
        <circle cx="10.5" cy="60" r="1.8" stroke="none" />
        <circle cx="109.5" cy="60" r="1.8" stroke="none" />
      </g>
    </svg>
  );
}
