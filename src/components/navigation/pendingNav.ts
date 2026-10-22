import type { MouseEvent } from "react";
import type { NavHref } from "./activeNav";

/** Tab chosen by a click whose route has not rendered yet; lets the nav indicator move immediately. */
let pending: NavHref | null = null;
const listeners = new Set<() => void>();

export function setPendingNav(href: NavHref | null) {
  if (pending === href) return;
  pending = href;
  listeners.forEach((listener) => listener());
}

export function subscribePendingNav(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export const getPendingNav = () => pending;
export const getServerPendingNav = (): NavHref | null => null;

export function handleNavClick(event: MouseEvent<HTMLAnchorElement>, href: NavHref) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  setPendingNav(href);
}
