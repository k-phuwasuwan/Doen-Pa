export type NavHref = "/search" | "/map" | "/passport" | "/stats" | "/profile";

export function getActiveNavHref(pathname: string, from?: string | null): NavHref {
  if (pathname.startsWith("/places/")) {
    if (from === "passport") return "/passport";
    if (from === "profile") return "/profile";
    return "/search";
  }

  if (pathname.startsWith("/records/")) return "/search";
  if (pathname.startsWith("/map")) return "/map";
  if (pathname.startsWith("/passport")) return "/passport";
  if (pathname.startsWith("/stats")) return "/stats";
  if (pathname.startsWith("/profile")) return "/profile";
  return "/search";
}
