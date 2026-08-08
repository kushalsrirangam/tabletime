# TableTime project status

Last updated: August 8, 2026

This is the permanent project checkpoint. Read it before development work and update it after every task.

## Current overall progress

Approximately **81% complete**.

- Design and interactive MVP: **97%**
- Database foundation: **99%**
- Live backend connection: **91%**
- Advanced restaurant features: **24%**
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
- Permanent continuity rule added to `AGENTS.md`
- This status file is required to be updated after every development task

## Built but not yet verified with real application users

- End-to-end owner, manager, and employee RLS behavior
- Owner sign-up, email confirmation, and bootstrap using a real user account
- Successful clock-in and clock-out calls, authoritative refresh, and personal punch-history reads from an authenticated employee
- New-user profile trigger after the first real account is created
- Live schedule, team, punch, and request reads from the app
- Live workspace identity and role loading with a real authenticated account
- Employee creation, editing, location assignment, pay updates, and activation/deactivation using a real owner or manager account

## Failures and blockers

- The connected Vercel API tool still lists no projects even though the browser dashboard shows the verified `tabletime-3qn4` project and production deployment. Dashboard deployment and the public URL work correctly, but connector-based monitoring remains unavailable until the two Vercel sessions are reconciled.
- Docker Desktop's Linux engine returned an internal API error. Local Supabase still cannot start, although both migrations are now applied and verified in the dedicated cloud project.
- The pre-existing cloud project named `kushalsrirangam's Project` remains untouched.
- Supabase Security Advisor reports three intentional warnings because authenticated users can call the narrow `SECURITY DEFINER` owner-bootstrap and clock RPCs. Anonymous access is blocked, each function verifies `auth.uid()`, and the privileged operations are deliberately narrow. See the [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Performance Advisor reports only unused-index informational notices. This is expected while the new database is empty; index usage must be reassessed after realistic traffic. See the [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Clock-in, clock-out, and personal punch history are now wired to the live database but still require a real authenticated employee test. Breaks and requests remain demo/local because the database does not yet expose a break write RPC and request actions are not yet connected.
- Employee roster add/edit/deactivate is wired to the live database but still requires a real authenticated owner or manager test.
- Creating an employee roster record does not yet create an Auth account or send an invitation email. Secure invitations require a protected server-side Auth workflow; no service-role key is exposed in the app.
- npm reports 10 moderate issues in transitive Expo build tooling. The suggested forced fix would perform an unsafe Expo downgrade, so it was not applied.
- Local Node.js is 24.0.2; React Native tooling requests 24.3+ or a supported Node 22 release. Builds currently pass, but Node should be upgraded before native release builds.

## Next work in order

1. Add secure employee invitation emails and Auth-account linking through protected server-side code.
2. Connect requests and manager approvals to the live database.
3. Add secure break start/end RPCs and synchronize live break state.
4. Add Realtime updates plus resilient offline/retry handling.
5. Create real owner, manager, and employee accounts and run end-to-end onboarding, employee-management, clock, schedule, request, and tenant-isolation tests.
6. Prepare native Android and iOS release builds, store assets, privacy disclosures, and store submissions after the live workflows are verified.

## Rule for future updates

Every completed task must add its verification result here. Every failure must remain listed until the underlying problem is fixed and verified.

Every final development-task response must show the current overall progress and the five category percentages: Design/MVP, Database foundation, Live backend, Advanced features, and Store publication.
