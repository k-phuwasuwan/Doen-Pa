import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { photoUrl, type AccountData } from "@/domain/account-data";
import { readAccountRows } from "./read-rows";

interface PhotoRow { id: string; kind: string; travel_record_id: string | null; position: number }
interface RecordRow { id: string; place_id: string; visited_at: string; note: string; rating: number; created_at: string }

export async function loadAccountData(client: SupabaseClient, userId: string, needsProfileSetup = false): Promise<AccountData> {
  const [profileResult, records, photos] = await Promise.all([
    client.from("profiles").select("name,username,bio").eq("user_id", userId).maybeSingle(),
    readAccountRows<RecordRow>(client, "travel_records", "id,place_id,visited_at,note,rating,created_at", userId),
    readAccountRows<PhotoRow>(client, "photos", "id,kind,travel_record_id,position", userId),
  ]);
  if (profileResult.error) throw new Error("โหลดโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่");
  const profile = profileResult.data;
  const profilePhoto = (kind: string) => { const photo = photos.find((p) => p.kind === kind); return photo ? photoUrl(userId, photo.id) : undefined; };
  const recordPhotos = new Map<string, PhotoRow[]>();
  for (const photo of photos) {
    if (photo.kind !== "travel" || !photo.travel_record_id) continue;
    const list = recordPhotos.get(photo.travel_record_id) ?? [];
    list.push(photo); recordPhotos.set(photo.travel_record_id, list);
  }
  return {
    user: { id: userId, name: profile?.name ?? "ผู้ใช้ใหม่", username: profile?.username ?? "new_hiker", bio: profile?.bio ?? "", avatar: profilePhoto("avatar"), coverImage: profilePhoto("cover"), needsProfileSetup },
    records: records.map((r) => ({ id: r.id, userId, placeId: r.place_id, visitedAt: r.visited_at, createdAt: r.created_at, note: r.note, rating: r.rating,
      photos: (recordPhotos.get(r.id) ?? []).sort((a,b) => a.position - b.position).map((p) => photoUrl(userId,p.id)) })),
  };
}
