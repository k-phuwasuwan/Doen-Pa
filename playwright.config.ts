import { defineConfig } from "@playwright/test";
import { createRequire } from "node:module";

const requireFromNext = createRequire(require.resolve("next/package.json"));
requireFromNext("@next/env").loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // Real Auth requests contain QA passwords; do not record them in traces.
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: process.env.PLAYWRIGHT_SERVER_COMMAND ?? "pnpm dev",
    url: `${baseURL}/search`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
