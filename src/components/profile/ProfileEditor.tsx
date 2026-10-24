"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Save } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileHeader } from "./ProfileHeader";
import type { User } from "@/types";
import { IMAGE_ACCEPT, PROFILE_IMAGE_POLICY } from "@/lib/images/image-import";
import { useImageImport } from "@/lib/use-image-import";
import { DEFAULT_PROFILE_NAME, DEFAULT_PROFILE_USERNAME, USERNAME_PATTERN, isProfileSetupComplete } from "@/lib/auth/profile-setup";

export function ProfileEditor({ setup = false }: { setup?: boolean }) {
  const user = useCurrentUser();
  const userKey = JSON.stringify([user.id, user.name, user.username, user.bio, user.avatar, user.coverImage]);
  return <ProfileEditorForm key={setup ? user.id : userKey} initialUser={user} setup={setup} />;
}

function ProfileEditorForm({ initialUser, setup }: { initialUser: User; setup: boolean }) {
  const { profile } = useAuth();
  const router = useRouter();
  const { importer, loading: readingImages } = useImageImport();
  const [name, setName] = useState(setup && initialUser.name === DEFAULT_PROFILE_NAME ? "" : initialUser.name);
  const [username, setUsername] = useState(setup && initialUser.username === DEFAULT_PROFILE_USERNAME ? "" : initialUser.username);
  const [bio, setBio] = useState(initialUser.bio ?? "");
  const [avatar, setAvatar] = useState(initialUser.avatar);
  const [coverImage, setCoverImage] = useState(initialUser.coverImage);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const previewUser: User = {
    ...initialUser,
    name: name.trim() || initialUser.name,
    username: username.trim() || initialUser.username,
    bio: bio.trim(),
    avatar,
    coverImage,
  };

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>, kind: "avatar" | "cover") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await importer.importImages(kind, [file], PROFILE_IMAGE_POLICY, ({ images, errors }) => {
      if (errors.length) {
        setError(errors[0].message);
        return;
      }
      const image = images[0]?.dataUrl;
      if (kind === "avatar") setAvatar(image);
      else setCoverImage(image);
      setError("");
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (importer.isPending() || saving) return;
    const cleanName = name.trim();
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!cleanName || !USERNAME_PATTERN.test(cleanUsername)) {
      setError("กรุณากรอกชื่อและชื่อผู้ใช้ให้ถูกต้อง");
      return;
    }
    if (setup && !isProfileSetupComplete(cleanName, cleanUsername)) {
      setError("กรุณาตั้งชื่อที่แสดงและชื่อผู้ใช้ของคุณเอง");
      return;
    }

    try {
      setSaving(true);
      await profile.updateCurrentUser({ name: cleanName, username: cleanUsername, bio: bio.trim(), avatar, coverImage });
      if (setup) {
        const response = await fetch("/auth/complete-profile-setup", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
        });
        const result: { error?: string; next?: string } = await response.json();
        if (!response.ok || result.error) throw new Error(result.error ?? "ตั้งค่าโปรไฟล์ไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง");
        window.location.assign(result.next ?? "/search");
        return;
      }
      router.push("/profile");
    } catch (error) {
      setError(error instanceof Error ? error.message : "บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่");
    } finally { setSaving(false); }
  }

  const pickerClass = "inline-flex cursor-pointer items-center justify-center text-brand-800 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600";

  return (
    <div className="mt-6 space-y-5">
      <div>
        <ProfileHeader
          user={previewUser}
          coverImage={coverImage}
          showEditButton={false}
          headingLevel={2}
          coverAction={
            <label htmlFor="profile-cover" className={`${pickerClass} min-h-11 gap-1.5 rounded-full bg-white px-4 text-sm font-semibold shadow-lg shadow-brand-950/20`}>
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              เปลี่ยนภาพปก
              <input id="profile-cover" type="file" accept={IMAGE_ACCEPT} onChange={(event) => void handleImageChange(event, "cover")} className="sr-only" />
            </label>
          }
          avatarAction={
            <label htmlFor="profile-avatar" aria-label="เปลี่ยนรูปโปรไฟล์" className={`${pickerClass} h-11 w-11 rounded-full border-2 border-white bg-brand-600 text-white shadow-glass hover:bg-brand-700`}>
              <Camera className="h-5 w-5" aria-hidden="true" />
              <input id="profile-avatar" type="file" accept={IMAGE_ACCEPT} onChange={(event) => void handleImageChange(event, "avatar")} className="sr-only" />
            </label>
          }
        />
        <p className="mt-2 px-1 text-xs text-brand-800/60">ตัวอย่างนี้เปลี่ยนตามที่คุณแก้ไข รูปภาพเป็น JPG, PNG หรือ WebP ไม่เกิน 1 MB</p>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass-card p-5 sm:p-7" aria-label="ข้อมูลโปรไฟล์">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-brand-800">ชื่อที่แสดง</label>
            <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} className="glass-input min-h-12 w-full px-4 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
          </div>
          <div>
            <label htmlFor="profile-username" className="mb-1.5 block text-sm font-medium text-brand-800">ชื่อผู้ใช้</label>
            <div className="relative">
              <span aria-hidden="true" className="absolute inset-y-0 left-4 flex items-center text-brand-800/55">@</span>
              <input id="profile-username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]{3,20}" title="ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ จำนวน 3–20 ตัว" aria-describedby="username-help" className="glass-input min-h-12 w-full pl-9 pr-4 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
            </div>
            <p id="username-help" className="mt-1.5 text-xs text-brand-800/55">ภาษาอังกฤษ ตัวเลข และ _ ได้ 3–20 ตัว</p>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="profile-bio" className="text-sm font-medium text-brand-800">คำแนะนำตัว</label>
              <span className="font-num text-xs text-brand-800/55">{bio.length}/160</span>
            </div>
            <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={160} rows={3} className="glass-input w-full resize-none px-4 py-3 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
          </div>
        </div>

        <p role="status" aria-live="polite" className="sr-only">{readingImages ? "กำลังอ่านรูปภาพ" : ""}</p>
        <p role="alert" className="mt-4 text-sm text-red-700 empty:hidden">{error}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-brand-800/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
          {!setup && <Link href="/profile" className="liquid-glass-capsule inline-flex min-h-12 items-center justify-center rounded-2xl px-6 font-semibold text-brand-800 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">ยกเลิก</Link>}
          <button type="submit" disabled={readingImages || saving} className="glass-button inline-flex min-h-12 items-center justify-center gap-2 px-6 font-semibold disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            <Save className="h-5 w-5" aria-hidden="true" />
            {readingImages ? "กำลังอ่านรูปภาพ…" : saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
    </div>
  );
}
