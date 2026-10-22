// Pre-deploy secret scan over tracked files. No network, no external tools.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns = [
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{16,}/],
  ["JWT (possible service_role key)", /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/],
  ["Google App Password", /(?:app[ _-]?password|SMTP_PASS\w*)\s*[:=]\s*["']?[a-z]{4}\s?[a-z]{4}\s?[a-z]{4}\s?[a-z]{4}\b/i],
  ["Postgres URL with password", /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s]{6,}@/],
  ["Vercel/GitHub token", /\b(?:ghp_|github_pat_|vercel_[a-z]+_)[A-Za-z0-9_]{20,}/],
];
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0")
  .filter((file) => file && !file.endsWith("pnpm-lock.yaml") && !file.startsWith(".agents/") && file !== "scripts/scan-secrets.mjs");
let found = 0;
for (const file of files) {
  let text;
  try { text = readFileSync(file, "utf8"); } catch { continue; }
  for (const [name, pattern] of patterns) {
    if (pattern.test(text)) { console.error(`${file}: possible ${name}`); found++; }
  }
}
if (found) { console.error(`${found} possible secret(s) found`); process.exit(1); }
console.log(`Secret scan clean (${files.length} tracked files).`);
