// Test runner only; this module is never imported by the application.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

export function getTestAdmin() {
  const projectRef = readFileSync("supabase/.temp/project-ref", "utf8").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || new URL(url).hostname !== `${projectRef}.supabase.co`) throw new Error("Test URL must match the linked project");
  const raw = execFileSync("pnpm", ["exec", "supabase", "projects", "api-keys", "--project-ref", projectRef, "--reveal", "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const payload: unknown = JSON.parse(raw);
  if (!Array.isArray(payload)) throw new Error("Unexpected CLI key response");
  const keys = payload as Array<{ name?: string; type?: string; api_key?: string }>;
  const key = keys.find((entry) => (entry.name === "service_role" || entry.type === "secret") && entry.api_key && !entry.api_key.includes("***"))?.api_key;
  if (!key) throw new Error("Administrative API key is required for temporary email-flow fixtures");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
