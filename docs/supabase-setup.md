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

- Browser components use `@/lib/supabase/client`.
- Server Components use the request-scoped client in `@/lib/supabase/server`.
- Auth Route Handlers use `createRouteClient` from `@/lib/supabase/route` so the
  final response includes every SDK cookie plus `Cache-Control: private, no-store`.
- `proxy.ts` refreshes expired tokens with `getClaims()`, forwards refreshed
  cookies to server rendering, and sends the SDK cookies/cache headers back.
  Cookie writes use SameSite=Lax and Secure on HTTPS. Verify the deployed
  proxy's forwarded protocol and cookie attributes during domain testing.
- `getAuthUser()` in `src/lib/auth/server.ts` verifies identity with `getUser()`
  and reads the owner's profile through RLS. React `cache` deduplicates within
  one request, never across users. `requireAuthUser()` guards personal forms.

Do not trust `getSession()` as server authorization. Personal database operations
must use the signed-in user's client and enforce ownership with RLS. The proxy
refreshes cookies; it is not the authorization boundary.

## Current Auth behavior

Real email/password signup, login, email confirmation, resend, recovery and
current-session logout are implemented. Google login remains deferred. Auth
settings checked on 2026-10-20 report signup enabled, email confirmation required,
and Google disabled.

The organization is on the Free plan. After creating the first Auth accounts,
Security Advisors reports `auth_leaked_password_protection`: the provider's
leaked-password check is disabled and is available on Pro and above. This
warning remains; no subscription change was made. The app requires 8–72
characters for new passwords, which does not replace a leaked-password check.
See [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

The app starts logged out. Search and place descriptions remain public. Passport,
Stats and Profile show guest screens without a verified session. Profile editing
and stamping require login. Normal login defaults to Search; legacy `from`
controls the Back link only. Safe explicit `next` destinations preserve stamp
intent for returning users while
rejecting external URLs; legacy `from` links still work. The optional `view=guest`
parameter only changes the design preview and cannot grant access.

Auth mutations are same-origin JSON POSTs under `/auth/[action]`. Invalid
credentials, unconfirmed email, expired links, rate limits and network errors
have Thai recovery messages. The form does not persist passwords. Callback
responses suppress referrers and shared caching.

Signup, resend and password-recovery submissions do not display email-send
success notices in the form. Errors remain visible. Signup and recovery retain
the top Back control and omit the duplicate Login footer link; signup still
offers resend after a successful request.

`/auth/callback` exchanges a PKCE code. Default email links using this flow must
be opened in the browser where signup/recovery began. `/auth/confirm` also accepts
a single-use `token_hash` for SSR email templates, including another device.
Recovery tokens always lead to `/reset-password`. After a password change the
current session signs out and Login asks for the new password.

Successful login and confirmation initialize a missing `profiles` row through
the user's RLS-protected client, ignoring conflicts so existing values survive.
There is no privileged signup trigger. Username is a private profile field;
login uses the email address.

New registrations set `profile_setup_pending: true` in Auth user metadata.
Login and confirmation use that flag to open `/profile/edit?setup=1` first,
without Back or Cancel links. Recovery always goes to `/reset-password`.
The profile form requires a display name and username; images remain optional.
Once the profile save succeeds, `/auth/complete-profile-setup` verifies the
current account and saved profile, clears the flag using `auth.updateUser`, and
returns Search regardless of the original destination. A completion failure keeps the editor and
allows retrying. Existing accounts without the flag are not forced through setup.
This metadata controls onboarding navigation only; it is never used for data
authorization, which still relies on verified Auth identity and owner-only RLS.

Logout uses `scope: "local"`, ends the current session, clears its cookies and
broadcasts a change signal to other tabs. It preserves local memories and does
not intentionally sign out other devices. Auth changes and restored browser
pages reload account data; the provider hides the previous account while
identity is being reconciled.

## Personal data during this rollout

Supabase serves profiles, travel records and private photos as well as the
catalog. SSR verifies the account before reading personal data. Browser saves
use the account's JWT and RLS-protected transactional RPCs; private photo
responses verify the session and owner on every request and suppress caching.
Cross-tab change signals and focus/visibility refresh the in-memory snapshot.

New accounts start empty. Legacy v2 keys and both account-v1 localStorage keys
remain untouched and are never automatically imported. The user confirmed there
is no local data to migrate, so local import is removed from the plan.
See [private account data](private-data-backend.md) before
changing cloud writes, Storage or imports. The `rls_auto_enable()` API-execution
warnings remain resolved.

## Production URL and email delivery — 2026-10-22

The app is deployed at `https://doen-pa.vercel.app` on Vercel. The user confirmed
that the real Gmail inbox checks for signup/confirmation, resend and password
recovery passed on 2026-10-22. This is user-reported email-delivery verification;
automated token tests do not send email. See [production acceptance](testing.md#production-acceptance--2026-10-22)
for the browser journey and real-device verification status.

The selected sender is a dedicated Gmail account with 2-Step Verification and
an App Password stored only in Supabase custom SMTP. Keep credentials out of
source control, browser code and test artifacts.

When changing domains, sender accounts or Auth configuration:

1. Set Site URL to the actual HTTPS app URL, and allow the callback URLs used by
   the app for production and localhost. The app currently sends
   `<app-origin>/auth/callback?next=<allowed-app-path>` for signup/recovery.
   Review the exact redirect allowlist with that URL shape.
2. Check the dedicated Gmail custom SMTP configuration and sender address.
   Configure replacement credentials directly in Supabase; never add them to
   repository or frontend environment variables.
3. Keep email confirmation enabled. Test signup, resend and recovery with a real
   inbox, including spam delivery, expired links and already-used links.
4. Set the public Supabase URL/key on the hosting provider and test the complete
   flow on the deployed HTTPS domain, including cookie refresh and logout.

If choosing TokenHash templates instead of the default PKCE email flow, use the
following link targets with the project's configured Site URL:

```text
Confirmation:
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email

Recovery:
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
```

The confirmation template above opens profile setup for pending new accounts,
otherwise Search; the recovery route
always goes to the password form. Template changes belong to the intended
project's Auth configuration; repo changes do not update hosted templates or
SMTP settings. A future Google integration additionally needs a Google OAuth
client and provider configuration.

### Branded Auth emails — 2026-10-23

Confirmation and recovery emails use Thai copy, the Doen Pa wordmark, inline
styles and table layouts, a forest-green action button and a copyable fallback
link. The HTML sources live in `supabase/templates/confirmation.html` and
`supabase/templates/recovery.html`; `supabase/config.toml` points local Auth to
those files.

| Dashboard template | Subject | Button |
| --- | --- | --- |
| Confirm sign up | ยืนยันอีเมลเพื่อสมัครใช้งาน Doen Pa | ยืนยันอีเมล |
| Reset password | ตั้งรหัสผ่านใหม่สำหรับบัญชี Doen Pa | ตั้งรหัสผ่านใหม่ |

Both buttons and fallback links retain `{{ .ConfirmationURL }}`, matching the
previous hosted templates and preserving the existing callback/PKCE flow. They
do not switch to the optional TokenHash links above. `{{ .SiteURL }}` is used
only by the footer website link. Expiry copy does not promise a fixed duration.

The two subjects and bodies were saved in the linked production project's
**Authentication > Emails > Templates**. Future repository edits must also be
applied to those two hosted templates; a Vercel deploy does not update them.
Update only the corresponding subject and HTML body, keeping SMTP credentials,
Auth security settings and URL configuration unchanged. Dashboard previews and
browser rendering do not prove Gmail inbox delivery; recheck signup, resend and
recovery in a real inbox after template changes.

## Reusable QA accounts

For manual local runs, use the accounts already created for this project.
New profile edits, records and photos save directly to that signed-in account.

Run with Node 22+ and the authenticated CLI linked to the intended project:

```sh
node scripts/setup-auth-test-users.mjs
pnpm test:e2e
```

The setup script reads the administrative key into memory through the CLI,
creates two marked QA accounts through Admin API, confirms them without sending
email, initializes their profiles, and verifies ordinary password login. It
writes `.local/auth-test-accounts.json` for tests and
`.local/auth-test-accounts.md` for manual use. Both files are ignored by Git and
have owner-only filesystem permissions. Keep them locally to reuse the same
passwords; rerunning does not rotate passwords or overwrite an unrelated account.
Administrative keys are never stored in these files or in application code.

These reserved example.com addresses do not receive email. Their confirmed
status allows manual login testing but does not validate SMTP delivery.
Signed-in browser tests create isolated temporary users through Admin API and
remove their uploaded objects and accounts afterward. Email-flow tests create
temporary users and real tokens without sending email. The reusable QA accounts
remain available for manual login and targeted Auth checks. See [testing](testing.md).

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls),
[password Auth](https://supabase.com/docs/guides/auth/passwords).

## Function region

The Supabase project is in `ap-northeast-1` (Tokyo). `vercel.json` pins Vercel Functions to `hnd1` so each Supabase round trip stays in-region; the default `iad1` added roughly a transatlantic round trip to every Auth, database and Storage call. Keep the two regions together if either moves.
