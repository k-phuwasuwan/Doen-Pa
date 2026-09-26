"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HikerLoader } from "@/components/ui/HikerLoader";

const MIN_VISIBLE_MS = 500;

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
  const [visible, setVisible] = useState(false);
  const activeLoads = useRef(0);
  const navigationPending = useRef(false);
  const previousPathname = useRef(pathname);
  const visibleSince = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const begin = useCallback(() => {
    activeLoads.current += 1;
    if (activeLoads.current > 1) return;

    clearTimer(hideTimer);
    if (visibleSince.current !== null) {
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
      visibleSince.current = null;
      setVisible(false);
    }, Math.max(0, MIN_VISIBLE_MS - elapsed));
  }, []);

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
  }, []);

  const context = useMemo(() => ({ begin, end }), [begin, end]);

  return (
    <RouteLoadingContext.Provider value={context}>
      {children}
      {visible && (
        <div className="contour-pattern fixed inset-0 z-30 flex items-center justify-center bg-canvas px-4" data-route-loading-overlay>
          <HikerLoader />
        </div>
      )}
    </RouteLoadingContext.Provider>
  );
}

export function RouteLoadingSignal() {
  const context = useContext(RouteLoadingContext);

  useEffect(() => {
    context?.begin();
    return () => context?.end();
  }, [context]);

  return null;
}
