import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { createRouteClient } from "@/lib/supabase/route";
import { PHOTO_WIDTHS } from "@/domain/account-data";

/** Session-checked image delivery: no bearer links remain usable after logout. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, finish } = createRouteClient(request);
  const missing = () => finish(new NextResponse(null, { status: 404 }));
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || request.nextUrl.searchParams.get("owner") !== user.id) return missing();
  const { id } = await params;
  const { data: photo, error } = await supabase.from("photos").select("object_path,mime_type,kind").eq("user_id", user.id).eq("id", id).maybeSingle();
  if (error) return finish(new NextResponse(null, { status: 503 }));
  if (!photo) return missing();
  const { data: file, error: downloadError } = await supabase.storage.from(photo.kind === "travel" ? "travel-photos" : "profile-photos").download(photo.object_path);
  if (downloadError || !file) return missing();
  const width = Number(request.nextUrl.searchParams.get("w"));
  if (PHOTO_WIDTHS.includes(width)) {
    // Smaller, auto-oriented WebP for grids and headers; metadata is not carried over.
    try {
      const resized = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "none" }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      return finish(new NextResponse(new Uint8Array(resized), { headers: { "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } }));
    } catch {
      // Fall back to the original bytes below.
    }
  }
  return finish(new NextResponse(file, { headers: { "Content-Type": photo.mime_type, "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } }));
}
