# KainCheck Supabase connection

Connected project: **KainCheck**, organization **Evenpiercer**.

- Project reference: `agttxkpvcesiiwqrjsze`
- Project URL: `https://agttxkpvcesiiwqrjsze.supabase.co`
- Dashboard: https://supabase.com/dashboard/project/agttxkpvcesiiwqrjsze
- Public client configuration: `dist/supabase-config.js`
- Official client: `@supabase/supabase-js` 2.118.0, pinned with `pnpm-lock.yaml`, bundled in `dist/vendor/`

## What is connected

`dist/account.js` uses Supabase Auth for Google registration/sign-in with PKCE, callback session exchange, session refresh and device sign-out. Email/password forms were removed at the owner’s request. The app saves usernames, profile pictures, gender/pronouns, preferences, meal/activity logs, plans, coach configuration and conversations to `public.kaincheck_user_state`. API-key fields and auth tokens are excluded from app-state snapshots. Raw food photos are transient and are not saved in this table.

The migration `supabase/migrations/20261016143111_kaincheck_user_state.sql` was applied through the authenticated project dashboard SQL editor because the connected Supabase plugin is still scoped to U-Matter / Travelmate. Do not reapply the CREATE TABLE migration to this existing project. Apply it once when setting up a new project, then update the public connection configuration.

RLS is enabled. Three policies restrict read, insert and update to the authenticated owner, using `auth.uid()`. UPDATE includes both USING and WITH CHECK. Anonymous access is revoked. No service-role key, database password or personal access token is required in the app.

## Authentication settings

The dashboard Site URL and exact allowed redirect were set to:

```text
https://kaincheck-mobile-demo-ginoki.snowydrake.chatgpt.site/
```

The app now offers **Continue with Google** for both registration and sign-in. The first successful Google login creates the Supabase user and owner-only profile. Google display name supplies the initial username, which users can edit in Profile. Guest data is not imported automatically. No SMTP provider is needed for Google sign-in.

**Live Google sign-in is not activated yet.** The dashboard Google provider was inspected: disabled, with empty Client IDs and Client Secret fields. The application button checks public provider settings and displays a clear availability message until setup is complete.

1. Open https://console.cloud.google.com/auth/clients and select/create the Google Cloud project for KainCheck.
2. Configure the OAuth consent screen/audience. For a demo in Testing status, add the Google accounts allowed to test. Use only basic `openid`, email and profile scopes.
3. Create an OAuth client of type **Web application**. The mobile prototype is an installable web app, so this is the appropriate client type.
4. Set the authorized JavaScript origin to `https://kaincheck-mobile-demo-ginoki.snowydrake.chatgpt.site`.
5. Set the authorized redirect URI to:

```text
https://agttxkpvcesiiwqrjsze.supabase.co/auth/v1/callback
```

6. Open https://supabase.com/dashboard/project/agttxkpvcesiiwqrjsze/auth/providers?provider=Google. Enter the Google **Client ID** and **Client Secret** in that dashboard, enable Sign in with Google, and Save. Keep Skip nonce checks off. The Client Secret must stay in Supabase; do not paste it into the app configuration or public GitHub source.
7. Open the hosted app in Chrome, choose Continue with Google, complete consent, and verify your profile. Sign out and sign in on your Android phone with the same Google account to check cloud restoration.

The browser uses `signInWithOAuth({provider:'google', options:{redirectTo: hostedUrl, queryParams:{prompt:'select_account'}}})` with PKCE. Supabase handles the Google callback; the browser SDK exchanges the one-time return code using its stored verifier. No extra Google data scopes or Google offline access are requested.

Official setup guide: https://supabase.com/docs/guides/auth/social-login/auth-google.

## Cloud save behavior

Profiles, avatar images and chats are stored together in an owner-only JSON row, capped at 6 MiB. This is suitable for the prototype; larger histories/images should move to dedicated tables and private Storage with owner policies. There is no live merge or automatic propagation into an already-open second device. Reopen the app to load current cloud state.

Writes compare the last loaded revision. A stale device cannot silently overwrite newer cloud changes. Failed writes keep a dirty local cache and expose Retry cloud sync. Conflicts expose Use cloud version; this preserves the prior device copy under its `-unsynced-backup` browser-storage key. API keys are excluded, but coach prompts/chats and profile photos are personal app data and do sync.

Guest demo data remains local. Old local demo credentials are not valid Supabase credentials, and old profiles/chats are not imported automatically. Signing out removes the active Supabase session and clears in-memory coach keys; the per-account cache remains for offline use on that browser.

## Verification completed

- Live project accepts the publishable key. Anonymous Data API reads fail with permission denied.
- Database query confirms RLS and all three owner policies, with authenticated access only.
- Rolled-back database test: an authenticated owner saw one own row and zero rows belonging to another user. Test records were not retained.
- Supabase Security Advisor rerun reported zero errors and zero warnings.
- Mobile browser checks used the real SDK and mocked provider HTTP responses: unavailable provider message, Google-only UI, exact OAuth redirect, PKCE challenge and code exchange, callback session restoration, Google display-name fallback, profile cloud saves, logout, guest entry, and widths 360/390/430.
- Cloud-save checks covered second-device reload, conflicting edits, retry, separate users and offline guest reload with the SDK cached in the PWA shell.

Actual Google consent and a real cross-device Google session have not been tested because the provider has no credentials. Complete the provider setup above, then perform those checks. Email delivery tests are no longer part of the selected Google login flow.

The existing hosted Site remains owner-private. Supabase accounts do not bypass that hosting gate; audience changes are separate. GitHub stores source and does not automatically deploy the Site or the Supabase migration. Reconnect the Supabase plugin with access to Evenpiercer for future management through that connector.

## Rebuild

```sh
pnpm install --frozen-lockfile
pnpm run build:vendor
python scripts/build-worker.py
node scripts/validate-artifact.mjs
```

Publishable keys belong in frontend configuration. Never add `sb_secret_` or `service_role` keys to browser code or the public GitHub repository. Official API key guide: https://supabase.com/docs/guides/api/api-keys.
