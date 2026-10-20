const allowedPaths = new Set(["/search", "/map", "/passport", "/stats", "/profile", "/profile/edit", "/records/new", "/reset-password"]);

/** Only app-owned destinations; never redirect credentials to an arbitrary URL. */
export function safeAuthNext(value: unknown, fallback = "/passport"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://doen-pa.invalid");
    if (url.origin !== "https://doen-pa.invalid" || !allowedPaths.has(url.pathname)) return fallback;
    if (url.pathname === "/records/new") {
      const placeId = url.searchParams.get("placeId");
      if (!placeId) return fallback;
      const params = new URLSearchParams({ placeId });
      if (url.searchParams.get("returnTo") === "search") params.set("returnTo", "search");
      return `/records/new?${params}`;
    }
    return url.pathname;
  } catch {
    return fallback;
  }
}

export function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(safeAuthNext(next))}`;
}

export function authBackHref(from: string | undefined) {
  return from && ["search", "map", "passport", "stats", "profile"].includes(from) ? `/${from}` : "/passport";
}
