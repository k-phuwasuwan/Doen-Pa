# Verification

## Local checks

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm lint
git diff --check
pnpm build
```

`pnpm test` runs the pure read-model, storage-snapshot and image-import tests with Node's test runner. TypeScript compilation goes into a temporary directory and is removed when the command completes.

## Browser regression tests

First-time setup:

```sh
pnpm install
pnpm exec playwright install chromium
```

Run the suite:

```sh
pnpm test:e2e
```

The suite runs Chromium at desktop (1440 × 1000) and mobile (390 × 844) sizes. It reuses an existing server at `http://localhost:3000`; otherwise Playwright starts `pnpm dev` and stops that server after testing. CI requires a free port 3000. This follows Playwright's [web server configuration](https://playwright.dev/docs/test-webserver).

Each test gets an isolated browser context. Test profile edits and travel records do not affect a developer's usual browser data. Two pages inside a context exercise real cross-tab storage events.

Covered journeys:

- New user's empty Passport, Profile and Stats.
- Revisits, six photos across two records, Profile photo selection, lightbox and Passport read-only details.
- Corrupt saved records, external profile changes and storage clear.
- Latest avatar selection, independent cover reads, and save disabled while reading.
- Photo removal and alt edits during a pending read, then save and cross-tab Passport update.
- Profile/record file limits and maximum five photos per record.
- Storage quota failures without publishing unsaved records or profile changes.

Held image reads are released explicitly by tests; race checks do not depend on arbitrary sleep durations. Browser console errors and uncaught page errors fail the test.

Artifacts are ignored by git: `playwright-report/` and `test-results/`. Traces and failure screenshots are retained, and the file-limit test records the rendered form for each viewport. Open the report with `pnpm exec playwright show-report`.

The mobile project emulates Chromium. This suite does not validate Safari/WebKit, Firefox, or deployed map tile credentials.
