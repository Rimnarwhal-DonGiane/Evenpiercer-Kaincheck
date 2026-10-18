# Evenpiercer-Kaincheck

KainCheck is a mobile wellness app prototype with Filipino food logging, flexible movement plans, photo food checking, and customizable AI coaches.

- Source: https://github.com/Rimnarwhal-DonGiane/Evenpiercer-Kaincheck
- Public hosted app (no ChatGPT sign-in): https://kaincheck-mobile-demo-ginoki.snowydrake.chatgpt.site/
- AI and food update: [OpenAI & food checks](AI_AND_FOOD_SETUP.md)
- Backend setup: [Connect Supabase](SUPABASE_SETUP.md)

## Current features

- Username, profile picture, gender, pronouns and bio.
- Meal logging, editable portions, nutrient estimates, water and movement logs, daily plans, and an All around movement option.
- ChatGPT food-photo recognition, source-aware portion review, sodium and three-serving cautions, custom vision providers, and a clearly labeled preset demo.
- Six built-in coaches share server-side OpenAI coaching and keep separate personalities/chats; each can switch to Offline demo. Custom characters can select the shared ChatGPT connection or retain their own proxy/provider settings.
- Character prompts, biography, appearance, avatar uploads, model/proxy settings, sampling controls, and a default 16K estimated context budget.
- Refresh the latest AI response or retry a failed reply without duplicating the user's message.
- Google registration/sign-in through Supabase using PKCE, persistent sessions, and logout. The app flow is implemented; live Google login awaits Google OAuth credentials in the Supabase provider panel. Profiles, food logs, plans, coach appearances and conversations sync to the signed-in account. Guest browsing remains local.
- Android/iPhone home-screen installation with a manifest, icons and a service worker. Only static app files are cached.

- Responsive desktop dashboard, sidebar navigation, multi-column food library and expanded coach workspace.
- Pantry and budget planning with your coach, editable recipes (including sauces and portions), shopping lists with entered costs, food preferences/allergies, actual seven-day activity reviews, and opt-in editable coach notes.

- Appearance controls: six themes, Andy/Terraria and VCR/Earthmover pairings, Bebas Neue, EVA Matisse, background/accent colors, light/dark panels, uploaded backgrounds, picture dimming and panel opacity. Open You → Appearance & themes.

- Vibe Mode animal reactions: 19 curated user-supplied pictures with original, image-specific brainrot captions in a Daily Vibe card, a browsable gallery and opt-in lighthearted coach replies. Images are hidden when Vibe Mode is off; medical cautions and failed replies do not receive chat reaction images; casual food banter may include a reaction beside factual food guidance.

## Run locally

Serve the editable `dist/` files:

```sh
python scripts/build-worker.py
node scripts/preview.mjs
```

Open http://127.0.0.1:4174/. Sign in to an existing online account or continue as a guest. Google sign-in returns to the hosted app. Guest data stays in this browser. Cloud accounts keep a device cache for offline use; protect browser access on shared devices.

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

Built-in coaches use the private OpenAI endpoint with a shared hosted key; Offline demo is an explicit alternative. Custom AI uses the configured chat-completions provider. The Pawan preset uses `https://api.pawan.krd/v1/chat/completions` and `pkrd/cosmosrp-2.1`.

The public hosted app keeps its configured Pawan key in the runtime secret `PKRD_API_KEY`. Leave the Pawan key field blank to use KainCheck’s same-origin server proxy. Hosted keys are never returned to browser clients. User-entered keys stay in tab memory and are sent directly to the selected provider.

Live replies depend on the provider's access rules, account status, model support, CORS configuration and usage limits. Photo recognition needs an image-capable model. Photos stay in memory and are discarded after logging.

## Real online accounts

**Google activation pending:** Supabase → Authentication → Sign In / Providers → Google currently has no Client ID or Client Secret and is disabled. Configure a Google Cloud Web OAuth client and save those credentials in Supabase; do not put the Client Secret in this repository. No SMTP setup is needed for the chosen Google flow.

Connected to **KainCheck** (`agttxkpvcesiiwqrjsze`) in **Evenpiercer**. The browser configuration is `dist/supabase-config.js`; it contains only the project URL and publishable key. The owner-only `kaincheck_user_state` table stores app state as JSON with optimistic revisions. RLS restricts SELECT, INSERT and UPDATE to `auth.uid() = user_id`; anonymous access is revoked. No service-role key is used.

Cloud saves are debounced. Failed saves remain queued on the device; reconnect or choose Retry cloud sync in Profile. If another device has newer data, the app stops writing and offers Use cloud version, retaining the unsynced device copy as a browser-storage backup. Reopen/sign in on a second device to load the latest cloud state. This version does not provide live multi-device merging.

Existing local demo accounts are not converted to Supabase accounts. Your first Google sign-in creates an online account; existing guest/demo profiles and chats are not uploaded automatically. AI API keys stay in tab memory or the existing private hosting secret, outside the cloud profile record.

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the applied migration, dashboard settings and Google provider activation and remaining live consent verification. The existing owner-private Site access gate is separate from Supabase login. Other people cannot open this Site until its hosting audience is explicitly changed.

Nutrition uses the exact selected reference variant where available; missing values stay unknown. Photos cannot measure nutrient composition. Prices, weekly history and calorie targets elsewhere in this prototype remain illustrative. Platinum ++ billing is simulated; no payments are collected.

Vibe Mode uses contextual brainrot and clearly signposted sarcasm. Casual “healthiest food” hype can show the user-supplied glam pigeon; the coach immediately gives the factual answer in the same message. Personal health risks and food safety questions use a serious tone.

## Windows launcher and project files

Double-click `Launch_KainCheck.bat` to open the hosted app in your default browser. See `START_HERE.md` for the local document and presentation folder layout. `project-files/` contains local copies of deliverables and QA records and is excluded from Git.
