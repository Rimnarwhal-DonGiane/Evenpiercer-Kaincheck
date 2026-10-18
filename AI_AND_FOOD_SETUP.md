# OpenAI coaching and Filipino food checks

All six built-in KainCheck coaches use the shared server-side OpenAI Responses API, retaining their separate personalities, preferences and chat histories. Users can explicitly choose Offline demo in each built-in coach's settings. Custom/proxy characters can also choose **ChatGPT · OpenAI (KainCheck)** under Provider or proxy. The server uses their bounded character prompt, written appearance profile and selected response token limit; avatar images are not sent to OpenAI, and the server API key is never returned to the browser. Existing proxy providers retain their settings. This shared connection supports Max response tokens (16–1,400) and the client’s estimated Context size; unsupported sampling controls are explicitly disabled.

The default model is `gpt-6-luna`; `OPENAI_MODEL` can override it at deployment. The hosted `OPENAI_API_KEY` is a secret held by Sites, never returned by the new OpenAI endpoints or committed to this repository. Keep the existing owner-private Site access boundary: the shared paid API routes rely on it. A public deployment needs an appropriate authenticated quota/rate-limit design first. API billing is separate from a ChatGPT subscription. Requests use `store: false` and a bounded message history; see OpenAI's API data policies for provider retention.

The photo checker offers ChatGPT recognition by default, custom vision-provider configuration, and a clearly labeled preset demo. Photos are resized in memory. Analyze sends the selected image to the selected provider. The user confirms food identities, preparation variants and portions before logging. Raw photos are discarded, not saved in the food log or account state.

## Nutrition sources

This is a curated **39-entry Filipino food guide**, with **17 exact DOST-FNRI PhilFCT reference variants** and **24 separately licensed example food photos**. It is not the complete official PhilFCT database. See `data/NUTRITION_SOURCES.md`, the original reference JSON, and each food's report link. The records identify the underlying December 2019 release; later report-generation dates do not imply newer nutrient values.

Known composition values are per **100 g edible portion**. The editable serving multiplier scales that reference weight. A 100 g reference is not a typical bowl/cup or a recommended serving. Recipes, sauces, brand and actual edible weight change nutrients. Plain boiled munggo is separate from ginisang munggo; canned adobo is separate from homemade adobo. Foods lacking a verified record remain in the guide with null nutrients. Daily/plate totals are marked partial and never interpret missing values as zero. Existing older demo entries retain their original estimates.

High-sodium flags use the FDA adult label reference of 20% of 2,300 mg daily value, or 460 mg per selected serving. Three-times-a-day checks multiply the selected portion by three and compare it with the general WHO adult recommendation of less than 2,000 mg/day, while noting other meals/condiments and incomplete records. The app does not automatically ban foods eaten three times daily. Total sugar is not added/free sugar, and photo recognition does not measure hidden salt or sugar. Advice for children or prescribed conditions must follow appropriate clinician/dietitian guidance.

Photos are resized examples from Wikimedia Commons, not FNRI photos or nutrient evidence. Preserve `dist/food-photos/CREDITS.md`, `manifest.json`, per-photo author/source/license links, and ShareAlike terms on applicable photos.

## Rebuild and verification

```sh
python scripts/build-food-catalog.py
python scripts/update-cache.py
python scripts/build-worker.py
node scripts/validate-artifact.mjs
node tests/openai-worker.mjs
node scripts/preview.mjs
```

`tests/openai-worker.mjs` uses mocked upstream OpenAI responses. `tests/mobile-food-ai.cjs` exercises the browser's catalog, photos, sodium arithmetic, null handling, all six default coach routes, explicit offline mode, photo review/confirmation and mobile sizes using mocked AI responses. Live API checks must be recorded separately; passing mocked tests does not establish key validity, available model access or funded quota.

The source is in this Codex project's `mobile-app/` folder. Existing earlier mockup images remain in the project root.

## Everyday toolkit and desktop

The same URL adapts at 900 px to a desktop sidebar, dashboard panels, food cards, larger dialogs and coach workspace. Smaller screens retain the phone layout. Pantry, recipes, shopping items, food preferences and explicit memory notes live under `state.wellness` and use the existing account JSON sync; guests retain their local data. No new database tables are needed.

Pantry meal planning routes through the active coach with budget, pantry and food preferences; prices are estimates. Recipe estimates sum matching per-100-g catalog/label ingredients and divide by portions; missing values stay null. Enter sauces or seasonings manually when no matching reference exists. Recipes can be saved, edited, logged and converted to editable shopping entries; costs are entered by the user and unknown prices remain incomplete. Allergies guide coaching but do not certify catalog/photo safety.

The weekly review uses only dated food, movement and water records from the last seven local calendar days. Old undated demo records are excluded. Memory is a manually edited list of up to 12 notes; sharing is disabled by default. Disable or clear notes at any time. Recent chat history still provides context, and clearing saved notes cannot erase messages previously sent to a provider.
