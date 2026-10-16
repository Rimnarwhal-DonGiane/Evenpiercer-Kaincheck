# Evenpiercer-Kaincheck

KainCheck is a mobile wellness app prototype with Filipino food logging, flexible movement plans, photo food checking, and customizable AI coaches.

- Source: https://github.com/Rimnarwhal-DonGiane/Evenpiercer-Kaincheck
- Hosted app: https://kaincheck-mobile-demo-ginoki.snowydrake.chatgpt.site/
- Backend setup: [Connect Supabase](SUPABASE_SETUP.md)

## Current features

- Username, profile picture, gender, pronouns and bio.
- Meal logging, editable portions, nutrient estimates, water and movement logs, daily plans, and an All around movement option.
- Photo capture/upload with a clearly labeled preset demo and optional vision-model analysis. Review and confirm items before logging.
- One AI coach menu for choosing and customizing coaches. Six built-in coaches and saved custom characters keep separate chats and preferences.
- Character prompts, biography, appearance, avatar uploads, model/proxy settings, sampling controls, and a default 16K estimated context budget.
- Refresh the latest AI response or retry a failed reply without duplicating the user's message.
- Real Supabase email/password registration, email confirmation, sign-in, persistent sessions, and logout. Profiles, food logs, plans, coach appearances and conversations sync to the signed-in account. Guest browsing remains local.
- Android/iPhone home-screen installation with a manifest, icons and a service worker. Only static app files are cached.

## Run locally

Serve the editable `dist/` files:

```sh
python -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4174/. Sign in to an existing online account or continue as a guest. Registration confirmation returns to the hosted app. Guest data stays in this browser. Cloud accounts keep a device cache for offline use; protect browser access on shared devices.

## Build for the current hosting service

The official Supabase SDK is pinned and bundled locally. Rebuild the browser bundle when dependencies change:

```sh
pnpm install --frozen-lockfile
pnpm run build:vendor
python scripts/build-worker.py
node scripts/validate-artifact.mjs
```

`worker/index.js` serves the app and private provider configuration. The build embeds static assets in `dist/server/index.js`. Generated Worker output, deployment archives, local environment files, credentials and account data are excluded from version control.

GitHub stores the project source. Publishing a GitHub commit does not automatically redeploy the existing hosted Site; use the configured hosting workflow for that Site.

## AI connections

Built-in KainCheck coaches use offline example replies. Custom AI uses the configured chat-completions provider. The Pawan preset uses `https://api.pawan.krd/v1/chat/completions` and `pkrd/cosmosrp-2.1`.

The existing owner-private hosted app keeps its configured Pawan key in the runtime secret `PKRD_API_KEY`. At the owner's request, its same-origin, non-cacheable configuration endpoint fills a masked password field, and the browser sends requests directly to Pawan. The real key is not in this repository, browser profile storage, the service-worker cache or the offline export. User-entered keys stay in tab memory. Keep the hosting access boundary intact when changing this behavior.

Live replies depend on the provider's access rules, account status, model support, CORS configuration and usage limits. Photo recognition needs an image-capable model. Photos stay in memory and are discarded after logging.

## Real online accounts

Connected to **KainCheck** (`agttxkpvcesiiwqrjsze`) in **Evenpiercer**. The browser configuration is `dist/supabase-config.js`; it contains only the project URL and publishable key. The owner-only `kaincheck_user_state` table stores app state as JSON with optimistic revisions. RLS restricts SELECT, INSERT and UPDATE to `auth.uid() = user_id`; anonymous access is revoked. No service-role key is used.

Cloud saves are debounced. Failed saves remain queued on the device; reconnect or choose Retry cloud sync in Profile. If another device has newer data, the app stops writing and offers Use cloud version, retaining the unsynced device copy as a browser-storage backup. Reopen/sign in on a second device to load the latest cloud state. This version does not provide live multi-device merging.

Existing local demo accounts are not converted to Supabase accounts. Register an online account separately; existing guest/demo profiles and chats are not uploaded automatically. AI API keys stay in tab memory or the existing private hosting secret, outside the cloud profile record.

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the applied migration, dashboard settings and remaining email-delivery verification. The existing owner-private Site access gate is separate from Supabase login. Other people cannot open this Site until its hosting audience is explicitly changed.

Nutrition, prices, weekly history and calorie targets in this prototype are illustrative estimates. Platinum ++ billing is simulated; no payments are collected.
