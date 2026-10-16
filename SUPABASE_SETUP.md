# KainCheck Supabase connection

Connected project: **KainCheck**, organization **Evenpiercer**.

- Project reference: `agttxkpvcesiiwqrjsze`
- Project URL: `https://agttxkpvcesiiwqrjsze.supabase.co`
- Dashboard: https://supabase.com/dashboard/project/agttxkpvcesiiwqrjsze
- Public client configuration: `dist/supabase-config.js`
- Official client: `@supabase/supabase-js` 2.118.0, pinned with `pnpm-lock.yaml`, bundled in `dist/vendor/`

## What is connected

`dist/account.js` uses Supabase Auth for registration, email confirmation, password sign-in, session refresh and device sign-out. The app saves usernames, profile pictures, gender/pronouns, preferences, meal/activity logs, plans, coach configuration and conversations to `public.kaincheck_user_state`. API-key fields and auth tokens are excluded from app-state snapshots. Raw food photos are transient and are not saved in this table.

The migration `supabase/migrations/20261016143111_kaincheck_user_state.sql` was applied through the authenticated project dashboard SQL editor because the connected Supabase plugin is still scoped to U-Matter / Travelmate. Do not reapply the CREATE TABLE migration to this existing project. Apply it once when setting up a new project, then update the public connection configuration.

RLS is enabled. Three policies restrict read, insert and update to the authenticated owner, using `auth.uid()`. UPDATE includes both USING and WITH CHECK. Anonymous access is revoked. No service-role key, database password or personal access token is required in the app.

## Authentication settings

The dashboard Site URL and exact allowed redirect were set to:

```text
https://kaincheck-mobile-demo-ginoki.snowydrake.chatgpt.site/
```

Email/password signup is enabled and email confirmation remains required. After registering, follow the email confirmation link, then sign in. The app shows a confirmation screen when signup returns no authenticated session. Registration from localhost also returns to the hosted app.

Email delivery still needs an inbox test. Supabase's default mail service has recipient and rate limits; configure a suitable SMTP provider under Authentication → Emails before opening registration to general users. Keep email confirmation enabled. See https://supabase.com/docs/guides/auth/auth-smtp and https://supabase.com/docs/guides/auth/redirect-urls.

## Cloud save behavior

Profiles, avatar images and chats are stored together in an owner-only JSON row, capped at 6 MiB. This is suitable for the prototype; larger histories/images should move to dedicated tables and private Storage with owner policies. There is no live merge or automatic propagation into an already-open second device. Reopen the app to load current cloud state.

Writes compare the last loaded revision. A stale device cannot silently overwrite newer cloud changes. Failed writes keep a dirty local cache and expose Retry cloud sync. Conflicts expose Use cloud version; this preserves the prior device copy under its `-unsynced-backup` browser-storage key. API keys are excluded, but coach prompts/chats and profile photos are personal app data and do sync.

Guest demo data remains local. Old local demo credentials are not valid Supabase credentials, and old profiles/chats are not imported automatically. Signing out removes the active Supabase session and clears in-memory coach keys; the per-account cache remains for offline use on that browser.

## Verification completed

- Live project accepts the publishable key; email signup is enabled and confirmation required.
- A real invalid sign-in is rejected by Supabase Auth.
- Anonymous Data API reads fail with permission denied.
- Database query confirms RLS and all three owner policies, with authenticated access only.
- Rolled-back database test: a simulated authenticated owner saw one own row and zero rows belonging to another user. Test data was not retained.
- Mobile browser checks used the official SDK with mocked Supabase HTTP responses: confirmation, failed sign-in, session reload, cloud saves, second-device reload, conflicting edits, retry, logout, separate users, guest flow, combined coach settings, and widths 360/390/430.

An actual signup email, confirmation link and two-device login with a real user have not yet been exercised. Create your account in the hosted app, confirm the email, change your profile, then sign in with the same account on your Android phone. A second account must see its own data.

The existing hosted Site remains owner-private. Supabase accounts do not bypass that hosting gate; audience changes are separate. GitHub stores source and does not automatically deploy the Site or the Supabase migration. Reconnect the Supabase plugin with access to Evenpiercer for future management through that connector.

## Rebuild

```sh
pnpm install --frozen-lockfile
pnpm run build:vendor
python scripts/build-worker.py
node scripts/validate-artifact.mjs
```

Publishable keys belong in frontend configuration. Never add `sb_secret_` or `service_role` keys to browser code or the public GitHub repository. Official API key guide: https://supabase.com/docs/guides/api/api-keys.
