"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HikerLoader } from "@/components/ui/HikerLoader";

const MIN_VISIBLE_MS = 500;
// The hiker overlay covers only the first load. Later navigations keep the current page on
// screen and show a slim progress bar, so nothing blanks or flashes between pages.
const FADE_MS = 180;

interface RouteLoadingContextValue {
  begin: () => void;
  end: () => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextValue | null>(null);

function clearTimer(timer: { current: ReturnType<typeof setTimeout> | null }) {
  if (timer.current !== null) clearTimeout(timer.current);
  timer.current = null;
}

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const activeLoads = useRef(1);
  const navigationPending = useRef(false);
  const previousPathname = useRef(pathname);
  const visibleSince = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const begin = useCallback(() => {
    activeLoads.current += 1;
    if (activeLoads.current > 1) return;

    clearTimer(hideTimer);
    if (visibleSince.current !== null) {
      clearTimer(leaveTimer);
      setLeaving(false);
      visibleSince.current = performance.now();
      return;
    }

    visibleSince.current = performance.now();
    setVisible(true);
  }, []);

  const end = useCallback(() => {
    activeLoads.current = Math.max(0, activeLoads.current - 1);
    if (activeLoads.current > 0) return;

    if (visibleSince.current === null) return;

    const elapsed = performance.now() - visibleSince.current;
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setLeaving(true);
      leaveTimer.current = setTimeout(() => {
        leaveTimer.current = null;
        visibleSince.current = null;
        setLeaving(false);
        setVisible(false);
        setFirstLoad(false);
      }, FADE_MS);
    }, Math.max(0, MIN_VISIBLE_MS - elapsed));
  }, []);

  useEffect(() => {
    visibleSince.current = performance.now();
    end();
  }, [end]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (navigationPending.current) {
      navigationPending.current = false;
      end();
    }
  }, [pathname, end]);

  useEffect(() => {
    const handleInternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      if (navigationPending.current) return;

      navigationPending.current = true;
      begin();
    };

    document.addEventListener("click", handleInternalLink, true);
    return () => document.removeEventListener("click", handleInternalLink, true);
  }, [begin]);

  useEffect(() => () => {
    clearTimer(hideTimer);
    clearTimer(leaveTimer);
  }, []);

  const context = useMemo(() => ({ begin, end }), [begin, end]);

  return (
    <RouteLoadingContext.Provider value={context}>
      {children}
      {visible && !firstLoad && (
        <div className="route-progress-bar fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden" role="progressbar" aria-label="กำลังโหลด" data-route-progress>
          <div className="route-progress-bar__fill h-full w-1/3 rounded-full bg-brand-600" />
        </div>
      )}
      {visible && firstLoad && (
        <div className={`route-loading-overlay contour-pattern fixed inset-0 z-30 isolate flex items-center justify-center overflow-hidden bg-canvas px-4${leaving ? " is-leaving" : ""}`} data-route-loading-overlay>
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="ambient-glow-mesh-1 left-[-20rem] top-[-18rem]" />
            <div className="ambient-glow-mesh-2 right-[-18rem] top-[20rem]" />
            <div className="ambient-glow-mesh-3 bottom-[-22rem] left-[30%]" />
          </div>
          <div className="relative z-10">
            <HikerLoader />
          </div>
        </div>
      )}
    </RouteLoadingContext.Provider>
  );
}
