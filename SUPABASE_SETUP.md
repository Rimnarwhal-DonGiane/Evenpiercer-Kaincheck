# Connect KainCheck to Supabase

GitHub stores KainCheck's code. Supabase will provide real accounts and cloud data. The app connects using its Supabase project URL and a publishable key.

## 1. Give the connected plugin access to evenpiercer

1. Open the Supabase plugin's connection settings and reconnect it.
2. Sign in to the Supabase account that belongs to the **evenpiercer** organization.
3. On the authorization screen, select **evenpiercer**, the organization containing the intended KainCheck project.
4. Ask the assistant to list organizations and projects again. It should see evenpiercer before any backend changes are made.

Current observed access exposes only **U-Matter / Travelmate**. That existing project is unrelated to this app and must not be reused without an explicit request.

Official connection guide: https://supabase.com/docs/guides/ai-tools/mcp

## 2. Select or create a Supabase project

Open https://supabase.com/dashboard, switch to **evenpiercer**, and select the KainCheck project. If the organization has no KainCheck project, choose **New project**, name it **KainCheck**, and select the plan and region you want. Review any quoted cost before creating it. Save the database password privately; the browser app does not need it.

The GitHub repository and Supabase project are separate resources. Linking GitHub for migration workflows is optional for email/password authentication.

## 3. Get the public application connection values

Open the project's **Connect** dialog and note:

- Project URL, such as `https://your-project-ref.supabase.co`.
- **Publishable key**, beginning with `sb_publishable_`.

Use a publishable key for browser code. Keep database passwords, personal access tokens, `service_role` keys, `sb_secret_` keys and AI-provider secrets out of the frontend and this public repository. Once plugin access works, the assistant can retrieve the project URL and publishable key without asking you to paste private credentials.

API key guide: https://supabase.com/docs/guides/api/api-keys

## 4. Configure email authentication

In **Authentication**, enable email/password sign-up. Keep email confirmation enabled and configure a suitable mail sender for real users. In **URL Configuration**, use this Site URL:

```text
https://kaincheck-mobile-demo-ginoki.snowydrake.chatgpt.site/
```

The app's actual confirmation/reset return paths must be added to the allowed redirect URLs when implemented. For local development, the current preview origin is `http://127.0.0.1:4174/`. Use exact deployed return URLs in production.

Password authentication: https://supabase.com/docs/guides/auth/passwords

Redirect configuration: https://supabase.com/docs/guides/auth/redirect-urls

## 5. Connect the app code

This step is pending project access. `dist/account.js` currently handles on-device demo accounts. Real integration must:

- Use the official Supabase client for sign-up, email confirmation, sign-in, session refresh and sign-out. Pin its package version and lockfile.
- Store usernames, profiles, meal logs, plans and coach chats in per-user cloud records.
- Enable row-level security and restrict records to the authenticated owner using `auth.uid()`. Update policies need both ownership checks and ownership-preserving `WITH CHECK` rules.
- Keep API keys and photos out of chat/profile exports unless explicitly intended.
- Keep guest/demo data separate; ask before importing existing local data into an online account.

Adding the URL/key to an environment file does not activate online accounts in the current code. The Supabase CLI setup snippet in `.github/linters.yml` also does not connect the app, deploy migrations or implement authentication by itself.

The hosted Site currently has its own owner-private access gate. Supabase authentication does not change that audience. Sharing the app with other people needs a separate, explicit hosting-access change.

## 6. Verify online behavior

Create a test account, confirm its email, sign out, and sign back in. Use a second browser/device to confirm the same profile loads. Test a second account to confirm it cannot read the first account's records. Check password reset, session expiry and failed sign-in. Run Supabase's security advisors after applying database policies.

Setup is complete only after these live checks pass; the current on-device demo flow is not evidence that Supabase is connected.
