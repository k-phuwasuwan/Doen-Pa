import { createClient } from "@/lib/supabase/client";
import { decodeAccountData, photoUrl, type AccountData } from "@/domain/account-data";
import type { TravelRecord, User } from "@/types";
import { PROFILE_IMAGE_POLICY, RECORD_IMAGE_POLICY, RECORD_PHOTO_LIMIT } from "@/lib/images/image-import";

export const ACCOUNT_CHANGED_KEY = "doen-pa-cloud-account-changed-v1";
interface UploadedPhoto { id: string; kind: "travel" | "avatar" | "cover"; object_path: string; mime_type: string; size_bytes: number }
const bucketFor = (kind: UploadedPhoto["kind"]) => kind === "travel" ? "travel-photos" : "profile-photos";

async function imageBlob(dataUrl: string, kind: UploadedPhoto["kind"]) {
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) throw new Error("รองรับเฉพาะ JPG, PNG, WebP");
  const blob = await (await fetch(dataUrl)).blob();
  const limit = (kind === "travel" ? RECORD_IMAGE_POLICY : PROFILE_IMAGE_POLICY).maxBytes;
  if (!blob.size || blob.size > limit) throw new Error("รูปภาพมีขนาดเกินที่กำหนด");
  // Verify the image is decodable before sending bytes to Storage.
  const bitmap = await createImageBitmap(blob);
  bitmap.close();
  return blob;
}

export function createAccountStore(initialData: AccountData | null) {
  const userId = initialData?.user.id ?? "";
  const initial = initialData ? decodeAccountData(initialData, userId) : { user: { id: "", name: "ผู้ใช้ใหม่", username: "new_hiker" }, records: [] };
  let snapshot = initial;
  let revision = 0;
  let pendingRefresh: { revision: number; promise: Promise<void> } | undefined;
  const listeners = new Set<() => void>();
  const client = () => createClient();
  const emit = () => { for (const listener of listeners) listener(); };
  const signal = () => { try { localStorage.setItem(ACCOUNT_CHANGED_KEY, JSON.stringify({ userId, nonce: crypto.randomUUID() })); } catch { /* Cloud save remains successful without browser storage. */ } };
  async function verifyIdentity() {
    const { data: { user }, error } = await client().auth.getUser();
    if (error || !userId || user?.id !== userId) throw new Error("กรุณาเข้าสู่ระบบอีกครั้งก่อนบันทึก");
  }
  async function readAccount(version: number) {
    const response = await fetch("/api/account", { cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("โหลดข้อมูลบัญชีไม่สำเร็จ กรุณาลองใหม่");
    const data = decodeAccountData(await response.json(), userId);
    if (version === revision) { snapshot = data; emit(); }
  }
  function refresh({ afterChange = false } = {}): Promise<void> {
    if (!userId) return Promise.resolve();
    if (afterChange) revision += 1;
    // Share background reads only while they describe the same account state.
    if (pendingRefresh?.revision === revision) return pendingRefresh.promise;
    const version = revision;
    const promise: Promise<void> = readAccount(version).finally(() => {
      if (pendingRefresh?.promise === promise) pendingRefresh = undefined;
    });
    pendingRefresh = { revision: version, promise };
    return promise;
  }
  async function upload(source: string, kind: UploadedPhoto["kind"]) {
    const blob = await imageBlob(source, kind);
    const id = crypto.randomUUID();
    const extension = blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1];
    const path = `${userId}/${kind === "travel" ? "record-photos" : "profile"}/${id}.${extension}`;
    const { error } = await client().storage.from(bucketFor(kind)).upload(path, blob, { contentType: blob.type, upsert: false, cacheControl: "0" });
    if (error) throw new Error("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    return { id, kind, object_path: path, mime_type: blob.type, size_bytes: blob.size } satisfies UploadedPhoto;
  }
  // Never remove bytes on an ambiguous write result without checking references.
  // Failed cleanup leaves a private orphan, not a broken saved memory.
  async function cleanup(photos: Array<Pick<UploadedPhoto, "kind" | "object_path">>) {
    if (!photos.length) return;
    try {
      await verifyIdentity();
      const { data, error } = await client().from("photos").select("object_path").eq("user_id", userId).in("object_path", photos.map((p) => p.object_path));
      if (error || !data) return;
      const referenced = new Set(data.map((p: { object_path: string }) => p.object_path));
      for (const kind of ["travel", "avatar"] as const) {
        const paths = photos.filter((p) => bucketFor(p.kind) === bucketFor(kind) && !referenced.has(p.object_path)).map((p) => p.object_path);
        if (paths.length) await client().storage.from(bucketFor(kind)).remove(paths);
      }
    } catch { /* Retry/manual cleanup can reclaim unreferenced objects later. */ }
  }
  const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
  return {
    refresh,
    profile: {
      subscribe, getSnapshot: () => snapshot.user, getServerSnapshot: () => initial.user,
      async updateCurrentUser(changes: Pick<User, "name" | "username" | "bio" | "avatar" | "coverImage">) {
        await verifyIdentity();
        const uploaded: UploadedPhoto[] = [];
        let committed = false;
        try {
          if (changes.avatar?.startsWith("data:")) uploaded.push(await upload(changes.avatar, "avatar"));
          if (changes.coverImage?.startsWith("data:")) uploaded.push(await upload(changes.coverImage, "cover"));
          await verifyIdentity();
          const { data: obsolete, error } = await client().rpc("save_account_profile", {
            p_profile: { name: changes.name, username: changes.username, bio: changes.bio ?? "" }, p_photos: uploaded,
          });
          if (error) throw new Error("บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่");
          // An older background read must not overwrite this confirmed save.
          revision += 1;
          committed = true; signal();
          if (Array.isArray(obsolete)) await cleanup(obsolete.map((path: string) => ({ kind: "avatar", object_path: path })));
          // A refresh failure must not turn a confirmed save into a failed mutation.
          const avatar = uploaded.find((photo) => photo.kind === "avatar");
          const cover = uploaded.find((photo) => photo.kind === "cover");
          snapshot = {
            ...snapshot,
            user: {
              ...snapshot.user,
              ...changes,
              avatar: avatar ? photoUrl(userId, avatar.id) : snapshot.user.avatar,
              coverImage: cover ? photoUrl(userId, cover.id) : snapshot.user.coverImage,
            },
          };
          emit();
          return snapshot.user;
        } finally { if (!committed) await cleanup(uploaded); }
      },
    },
    records: {
      subscribe, getSnapshot: () => snapshot.records, getServerSnapshot: () => initial.records,
      async createRecord(record: Omit<TravelRecord, "createdAt" | "userId">) {
        await verifyIdentity();
        if (record.photos.length > RECORD_PHOTO_LIMIT) throw new Error(`บันทึกได้สูงสุด ${RECORD_PHOTO_LIMIT} รูปต่อครั้ง`);
        const uploaded: UploadedPhoto[] = [];
        let committed = false;
        try {
          // Sequential uploads bound memory and make partial-failure cleanup explicit.
          for (const source of record.photos) uploaded.push(await upload(source, "travel"));
          await verifyIdentity();
          const { error } = await client().rpc("save_travel_record", {
            p_record: { id: record.id, place_id: record.placeId, visited_at: record.visitedAt.toISOString(), note: record.note, rating: record.rating }, p_photos: uploaded,
          });
          // A post-write read must never join a pre-write background request,
          // including when the commit response was lost.
          revision += 1;
          if (error) {
            // The server may have committed before the response was lost.
            await refresh();
            if (!snapshot.records.some((r) => r.id === record.id)) throw new Error("บันทึกไม่สำเร็จ กรุณาลองใหม่");
          }
          committed = true; signal();
          await cleanup(uploaded); // Also clears unused retry uploads after an idempotent save.
          try { await refresh(); } catch { throw new Error("บันทึกแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณาลองใหม่"); }
          const saved = snapshot.records.find((r) => r.id === record.id);
          if (!saved) throw new Error("โหลดบันทึกที่บันทึกแล้วไม่สำเร็จ กรุณาลองใหม่");
          return saved;
        } finally { if (!committed) await cleanup(uploaded); }
      },
    },
  };
}
