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
- Registration, sign-in, logout and guest browsing currently use separate **on-device demo accounts**. They are not connected to Supabase yet. Passwords are salted and hashed locally; this is a presentation flow, not server authentication.
- Android/iPhone home-screen installation with a manifest, icons and a service worker. Only static app files are cached.

## Run locally

Serve the editable `dist/` files:

```sh
python -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4174/. Create a demo account or continue as a guest. Account data stays in this browser. Clearing browser storage removes local demo accounts and data.

## Build for the current hosting service

```sh
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

The requested target Supabase organization is **evenpiercer**. The currently connected plugin exposes only U-Matter / Travelmate, so no Supabase project has been selected or modified for KainCheck.

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to authorize evenpiercer, select or create the KainCheck project, and configure email authentication. The app's local demo account flow must be replaced with Supabase Auth and per-user cloud storage before online-account support is complete. Adding a URL/key or a GitHub CLI action alone does not perform that integration.

Nutrition, prices, weekly history and calorie targets in this prototype are illustrative estimates. Platinum ++ billing is simulated; no payments are collected.
