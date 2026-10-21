"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getActiveNavHref, type NavHref } from "./activeNav";

interface State { activeHref: NavHref; isGuest: boolean }
type RenderNavigation = (state: State) => ReactNode;

/** Retain the last resolved tab and guest preview while URL state suspends. */
export function NavigationState({ children }: { children: RenderNavigation }) {
  const pathname = usePathname();
  const [previous, setPrevious] = useState<State>(() => ({ activeHref: getActiveNavHref(pathname), isGuest: false }));
  return (
    <Suspense fallback={children(previous)}>
      <ResolvedNavigation pathname={pathname} onChange={setPrevious}>{children}</ResolvedNavigation>
    </Suspense>
  );
}

function ResolvedNavigation({ pathname, onChange, children }: { pathname: string; onChange: (state: State) => void; children: RenderNavigation }) {
  const params = useSearchParams();
  const activeHref = getActiveNavHref(pathname, params.get("from"));
  const isGuest = params.get("view") === "guest";
  useEffect(() => onChange({ activeHref, isGuest }), [activeHref, isGuest, onChange]);
  return children({ activeHref, isGuest });
}
