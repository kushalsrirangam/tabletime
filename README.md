# TableTime Staff

TableTime Staff is a cross-platform restaurant workforce app for scheduling, attendance, breaks, requests, and team operations. One Expo SDK 57 codebase runs on Android, iOS, and the web.

[Open the production web app](https://tabletime-3qn4.vercel.app) · [Privacy](https://tabletime-3qn4.vercel.app/privacy) · [Account deletion](https://tabletime-3qn4.vercel.app/delete-account)

## Product capabilities

- Secure owner, manager, and employee accounts with database-derived roles
- Multi-restaurant PostgreSQL isolation through Supabase Row Level Security
- Server-authoritative clock-in, clock-out, and break tracking
- Weekly scheduling with drafts, publishing, timezone-aware display, and employee-only visibility
- Employee add/edit, location, pay-rate, invitation, and activation controls
- Employee time-off requests with audited manager approval or decline
- Realtime workspace refresh, retry/backoff recovery, and visible sync health
- Self-service account deletion with reauthentication and owner safeguards
- Responsive manager and employee experiences for phone, tablet, and web

## Production architecture

- **Client:** Expo 57, React Native 0.86, React 19, TypeScript
- **Backend:** Supabase Auth, PostgreSQL, RLS, RPCs, Edge Functions, and Realtime
- **Web hosting:** Vercel with HTTPS, CSP, HSTS, SPA legal routes, and Git deployments
- **Native delivery:** EAS Build profiles for Android APK/AAB and iOS IPA
- **Security:** tenant-scoped data, server timestamps, narrow privileged functions, audit events, protected deletion, no service-role key in the client

The public Supabase URL and publishable key are client-safe configuration. Secret/service-role keys must never be added to Expo, Vercel client variables, or Git.

## Run locally

Use the supported Node release from `.node-version` or `.nvmrc`:

```bash
npm ci
npm run web
```

Without Supabase environment variables, TableTime clearly runs in local demo mode. With `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, it requires a real Supabase session and loads the authenticated restaurant workspace.

## Release verification

```bash
npm run release:check
```

The release gate runs strict TypeScript, Expo Doctor, a production web export, and rejects high/critical dependency findings. GitHub Actions repeats the same checks on every push to `main` and every pull request using Node 22.13.

## Backend and store documentation

- Database migrations and Edge Functions: `supabase/`
- Store listing, privacy, data-safety, review, and release notes: `docs/store/`
- Permanent verified progress, failures, and next actions: `PROJECT_STATUS.md`

Native store submission still requires the owner's Expo, Apple Developer, and Google Play accounts plus final legal/support details. Credentials and recovery codes must stay outside the repository.
