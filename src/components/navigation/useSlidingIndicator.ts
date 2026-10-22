"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

interface IndicatorBox { left: number; top: number; width: number; height: number }

/** Tracks the active link's box inside a container so one shared pill can slide between tabs. */
export function useSlidingIndicator(activeHref: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<IndicatorBox | null>(null);

  const measure = useCallback(() => {
    const active = containerRef.current?.querySelector<HTMLElement>("[aria-current='page']");
    if (!active || active.offsetWidth === 0) return setBox(null);
    const next = { left: active.offsetLeft, top: active.offsetTop, width: active.offsetWidth, height: active.offsetHeight };
    setBox((prev) => prev && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height ? prev : next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeHref, measure]);

  return { containerRef, box };
}

export function indicatorStyle(box: IndicatorBox | null) {
  return box ? { width: box.width, height: box.height, transform: `translate(${box.left}px, ${box.top}px)`, opacity: 1 } : { opacity: 0 };
}
