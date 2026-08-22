# TableTime project status

Last updated: August 22, 2026

This is the permanent project checkpoint. Read it before development work and update it after every task.

## Current overall progress

Approximately **86% complete**.

- Design and interactive MVP: **98%**
- Database foundation: **100%**
- Live backend connection: **98%**
- Advanced restaurant features: **34%**
- Store publication: **25%**

## Completed and verified

- Expo/React Native application for Android, iOS, and web
- Responsive manager and employee layouts
- Manager dashboard and daily floor overview
- Clock-in, clock-out, break controls, and punch history in demo mode
- Weekly schedule interface
- Editable draft shift creation and schedule publishing in demo mode
- Employee directory, search, roles, and weekly-hour display
- Structured time-off requests and manager approval/decline flows
- Versioned local persistence for demo data
- Supabase client pinned and configured for Expo
- Authentication session provider, login screen, and logout controls
- Automatic authentication gate when backend variables are configured
- Clear local demo mode when backend variables are absent
- Initial multi-tenant PostgreSQL migration
- RLS policies for organization isolation
- Server-authoritative clock-in and clock-out database functions
- Composite foreign keys preventing cross-organization references
- Dedicated Supabase project created: `TableTime` (`eaguhqtgvtoowmmhypll`) in `us-east-2` at **$0 monthly**
- Initial schema and hardening migrations applied successfully to the TableTime cloud database
- Cloud catalog verified: 10 application tables, RLS enabled on all 10, 27 access policies, and 2 clock RPCs
- Anonymous execution of clock-in and clock-out RPCs explicitly revoked and verified
- Ten covering indexes added for tenant-scoped foreign keys and joins
- Overlapping manager RLS policies replaced with operation-specific policies
- Supabase security and performance advisors rerun after hardening
- Generated cloud database TypeScript types added to `src/lib/database.types.ts`
- Supabase client connected to TableTime with a client-safe publishable key and typed as `Database`
- Local `.env.local` configuration created and confirmed excluded by Git
- Owner account creation added to the authentication screen with email-confirmation handling
- Membership-aware auth gate routes existing members into the app and new owners into setup
- Responsive first-owner onboarding screen added for restaurant, location, owner profile, address, job title, and timezone
- Atomic `bootstrap_owner` cloud RPC creates the organization, location, owner membership, profile, employee record, and audit event in one transaction
- Owner bootstrap prevents duplicate setup for the same account with a transaction-scoped advisory lock and membership check
- Owner bootstrap anonymous access is revoked and verified; authenticated access and empty `search_path` are verified
- Generated database types refreshed to include the owner onboarding RPC
- Cloud migration history verified with `initial_workforce_schema`, `harden_rls_and_indexes`, and `add_owner_onboarding`
- Authenticated workspace loader now reads membership, organization, employee, profile, and primary location through RLS-protected queries
- Cloud roles are derived from the database membership (`owner`, `manager`, or `employee`) rather than user-editable metadata
- Owner and manager database roles map to manager capabilities; employee memberships hide manager-only navigation
- Demo manager/employee role switch is removed for configured cloud accounts and retained only in explicit demo mode
- App shell now displays the real restaurant, primary location, employee name, initials, and job title
- Manager dashboard greeting, restaurant name, date, and timezone now come from the live workspace
- Workspace loading has clear retry, sign-out, missing-membership onboarding, and invalid-role states
- Configured cloud accounts now load employees, upcoming shifts, and recent time entries from Supabase instead of demo records
- Live team directory displays database names, emails, job titles, active punch status, and recorded hours for the last seven days
- Live manager dashboard uses the cloud team, punch status, labor hours, and schedule data
- Live schedules are formatted in the restaurant timezone and show database draft/published status
- Managers can create timezone-aware draft shifts and publish drafts to the cloud database
- Schedule totals now use real shift durations and draft counts rather than fixed demo numbers
- Team and schedule screens include loading, empty, error, and retry states
- Employee shift RLS tightened: employees can read only their own published shifts; owners/managers retain full schedule access
- `restrict_employee_shift_visibility` migration applied and its exact SELECT policy verified in the cloud catalog
- Supabase security and performance advisors rerun with no new issues after schedule-policy hardening
- Expo Doctor: 18/18 checks passed
- TypeScript validation passed
- Production web export passed
- Git repository published to `https://github.com/kushalsrirangam/tabletime.git` on branch `main`
- Initial GitHub commit `9d2b0d0` pushed successfully with Git Credential Manager
- Vercel production project creation accepted as `tabletime`; deployment `dpl_BAqzfwYW5dLBu6gNxTAoZcQZ5e2E` was assigned a production deployment URL
- GitHub OAuth for Vercel completed and repository `kushalsrirangam/tabletime` linked to Vercel project `tabletime-3qn4`
- Public production site deployed and verified at `https://tabletime-3qn4.vercel.app`
- Production deployment `dpl_FVcXTajwNnJrNbqMNK2LrqQbYk3V` reached `Ready` in 31 seconds from Git commit `6b2e200`
- Vercel Production and Preview environments configured with the client-safe `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; no service-role or secret key was uploaded
- Public site verification returned HTTP 200 with title `TableTime`
- Browser verification confirmed the Supabase-backed sign-in/create-restaurant screen renders instead of demo mode, with no console errors or warnings
- Signed-in workers now load their latest 20 RLS-protected time entries from Supabase, including an open punch outside the seven-day team-stat window
- The active shift is derived from the authenticated workspace employee instead of the demo employee ID
- Clock-in and clock-out actions now call the verified `clock_in` and `clock_out` Supabase RPCs and refresh server-authoritative punch data after completion
- Clock actions prevent duplicate submissions and expose clear loading, session, employee-assignment, already-clocked-in, no-open-shift, and network error states
- The time-clock and dashboard use the live restaurant location and timezone for punch labels and history
- Live punch history includes loading, empty, error, and retry states; demo mode retains its local clock behavior
- The unsaved demo break control is hidden for configured cloud accounts until a dedicated live break write path exists
- React component quality review passed for async flow, timer state, accessibility alerts, and render behavior
- Managers can add live employee roster records with name, work email, phone, job title, hourly rate, primary location, and employment status
- Managers can edit existing employee details and activate or deactivate staff from the responsive team screen
- Team search now covers name, email, job title, and location; status filters cover active, invited, and inactive employees
- Inactive employees remain visible for management and historical integrity but are excluded from active dashboard counts, labor totals, and new-shift selection
- Live employee and location reads now include all roster statuses and typed workforce details; demo add/edit behavior remains locally persistent
- Employee records use deactivation instead of destructive deletion so schedule, punch, and request history remains intact
- Normalized employee work emails are unique per restaurant and employee name, job title, email, and phone constraints are enforced in Postgres
- Authenticated employee writes are restricted to approved workforce columns; public clients cannot change linked Auth user IDs, tenant ownership, database IDs, or timestamps
- The signed-in manager cannot deactivate their own connected employee profile; another authorized manager can manage that record
- Cloud migrations `add_employee_management_safeguards` and `restrict_employee_write_columns` applied and their constraints, index, RLS policy, grants, and migration history verified
- Transactional cloud verification confirmed valid employee insertion, case-insensitive duplicate-email rejection, invalid-email rejection, blocked employee deletion, and blocked Auth-user reassignment; all test rows were rolled back
- Supabase Security and Performance Advisors rerun after employee-management hardening with no new warnings
- Employee roster privacy tightened so employees can read only their own workforce row and membership; owners/managers retain restaurant-wide access
- Cloud migration `restrict_employee_and_membership_visibility` applied and its two replacement SELECT policies verified against authenticated manager and employee identities
- Two email-confirmed test identities created safely through the authenticated Supabase dashboard; their passwords are intentionally not stored in Git or this status file
- An isolated `TableTime Test Restaurant` workspace now contains one manager, one employee, one location, and two published sample shifts
- New-user profile trigger verified with both real Auth identities
- Transactional RLS verification passed: the manager could read 2 memberships, 2 employee rows, and 2 shifts, while the employee could read only their own membership, employee row, and published shift
- Live browser login passed for both roles on the Vercel production app
- Manager browser verification confirmed real workspace identity, both roster members, hourly workforce data access, and employee edit controls
- Employee browser verification confirmed real workspace identity, no Team management navigation, and exactly one personal published shift totaling 5 hours
- Post-test verification passed: TypeScript produced no errors, and the production HTML and JavaScript bundle both returned HTTP 200
- The inactive free-tier Supabase project was restored on August 22, 2026 and verified back in `ACTIVE_HEALTHY` status with both Auth users and all test workspace data intact
- Real employee login succeeded again after database restoration, with the employee workspace and location loaded from Supabase
- Live clock-in verification passed through the production app: Taylor Employee created a server-authoritative `mobile` punch at Main Test Location and the dashboard changed immediately to `Clocked in`
- The open punch appeared in the Time clock screen as `1:30 PM – Now`, and the database confirmed exactly one open row with the authenticated employee and location
- Live clock-out verification passed through the production app: the same row received a server timestamp 25 seconds after clock-in and the database confirmed zero remaining open entries
- Employee RLS verification confirmed the authenticated employee could read the completed personal punch while it remained isolated through the existing time-entry policy
- A full production-page reload preserved the signed-in session, off-shift state, and completed `1:30 PM – 1:31 PM` personal punch history with no browser console errors or warnings
- The production browser is left signed in as Taylor Employee on the verified Time clock screen
- Secure employee invitations are now initiated from the live employee editor only after an employee record and work email have been saved
- The `invite-employee` Supabase Edge Function is deployed as active version 2 with JWT verification enabled, strict manager/owner membership checks, employee/email validation, a production/local origin allowlist, and no service-role credential in the client
- A direct public request to the deployed invitation endpoint returned HTTP 401, confirming the platform JWT guard blocks unauthenticated callers before invitation logic runs
- Auth-account creation and employee linking now finish through the atomic `finalize_employee_invitation` database function; only the `service_role` can execute it, while `anon` and `authenticated` execution are both revoked and verified
- Invitation linking creates the employee membership, marks the roster record as invited, and records an audit event in one transaction; failed finalization triggers deletion of the newly created Auth user
- Invited employees now receive a dedicated password-completion screen that handles Supabase invite tokens on web and native deep links, updates the password, activates only the employee row connected to `auth.uid()`, and clears tokens from the browser URL
- The idempotent `accept_employee_invitation` RPC is restricted to authenticated users, rejects missing/inactive/unlinked employees, and passed a real authenticated rollback test against the active test employee
- Expo Linking `~57.0.7` was added, the existing `tabletime` native URL scheme was retained, and Expo was aligned to SDK 57 patch `~57.0.15`
- Cloud migration `add_employee_invitations` applied successfully; generated database types match both new RPCs and cloud migration history includes the new migration
- TypeScript validation and the production web export pass after the invitation workflow changes
- Expo Doctor initially identified the older Expo patch and duplicate `expo-constants`; after the SDK 57 patch alignment, all 18/18 checks pass
- React quality review passed for the invitation provider, link listener cleanup, async action states, accessible alerts/buttons, and manager invitation controls
- Supabase Security and Performance Advisors were rerun after the invitation migration; the only new security warning is the intentional, narrow authenticated invitation-acceptance RPC
- Secure invitation commit `4d143de` was pushed to GitHub `main`; the linked Vercel production site returned HTTP 200 for both HTML and JavaScript, and the public bundle contains the new `Send secure invite` and `Activate account` interfaces
- Permanent continuity rule added to `AGENTS.md`
- This status file is required to be updated after every development task

## Built but not yet verified with real application users

- End-to-end owner onboarding and owner-specific RLS behavior
- Owner sign-up, email confirmation, and bootstrap using a real user account
- Live request reads from the app
- Live workspace identity and role loading for an owner account
- Employee creation, editing, location assignment, pay updates, and activation/deactivation using a real owner or manager account
- Invitation email delivery, browser/mobile redirect, password setup, and final employee activation with a real newly invited account

## Failures and blockers

- The connected Vercel API tool still lists no projects even though the browser dashboard shows the verified `tabletime-3qn4` project and production deployment. Dashboard deployment and the public URL work correctly, but connector-based monitoring remains unavailable until the two Vercel sessions are reconciled.
- Docker Desktop's Linux engine returned an internal API error. Local Supabase still cannot start, although both migrations are now applied and verified in the dedicated cloud project.
- The pre-existing cloud project named `kushalsrirangam's Project` remains untouched.
- The free Supabase project automatically became `INACTIVE` after low activity, causing database timeouts and a failed production login until it was manually restored. It is healthy again, but an always-on paid plan or an explicit development wake-up/health-check process is required for reliable unattended availability.
- Supabase Security Advisor reports four intentional warnings because authenticated users can call the narrow `SECURITY DEFINER` owner-bootstrap, clock, and employee-invitation acceptance RPCs. Anonymous access is blocked, each function verifies `auth.uid()`, and the privileged operations are deliberately narrow. See the [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Supabase leaked-password protection is still disabled and should be enabled before launch. See the [password-security guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- Performance Advisor reports only unused-index informational notices. This is expected before realistic traffic; index usage must be reassessed after production-like usage. See the [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Breaks and requests remain demo/local because the database does not yet expose a break write RPC and request actions are not yet connected.
- Signed-in manager and employee navigation still shows the demo pending-request count of `2` because requests are not yet loaded from Supabase.
- Employee roster add/edit/deactivate is wired to the live database but still requires a real authenticated owner or manager test.
- Hosted Supabase Auth still needs its Site URL set to `https://tabletime-3qn4.vercel.app` and its redirect allowlist updated with `https://tabletime-3qn4.vercel.app/**` and `tabletime://invite`. The exact settings are committed in `supabase/config.toml`, but `supabase config push` failed because the local CLI has no Supabase access token, and the available dashboard browser session was signed out. Invitation email delivery and redirect acceptance cannot be verified until this one hosted setting is applied after Supabase sign-in.
- npm reports 10 moderate and 4 high issues in transitive Expo/Metro build tooling. A normal non-breaking `npm audit fix` was attempted but could not resolve the remaining advisories; the forced fix would perform an unsafe Expo downgrade, so it was not applied. The high findings are in Metro's build-time image parser, not the TableTime runtime or uploaded user content.
- Local Node.js is 24.0.2; React Native tooling requests 24.3+ or a supported Node 22 release. Builds currently pass, but Node should be upgraded before native release builds.

## Next work in order

1. Sign in to Supabase once, push or enter the committed Auth Site URL/redirect allowlist, then verify one complete invitation email and password-acceptance flow.
2. Connect requests and manager approvals to the live database, replacing the remaining demo request count.
3. Add secure break start/end RPCs and synchronize live break state.
4. Test employee add/edit/location/pay/status workflows through the manager UI, then test real owner onboarding.
5. Add Realtime updates plus resilient offline/retry handling and a clear health/recovery path for an inactive development database.
6. Decide between free-tier wake-up handling and an always-on Supabase plan before production launch.
7. Prepare native Android and iOS release builds, store assets, privacy disclosures, and store submissions after the live workflows are verified.

## Rule for future updates

Every completed task must add its verification result here. Every failure must remain listed until the underlying problem is fixed and verified.

Every final development-task response must show the current overall progress and the five category percentages: Design/MVP, Database foundation, Live backend, Advanced features, and Store publication.
