import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next/package.json"));
nextRequire("@next/env").loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const projectRef = readFileSync("supabase/.temp/project-ref", "utf8").trim();
if (!url || !publishableKey || new URL(url).hostname !== `${projectRef}.supabase.co`) throw new Error("Project URL and linked project must match");

// Administrative key is read into this process only; never printed or saved.
const cli = spawnSync("pnpm", ["exec", "supabase", "projects", "api-keys", "--project-ref", projectRef, "--reveal", "--output", "json"], { encoding: "utf8" });
if (cli.status !== 0) throw new Error("Could not read administrative key via authenticated Supabase CLI");
const payload = JSON.parse(cli.stdout);
const keys = Array.isArray(payload) ? payload : payload.api_keys ?? payload.keys;
const adminKey = keys?.find((key) => (key.name === "service_role" || key.type === "secret") && typeof key.api_key === "string" && !key.api_key.includes("***"))?.api_key;
if (!adminKey) throw new Error("CLI did not return an administrative API key");
const admin = createClient(url, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });

mkdirSync(".local", { recursive: true, mode: 0o700 });
const accountsFile = ".local/auth-test-accounts.json";
const accounts = existsSync(accountsFile) ? JSON.parse(readFileSync(accountsFile, "utf8")) : ["a", "b"].map((label) => ({
  email: `doen-pa-qa-${label}@example.com`, password: randomBytes(24).toString("base64url"), username: `qa_hiker_${label}`,
}));
// Save first so a partial setup can be retried with the same credentials.
writeFileSync(accountsFile, JSON.stringify(accounts, null, 2) + "\n", { mode: 0o600 });
chmodSync(accountsFile, 0o600);

for (const account of accounts) {
  const client = createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } });
  let { data, error } = await client.auth.signInWithPassword({ email: account.email, password: account.password });
  if (error) {
    const created = await admin.auth.admin.createUser({
      email: account.email, password: account.password, email_confirm: true,
      app_metadata: { doen_pa_test_account: true },
    });
    if (created.error) throw new Error(`Could not create/reuse ${account.email}: ${created.error.code ?? "Auth error"}. Existing accounts are not overwritten.`);
    ({ data, error } = await client.auth.signInWithPassword({ email: account.email, password: account.password }));
  }
  if (error || !data.user) throw new Error(`Login failed for ${account.email}`);
  if (!data.user.app_metadata.doen_pa_test_account) throw new Error("Refusing to modify an unmarked account");
  account.id = data.user.id;
  const { error: profileError } = await client.from("profiles").upsert({ user_id: account.id, name: "ผู้ใช้ใหม่", username: account.username }, { onConflict: "user_id", ignoreDuplicates: true });
  if (profileError) throw new Error(`Profile initialization failed for ${account.email}`);
  await client.auth.signOut({ scope: "local" });
  console.log(`Verified test account: ${account.email}`);
}
writeFileSync(accountsFile, JSON.stringify(accounts, null, 2) + "\n", { mode: 0o600 });
const notes = ["# บัญชีทดสอบ Doen Pa", "", `Supabase project: ${projectRef}`, "", "ใช้ช่องอีเมลในการเข้าสู่ระบบ; username เป็นชื่อในโปรไฟล์", "", ...accounts.flatMap((account, index) => [
  `## บัญชี ${index + 1}`, `- Email: ${account.email}`, `- Username: ${account.username}`, `- Password: ${account.password}`, `- User ID: ${account.id}`, "",
]), "บัญชีเหล่านี้ยืนยันอีเมลด้วย Admin API สำหรับ QA โดยไม่ส่งเมล จึงไม่ได้พิสูจน์การส่งเมล SMTP", "ข้อมูลการเดินทาง โปรไฟล์ และรูปภาพจัดเก็บใน Supabase แยกตามบัญชี", "ไฟล์นี้และไฟล์ JSON อยู่ใน .local/ ที่ Git ไม่ติดตาม อย่าใช้รหัสผ่านเหล่านี้กับบัญชีส่วนตัว", ""].join("\n");
writeFileSync(".local/auth-test-accounts.md", notes, { mode: 0o600 });
chmodSync(".local/auth-test-accounts.md", 0o600);
console.log("Saved credentials to .local/auth-test-accounts.md (ignored by Git).");
