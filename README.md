# TableTime

TableTime is a cross-platform restaurant workforce application for employee scheduling, attendance, requests, and daily floor visibility. The same Expo/React Native codebase runs on Android, iOS, and the web.

## Current MVP

- Responsive manager and employee experiences
- Live clock-in, clock-out, and break controls
- Locally persisted punch history
- Editable weekly team schedule with draft creation and publishing
- Employee directory with search and weekly-hour progress
- Structured time-off submission plus shift-swap and missed-punch approval flows
- Manager/employee role preview

The application currently uses representative local data and versioned on-device persistence so the complete workflow can be tested before committing to a paid backend. Production authentication, server-authoritative timestamps, push notifications, and payroll integrations belong in the backend phase.

## Backend mode

The project includes a Supabase/PostgreSQL foundation in `supabase/`. It isolates every row by organization with Row Level Security, keeps authorization roles in database memberships, and exposes narrow clock-in/out functions that generate timestamps on the server.

1. Create or choose a dedicated Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and publishable key. Never use a secret or service-role key in the app.
3. Link the project and apply the migration:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

When backend variables are present, TableTime requires a valid Supabase session. Without them, it clearly runs in local demo mode.

## Run locally

```bash
npm install
npm run web
```

For a phone, install Expo Go and run `npm start`, then scan the displayed QR code.

## Verification

```bash
npm run typecheck
npm run build:web
```

## Production architecture

Use a managed PostgreSQL database with organization-scoped authorization and immutable audit events. Clock endpoints must create timestamps on the server instead of accepting device-generated timestamps. Store timestamps in UTC and retain the restaurant timezone separately for display and labor-rule calculations.
