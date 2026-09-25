"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";

export const CATEGORY_SCROLL_KEY = "doen-pa-scroll-to-places";

interface CategoryFilterLinkProps {
  href: string;
  className: string;
  children: ReactNode;
}

export function CategoryFilterLink({ href, className, children }: CategoryFilterLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const destination = new URL(href, window.location.href);
    if (destination.pathname === window.location.pathname && destination.search === window.location.search) {
      document.getElementById("search-place-list")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
      return;
    }

    sessionStorage.setItem(CATEGORY_SCROLL_KEY, "true");
  }

  return <Link href={href} scroll={false} onClick={handleClick} className={className}>{children}</Link>;
}
