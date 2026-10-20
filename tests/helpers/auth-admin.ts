// Test runner only; this module is never imported by the application.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdmin: SupabaseClient | undefined;
export function getTestAdmin() {
  if (cachedAdmin) return cachedAdmin;
  const projectRef = readFileSync("supabase/.temp/project-ref", "utf8").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || new URL(url).hostname !== `${projectRef}.supabase.co`) throw new Error("Test URL must match the linked project");
  const raw = execFileSync("pnpm", ["exec", "supabase", "projects", "api-keys", "--project-ref", projectRef, "--reveal", "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const payload: unknown = JSON.parse(raw);
  if (!Array.isArray(payload)) throw new Error("Unexpected CLI key response");
  const keys = payload as Array<{ name?: string; type?: string; api_key?: string }>;
  const key = keys.find((entry) => (entry.name === "service_role" || entry.type === "secret") && entry.api_key && !entry.api_key.includes("***"))?.api_key;
  if (!key) throw new Error("Administrative API key is required for temporary email-flow fixtures");
  cachedAdmin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cachedAdmin;
}

export async function createTemporaryAccount() {
  const admin = getTestAdmin();
  const email = `doen-pa-cloud-${crypto.randomUUID()}@example.com`;
  const password = `QA-${crypto.randomUUID()}`;
  const result = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { doen_pa_ephemeral_test: true } });
  if (result.error || !result.data.user) throw new Error("Could not create isolated cloud fixture");
  const id = result.data.user.id;
  const profile = await admin.from("profiles").insert({ user_id: id, name: "ผู้ใช้ใหม่", username: "qa_ephemeral" });
  if (profile.error) { await admin.auth.admin.deleteUser(id); throw new Error("Could not create fixture profile"); }
  return { id, email, password, username: "qa_ephemeral" };
}

export async function removeTemporaryAccount(id: string) {
  const admin = getTestAdmin();
  for (const [bucket, folder] of [["travel-photos", "record-photos"], ["profile-photos", "profile"]]) {
    for (;;) {
      const { data, error } = await admin.storage.from(bucket).list(`${id}/${folder}`, { limit: 100 });
      if (error) throw new Error("Could not list fixture uploads for cleanup");
      if (!data?.length) break;
      const removed = await admin.storage.from(bucket).remove(data.map((file) => `${id}/${folder}/${file.name}`));
      if (removed.error) throw new Error("Could not remove fixture uploads");
    }
  }
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error("Could not remove isolated fixture account");
}
