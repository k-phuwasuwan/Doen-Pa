"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Save } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
import { userService } from "@/services/user.service";
import { ProfileHeader } from "./ProfileHeader";
import type { User } from "@/types";

const MAX_IMAGE_BYTES = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("อ่านรูปภาพไม่สำเร็จ"));
    reader.onerror = () => reject(new Error("อ่านรูปภาพไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

export function ProfileEditor() {
  const user = useCurrentUser();
  const userKey = [user.name, user.username, user.bio, user.avatar?.length, user.coverImage?.length].join("|");
  return <ProfileEditorForm key={userKey} initialUser={user} />;
}

function ProfileEditorForm({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [username, setUsername] = useState(initialUser.username);
  const [bio, setBio] = useState(initialUser.bio ?? "");
  const [avatar, setAvatar] = useState(initialUser.avatar);
  const [coverImage, setCoverImage] = useState(initialUser.coverImage);
  const [error, setError] = useState("");

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
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("รองรับเฉพาะไฟล์ JPG, PNG และ WebP");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("รูปภาพต้องมีขนาดไม่เกิน 1 MB เพื่อเก็บไว้ในเบราว์เซอร์");
      return;
    }
    try {
      const image = await readImage(file);
      if (kind === "avatar") setAvatar(image);
      else setCoverImage(image);
      setError("");
    } catch {
      setError("อ่านรูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!cleanName || !/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError("กรุณากรอกชื่อและชื่อผู้ใช้ให้ถูกต้อง");
      return;
    }

    try {
      userService.updateCurrentUser({ name: cleanName, username: cleanUsername, bio: bio.trim(), avatar, coverImage });
      router.push("/profile");
    } catch {
      setError("บันทึกไม่สำเร็จ พื้นที่จัดเก็บในเบราว์เซอร์อาจเต็ม กรุณาใช้รูปภาพที่เล็กลง");
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-8">
      <div>
        <p className="mb-3 text-sm font-medium text-brand-800/65">ตัวอย่างโปรไฟล์ของคุณ</p>
        <ProfileHeader user={previewUser} coverImage={coverImage} showEditButton={false} headingLevel={2} />
        <p className="mt-3 text-center text-xs text-brand-800/55">ตัวอย่างจะเปลี่ยนตามข้อมูลที่คุณแก้ไข</p>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass-card rounded-3xl p-5 sm:p-8" aria-labelledby="profile-form-heading">
        <h2 id="profile-form-heading" className="text-2xl font-semibold text-brand-800">ข้อมูลโปรไฟล์</h2>
        <div className="mt-5 space-y-5 border-t border-brand-700/10 pt-5">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-brand-800">ชื่อที่แสดง</label>
            <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} className="glass-input min-h-12 w-full px-4 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
          </div>
          <div>
            <label htmlFor="profile-username" className="mb-2 block text-sm font-medium text-brand-800">ชื่อผู้ใช้</label>
            <div className="relative">
              <span aria-hidden="true" className="absolute inset-y-0 left-4 flex items-center text-brand-800/55">@</span>
              <input id="profile-username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]{3,20}" title="ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ จำนวน 3–20 ตัว" aria-describedby="username-help" className="glass-input min-h-12 w-full pl-9 pr-4 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
            </div>
            <p id="username-help" className="mt-1.5 text-xs text-brand-800/55">ใช้ภาษาอังกฤษ ตัวเลข และ _ ได้ 3–20 ตัว</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="profile-bio" className="text-sm font-medium text-brand-800">คำแนะนำตัว</label>
              <span className="text-xs text-brand-800/55">{bio.length}/160</span>
            </div>
            <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={160} rows={3} className="glass-input w-full resize-y px-4 py-3 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
          </div>
        </div>

        <h3 className="mt-7 border-b border-brand-700/10 pb-3 text-xl font-semibold text-brand-800">รูปภาพโปรไฟล์</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label htmlFor="profile-avatar" className="liquid-glass flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl p-4 text-brand-800 transition-colors hover:bg-white/90 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Camera className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-medium">เปลี่ยนรูปโปรไฟล์</span>
            <input id="profile-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleImageChange(event, "avatar")} className="sr-only" />
          </label>
          <label htmlFor="profile-cover" className="liquid-glass flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl p-4 text-brand-800 transition-colors hover:bg-white/90 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"><ImagePlus className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-medium">เปลี่ยนภาพปก</span>
            <input id="profile-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleImageChange(event, "cover")} className="sr-only" />
          </label>
        </div>
        <p className="mt-2 text-xs text-brand-800/55">JPG, PNG หรือ WebP ขนาดไม่เกิน 1 MB ต่อรูป</p>
        <p role="alert" className="mt-3 min-h-5 text-sm text-red-700">{error}</p>

        <button type="submit" className="glass-button mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <Save className="h-5 w-5" aria-hidden="true" />
          บันทึกการเปลี่ยนแปลง
        </button>
        <Link href="/profile" className="mx-auto mt-3 flex min-h-11 w-fit items-center rounded-full px-4 text-sm text-brand-800/65 underline underline-offset-4 hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-brand-600">ยกเลิก</Link>
      </form>
    </div>
  );
}
