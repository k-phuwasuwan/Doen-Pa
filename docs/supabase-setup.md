# Supabase connection

Use Node.js 22 or later; the current Supabase SDK requires native WebSocket on
the server. With nvm installed, run `nvm use` (the repository includes `.nvmrc`).
Install dependencies with `pnpm install`. Use pnpm for this repository.

Create `.env.local` next to `package.json` (this file is ignored by Git):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Copy both values from Supabase's Connect dialog. Use a publishable key, never a
secret or service-role key in a `NEXT_PUBLIC_` variable. Restart `pnpm dev` after
changing environment variables. Set the same variables in the hosting provider
before deployment; local environment files are not deployed through Git.

Run `node scripts/check-supabase.mjs` to check that the configured Auth endpoint
accepts the key. It does not print keys or modify account/project data.

## CLI and migrations

The Supabase CLI is pinned as a project dev dependency. Run it from the repository
root with `pnpm exec supabase`; `supabase/config.toml` is already initialized.

```bash
pnpm exec supabase --version
pnpm exec supabase migration new <migration_name>
```

The second command creates an empty SQL file under `supabase/migrations/`.
Review and commit migration files with the corresponding application changes.
CLI installation and initialization do not link a hosted project or apply SQL.
Use `pnpm exec supabase <command> --help` to inspect command options.

Reference: [Supabase CLI installation](https://supabase.com/docs/guides/local-development/cli/getting-started).

## Clients and sessions

- Browser components: import `createClient` from `@/lib/supabase/client`.
- Server Components, Server Actions and Route Handlers: import `createClient`
  from `@/lib/supabase/server` and await it. Each request gets its own client.
- Root `proxy.ts` refreshes sessions using `getClaims()`, forwards refreshed
  cookies to server rendering, and returns cookies and SDK cache headers to the
  browser. Static assets bypass the proxy.

The proxy does not require login or authorize data access. Protected operations
must verify authentication on the server and enforce ownership with RLS. Do not
trust `getSession()` as proof of identity on the server. Auth responses must not
be publicly cached; when a future auth Route Handler writes cookies, it must
also return `Cache-Control: private, no-store`.

## Current rollout stage

This change establishes connection helpers and cookie refresh only. Login still
shows the existing unavailable message, and profile/travel data still live in
localStorage. There are no database migrations or Storage uploads yet. Existing
local records must be preserved until an explicit import flow is implemented.

Next: migrations and RLS for profiles, places, travel records and photo metadata;
then signup/login/logout; then private Storage and record import. Real session
persistence and account isolation require integration testing once Auth and RLS
are connected.

Reference: [Supabase SSR guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
