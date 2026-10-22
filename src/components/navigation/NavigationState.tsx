"use client";

import { Suspense, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getActiveNavHref, type NavHref } from "./activeNav";
import { getPendingNav, getServerPendingNav, setPendingNav, subscribePendingNav } from "./pendingNav";

interface State { activeHref: NavHref; isGuest: boolean }
type RenderNavigation = (state: State) => ReactNode;

/** Retain the last resolved tab and guest preview while URL state suspends. */
export function NavigationState({ children }: { children: RenderNavigation }) {
  const pathname = usePathname();
  const [previous, setPrevious] = useState<State>(() => ({ activeHref: getActiveNavHref(pathname), isGuest: false }));
  const pending = useSyncExternalStore(subscribePendingNav, getPendingNav, getServerPendingNav);
  const withPending = (state: State): State => (pending ? { ...state, activeHref: pending } : state);
  // Any settled route change ends the optimistic selection, including cancelled or redirected navigations.
  useEffect(() => setPendingNav(null), [pathname]);
  return (
    <Suspense fallback={children(withPending(previous))}>
      <ResolvedNavigation pathname={pathname} onChange={setPrevious} pending={pending}>{children}</ResolvedNavigation>
    </Suspense>
  );
}

function ResolvedNavigation({ pathname, onChange, pending, children }: { pathname: string; onChange: (state: State) => void; pending: NavHref | null; children: RenderNavigation }) {
  const params = useSearchParams();
  const activeHref = getActiveNavHref(pathname, params.get("from"));
  const isGuest = params.get("view") === "guest";
  useEffect(() => onChange({ activeHref, isGuest }), [activeHref, isGuest, onChange]);
  return children({ activeHref: pending ?? activeHref, isGuest });
}
