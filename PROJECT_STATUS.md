# TableTime project status

Last updated: August 23, 2026

This is the permanent project checkpoint. Read it before development work and update it after every task.

## Current overall progress

Approximately **98% complete**.

- Design and interactive MVP: **100%**
- Database foundation: **100%**
- Live backend connection: **100%**
- Advanced restaurant features: **92%**
- Store publication: **90%**

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
- Employee time-off submissions now load from and write to `staff_requests` in Supabase; manager request lists and pending badges are derived from live RLS-scoped rows instead of demo data
- The audited `submit_time_off_request` RPC validates restaurant membership, active employment, ISO date ranges, a 32-day maximum, note length, and exact duplicate pending requests before inserting
- The audited `review_staff_request` RPC accepts only `approved` or `declined`, locks the target row, verifies owner/manager authority in the same restaurant, and records reviewer identity and review time
- Direct authenticated INSERT and UPDATE privileges and the stale broad write policy were removed from `staff_requests`; request writes now use only the two narrow RPCs while the existing own-or-manager SELECT policy remains active
- Hosted rollback verification passed for employee submission, manager approval, reviewer attribution, two audit events, direct-table-write denial, employee-review denial, and duplicate-request denial; zero test request rows persisted
- The hosted request functions are verified as `SECURITY DEFINER` with an empty `search_path`; the duplicate partial index and sole read policy are present, and generated RPC types match the live database
- Request UI now provides separate start/end dates, validation, action loading locks, accessible errors, retry behavior, cancelled-state rendering, and live employee identity lookup while preserving demo-mode behavior
- Post-request-workflow TypeScript validation and production web export both pass
- Live break state now loads from `break_entries`, survives refreshes, updates the employee on-shift state, and contributes recorded break minutes to punch history
- Authenticated employees can start and end breaks through narrow `start_break` and `end_break` RPCs; both require an active employee with an open time entry, use server timestamps, and emit audit events
- A partial unique index guarantees one open break per time entry, providing database-level duplicate protection even if two devices submit simultaneously
- `clock_out` now closes an in-progress break at the exact clock-out timestamp and records an `ended_on_clock_out` audit event so closed shifts cannot retain impossible open breaks
- Anonymous break RPC execution is revoked; authenticated access, empty `search_path`, security-definer configuration, and zero persisted test rows were verified in the hosted catalog
- Hosted rollback tests passed for normal break start/end, two audit events, duplicate-start rejection, no-open-shift rejection, and automatic break closure on clock-out with matching timestamps
- The first break migration attempt failed atomically because PostgreSQL does not allow a composite row variable in a multiple-item `INTO` list; the lookup was split safely, the corrected migration applied, and no partial schema changes remained
- Live and demo time-clock interfaces now share start/end-break controls with action locks, accessible errors, synchronized status, and recorded break minutes; the dashboard also blocks clock actions while a break change is in flight
- Supabase Security and Performance Advisors, TypeScript validation, and the production web export were rerun after the break workflow; no unintended new advisor findings or code/build failures were introduced
- Git commit `b158a23` (`Add live requests and break tracking`) was pushed to GitHub `main`; Vercel automatically deployed it and the production HTML and new JavaScript bundle both returned HTTP 200
- The deployed production bundle contains the live request and break interfaces; a full employee-session reload confirmed the new ISO start/end-date request form, no demo request rows, and no browser console errors or warnings
- A first Realtime implementation used Supabase's recommended private Broadcast architecture with organization topics and generic invalidation payloads that intentionally excluded employee, pay, request, and punch row contents
- Hosted verification found the restored project has zero partitions under the platform-owned `realtime.messages` table; direct and trigger-driven Broadcast sends were silently discarded with `no partition of relation "messages" found for row`
- The unavailable Broadcast trigger, function, and authorization policy were removed cleanly; verification confirms no leftover Broadcast objects
- The reliable fallback uses RLS-protected Postgres Changes for organizations, memberships, locations, employees, shifts, time entries, breaks, and requests, all verified in the `supabase_realtime` publication
- The app now maintains one workspace Realtime channel, filters organization-scoped tables, debounces bursts into one silent refresh, refreshes unfiltered break events through RLS, cleans up listeners/channels, and reauthenticates Realtime with the current session token
- A `LIVE`/`SYNCING`/`RETRYING` indicator exposes connection state without developer tools, while a global recovery banner preserves the last successful data, reports the last sync time, and offers manual refresh
- Workspace and data loading now retry transient network/timeout/5xx failures twice with bounded backoff, show a clear database-waking message, and resynchronize silently when the app returns to the foreground
- Configured cloud workspaces clear all demo employees, locations, shifts, requests, punches, and breaks before the first live load, preventing demo data from appearing during a backend outage
- Realtime and foreground refreshes use silent loading to avoid hiding visible schedules/rosters during background synchronization
- The first post-Realtime typecheck caught a direct Pressable handler that no longer matched the new optional silent-refresh argument; the handler was wrapped correctly and the subsequent typecheck passed
- Production-browser Realtime verification passed: the employee session reached `LIVE`, a temporary second-client published shift appeared without a reload, and the exact test shift was removed afterward
- Supabase Postgres Changes does not deliver filtered DELETE events; the supported TableTime workflows use status/soft-delete updates, while rare administrative hard deletes require foreground or manual refresh
- Expo SDK 57 release configuration now includes a unique `com.kushalsrirangam.tabletime` Android/iOS identifier, version 1.0.0 build versions, EAS preview/production profiles, remote build-number management, and draft/internal submission profiles
- The default Expo placeholder artwork was replaced with generated TableTime restaurant-clock branding: a production app icon, Android adaptive foreground, web favicon, and native splash source
- `expo-splash-screen` `~57.0.7` was installed from the exact SDK 57 documentation and its recommended config plugin is active with the TableTime brand colors
- Store listing copy, release notes, privacy/data-safety disclosures, review instructions, Terms, and a native release checklist are now versioned under `docs/store`
- Public `/privacy`, `/terms`, and `/delete-account` SPA routes render without authentication; sign-in and Account screens expose the relevant links
- Vercel now has an SPA fallback for direct legal URLs plus CSP, HSTS, frame-denial, MIME-sniffing, referrer, and unused-permission headers
- Apple/Google account-deletion requirements were reviewed against current first-party policy documentation and an easy-to-find signed-in Account screen was added
- Self-service deletion requires password reauthentication, an explicit `DELETE` confirmation, a JWT-protected Edge Function, and a service-role-only database preparation function
- Account deletion closes open attendance state, removes membership/profile access, de-identifies employee PII, and records an audit event while preserving legally relevant restaurant history; a sole owner with remaining staff must transfer ownership first
- Hosted rollback verification passed for employee deletion preparation, membership/profile removal, workforce de-identification, audit creation, clean restoration, and the sole-owner safeguard; anonymous/authenticated database execution is denied and service-role execution is allowed
- Deployed `delete-account` Edge Function version 1 is `ACTIVE` with JWT verification enabled, and an unauthenticated production POST returned HTTP 401
- TypeScript, Expo public-config resolution, and the production web export pass after the release/legal/account-control work; the local Privacy and deletion routes rendered correctly in the browser
- Expo Doctor now completes successfully with **21/21 checks passed** after the release dependencies and native configuration changes
- An isolated Android prebuild completed successfully without modifying the repository; its generated manifest retained only Internet access, applied explicit removal rules for storage/overlay/vibration permissions, disabled app-data backup, and included the `tabletime` invite deep link
- EAS preview and production builders are pinned to supported Node 22.13.0, avoiding the local Node 24.0.2 engine mismatch in release infrastructure
- Release commit `5b3527c` (`Prepare native release and account controls`) is pushed to GitHub `main`, and the linked Vercel project deployed the commit successfully
- Production serves the release bundle `index-0a921e894f56ebfb3b25a0c1a7fa6377.js`; direct `/privacy`, `/terms`, and `/delete-account` requests resolve through the SPA fallback over HTTPS
- Production response headers were verified for the configured Content Security Policy, HSTS, frame denial, MIME-sniffing prevention, referrer policy, and permissions policy
- Production employee-session verification confirmed the Account screen displays the authenticated employee, restaurant, role, position, and `LIVE` state; the deletion confirmation remained disabled until all safeguards were satisfied and was closed without changing the test account
- Supabase Security and Performance Advisors were rerun after self-service deletion; no unintended finding was introduced, and the remaining security findings are the documented narrow authenticated RPCs plus disabled leaked-password protection
- The isolated Android prebuild's temporary directory was removed after verification; Metro briefly logged an `ENOENT` for that watched diagnostic path, then the local diagnostic server was stopped. No source, export, or production deployment was affected
- EAS CLI authentication status was checked and returned `Not logged in`; official Expo documentation confirms browser-based `eas login` is the default and no password needs to be shared with the project or Codex
- A top-level production error boundary now preserves a safe recovery path for unexpected render failures, shows a shareable incident ID, avoids exposing internal error details to workers, and logs diagnostic context for future monitoring integration
- Supported Node 22.13.0 is pinned in `.node-version`, `.nvmrc`, the package engine declaration, and every EAS profile so local, CI, and cloud release environments can converge on the same runtime
- React Native's duplicate Metro 0.84.4 build tool was aligned to Expo's patched 0.84.5 release; `npm audit` dropped from 4 high plus 11 moderate findings to **0 high/critical plus 11 moderate** Expo/Xcode build-tool findings
- The remaining moderate dependency advisories have no safe SDK 57 upgrade path: npm proposes a breaking downgrade to Expo 46 / splash screen 55, so the unsafe forced fix remains intentionally rejected
- A repeatable `npm run release:check` gate now runs strict TypeScript, Expo Doctor, the production web export, and a high/critical dependency audit; the complete gate passed locally
- GitHub Actions release quality and dependency-review workflows were added with least-privilege read permissions, Node 22.13.0, locked `npm ci`, concurrency cancellation, timeouts, and high-severity enforcement
- The GitHub README now documents the live application, production architecture, verified product capabilities, security model, release command, public legal URLs, and honest native-store prerequisites
- An Expo EAS project was created by the owner and its exact project ID supplied; local linking remains pending only until the secure Expo/GitHub browser authorization returns to the waiting CLI
- GitHub commit `d9ae7a6` (`Add release quality gate and recovery`) is pushed to `main`; its first `Release quality` workflow run `32597903723` completed successfully
- Vercel automatically deployed commit `d9ae7a6` as production bundle `index-56c67870a29dd7590c8308481387c4b7.js`; the bundle and `/privacy` returned HTTP 200 and the deployed code contains the new recovery interface
- The first production-bundle verification script accidentally used PowerShell's reserved case-insensitive `$HOME` variable and failed before resolving the bundle name; it was corrected to task-specific variable names and the complete verification passed
- Expo CLI browser authorization completed for account `kushalking`, with owner access to both the personal account and `kushalkings-team`
- The application is linked to EAS project `@kushalkings-team/clockin` with project ID `987d4ad1-dce6-4e49-b43a-bfbe89c8820c`; `eas project:info` verifies the exact owner, slug, and ID
- The first `eas init` prompt was cancelled after exposing that the owner-created remote slug `clockin` did not match local slug `tabletime`; EAS has no project-edit CLI command, so the internal local slug was aligned to `clockin` while the public name and both store identifiers remain TableTime Staff / `com.kushalsrirangam.tabletime`
- EAS Preview and Production environments now contain only the client-safe Supabase URL and publishable key; both build profiles explicitly select their matching environment, and `eas config` verified the Android preview APK configuration with Node 22.13.0
- Self-service password recovery now follows Supabase's documented reset-email flow, handles recovery tokens separately from employee invitations, requires matching 8-character passwords, updates the password only inside an authenticated recovery session, and clears recovery URLs/session state safely
- The reset-email confirmation uses non-enumerating language so the UI does not disclose whether an account exists; rate-limit, network, expired-link, and missing-session errors have stable user-facing messages
- Supabase's current changelog and password recovery reference were reviewed before implementation; no hosted breaking change affects the client-side implicit recovery flow, while the June 2026 Free-tier email-template restriction is documented for later SMTP decisions
- Local browser verification passed for the Forgot password entry point, disabled/enabled form validation, and incomplete/expired recovery-link screen; the browser reported only expected React development notices and no errors or warnings
- The first local recovery browser-test launch failed because Expo attempted to open the restricted Windows system browser; the server was restarted without the auto-open flag, the in-app test completed, and Metro then stopped cleanly
- React best-practices review passed for the recovery provider and screens: explicit async actions, single deep-link listener cleanup, accessible controls and alerts, stable callbacks, and no nested component definitions or render-time side effects
- The complete release gate passed after EAS linking and password recovery: strict TypeScript, Expo Doctor 18/18, production web export, and zero high/critical dependency findings; the iOS production EAS configuration also resolved successfully with the production environment
- EAS generated and securely retained a new Android signing keystore; no keystore password or private key was written to the repository or local status notes
- Android preview build `4a21820a-cc01-4be2-ac6e-44111187852e` finished successfully for SDK 57, app version 1.0.0/build 1, package `com.kushalsrirangam.tabletime`, and Git commit `3dae860`
- The signed preview APK is available from the [stable Expo build page](https://expo.dev/accounts/kushalkings-team/projects/clockin/builds/4a21820a-cc01-4be2-ac6e-44111187852e); its download followed the expected redirects and returned HTTP 200 with a 72,737,588-byte Android artifact
- No Android emulator was connected in this workspace, so the CLI install prompt was declined after the cloud artifact completed; installation and branded splash/adaptive-icon inspection remain a physical-device verification item
- A concurrent sandboxed EAS status lookup encountered a local npm-cache/network `EACCES`; the approved EAS query retry succeeded and independently confirmed the build metadata and final `FINISHED` state
- Redundant local Android `versionCode` and iOS `buildNumber` values were removed because EAS remote app-version management is authoritative; production `eas config` resolves successfully for both platforms with `autoIncrement` and Node 22.13.0
- The first sandboxed release-gate run after the version cleanup was blocked when Expo Doctor could not access the npm cache/network; the approved retry passed strict TypeScript, Expo Doctor 18/18, web export, and the zero-high/critical audit threshold
- GitHub Actions `Release quality` run `32599392855` passed for checkpoint commit `f6f8885`, and GitHub reports successful Vercel deployment checks for both linked Vercel project records
- The first non-interactive iOS build preflight stopped before Apple credential resolution because the verified `app.json` cleanup had not yet been committed; no iOS build or credential change occurred, and committing the clean configuration is the required retry step
- Android production build `727e0ac9-4375-4664-9541-b87448dbe1a6` finished successfully as a Play Store AAB for SDK 57, app version 1.0.0/versionCode 2, package `com.kushalsrirangam.tabletime`, and the EAS-managed production keystore
- The signed production bundle is available from the [stable Expo build page](https://expo.dev/accounts/kushalkings-team/projects/clockin/builds/727e0ac9-4375-4664-9541-b87448dbe1a6); its download followed the expected redirects and returned HTTP 200 with a 50,734,218-byte AAB
- Clean iOS production preflight initialized remote buildNumber 1 and reached remote-credential resolution, then stopped before upload/build because no Apple Distribution Certificate/provisioning credentials are configured; no Apple password was requested from the owner or written to the project
- The eight-page report at `output/pdf/TableTime_Project_Summary_and_Remaining_Work.pdf` was refreshed on August 23 with current 98/100/100/100/92/90 progress, the safe replacement Android builds, scheduled production health checks, rolling demo schedule, exact store-asset status, current blockers, and revised release roadmap; it contains no credentials
- The refreshed PDF's first render exposed an incorrect page-template carryover that darkened the inside pages; the template switch and alternating table backgrounds were corrected before delivery
- Refreshed PDF QA passed: Poppler rendered all eight A4 pages, individual visual inspection found no clipping, overlap, broken tables, or readability defects, text extraction found 15,353 characters with no empty pages, all required section headings were present, and eight link annotations were retained
- Repository attributes now mark PDF and PNG/JPEG assets as binary so Windows Git cannot apply text line-ending transformations that could corrupt store images or PDF cross-reference offsets
- The native release checklist was initially reconciled with cloud-build evidence; the later emulator launch test superseded that checkpoint by proving both pre-fix Android artifacts unsafe for release
- Official Android command-line tools were checksum-verified and installed into the existing SDK; an isolated Pixel 6 / Android 15 Google Play AVD was created, booted, and authorized with the existing local ADB key
- Installing the original signed preview APK on that emulator exposed a reproducible native-only crash (`Cannot read property 'pathname' of undefined`) that web checks could not detect; the same pre-fix code is present in the original production AAB, so both original artifacts are explicitly obsolete
- Public-document routing and authentication URL cleanup now require `Platform.OS === 'web'` before reading browser location/history, following the Expo SDK 57 platform guidance; the fix is committed and pushed as `132298c`
- The post-fix release gate passed strict TypeScript, Expo Doctor 18/18, production web export, and the zero-high/critical dependency threshold; React review found no new hook, render, accessibility, or performance issue
- Replacement Android preview build `414154eb-16bf-4230-8b51-ec936e4cd1ee` finished successfully from commit `132298c` for app version 1.0.0/build 2 and is available from its [stable Expo build page](https://expo.dev/accounts/kushalkings-team/projects/clockin/builds/414154eb-16bf-4230-8b51-ec936e4cd1ee)
- The replacement APK installed successfully on the Android 15 emulator, cold-launched its real `MainActivity` in 857 ms, remained the foreground process, rendered the complete branded Supabase-backed sign-in interface, and produced zero filtered `AndroidRuntime` or `ReactNativeJS` errors
- The 1080×2400 native login screen was visually inspected without clipping or broken layout and retained at `output/screenshots/android/tabletime-android-login.png`; the release checklist now marks Android emulator testing complete
- Replacement Android production build `60d824a4-afea-4c29-b56d-3184d7e67386` finished successfully from verified commit `210137b` as app version 1.0.0/versionCode 3 for `com.kushalsrirangam.tabletime`, superseding the unsafe versionCode 2 artifact; it is available from its [stable Expo build page](https://expo.dev/accounts/kushalkings-team/projects/clockin/builds/60d824a4-afea-4c29-b56d-3184d7e67386)
- The replacement AAB downloaded successfully at 50,733,627 bytes with SHA-256 `279AB6A155280CC1A513A531F8F0BA4758AC7A2AB68C3434C1D3F0C05837FA02`; its ZIP structure contains all required bundle/manifest/DEX entries and all 1,194 entries were readable
- JDK signature verification returned `jar verified`; the EAS-managed Android certificate is a normal self-signed 2048-bit RSA app-signing certificate valid through January 7, 2054, and no private signing material was exposed locally
- A least-privilege `Production health` GitHub Actions workflow now checks the production app, Privacy, Terms, account-deletion page, and Supabase Auth gateway every six hours and on manual dispatch; it has a five-minute timeout, concurrency cancellation, read-only permissions, and no application credential
- Local preflight for the scheduled health workflow passed with HTTP 200 for all four Vercel routes and the expected unauthenticated HTTP 401 from the reachable Supabase Auth gateway
- GitHub `Production health` run `32663413379` passed on its first pushed execution, and companion `Release quality` run `32663413377` also passed on the same commit; future failures remain visible in the repository Actions history and can use the owner's GitHub notification preferences
- Demo schedule fixtures now follow the current `America/Chicago` calendar week instead of expiring on hard-coded August dates; a clean local browser origin showed all eight shifts, 61.0 scheduled hours, and three drafts
- The complete local demo attendance sequence was reverified: clock in, start break, end break, and clock out all reached the expected final state and produced a completed punch entry
- Five Google Play phone screenshot drafts were prepared at 1080 x 1920 and five Apple iPhone 6.1-inch drafts at 1080 x 2340; exact dimensions and 24-bit RGB formats were verified and representative files passed visual inspection
- A Google Play app icon was prepared at 512 x 512 with alpha, and a generated TableTime Staff feature graphic was prepared at 1024 x 500 without alpha; exact dimensions/pixel formats and the final visual appearance were verified
- Store-asset source files, honest draft limitations, screenshot sequence/alt text, official specification links, and the exact feature-graphic generation prompt are recorded in `output/store-assets/README.md`
- The release gate passed again after the rolling demo-schedule fix: strict TypeScript, Expo Doctor 18/18, production web export, and zero high/critical dependency findings
- Expo Doctor initially failed in the sandbox because npm registry/cache access returned `EACCES`; the approved retry completed all 18 checks successfully
- Permanent continuity rule added to `AGENTS.md`
- This status file is required to be updated after every development task

## Built but not yet verified with real application users

- End-to-end owner onboarding and owner-specific RLS behavior
- Owner sign-up, email confirmation, and bootstrap using a real user account
- Production-browser request submission and manager review using the real test employee and manager accounts
- Production-browser live break start/end and refresh persistence using the real employee test account
- Live workspace identity and role loading for an owner account
- Employee creation, editing, location assignment, pay updates, and activation/deactivation using a real owner or manager account
- Invitation email delivery, browser/mobile redirect, password setup, and final employee activation with a real newly invited account
- Password-reset email delivery, browser/native redirect, password update, and restored sign-in with a real account
- A complete real-user deletion through the Edge Function is intentionally untested because it would permanently remove an existing test identity; use a disposable Auth identity for the final destructive E2E test
- Branded splash rendering and adaptive-icon masking on physical Android/iOS release builds; the adaptive Android launcher icon is verified on the emulator, while physical-device masking remains pending
- Replacement Android preview APK smoke testing on a physical Android device; Android 15 emulator smoke testing is complete
- Replacement Android production AAB versionCode 3 upload and closed/internal-track validation in Google Play; the earlier versionCode 2 artifact is obsolete and must not be uploaded
- Store screenshot drafts are correctly sized for listing planning but were captured from the local responsive web demo; final signed-native captures must replace them because the drafts contain demo-only role controls and labels

## Failures and blockers

- The connected Vercel API tool still lists no projects even though the browser dashboard shows the verified `tabletime-3qn4` project and production deployment. Dashboard deployment and the public URL work correctly, but connector-based monitoring remains unavailable until the two Vercel sessions are reconciled.
- Docker Desktop's Linux engine returned an internal API error. Local Supabase still cannot start, although both migrations are now applied and verified in the dedicated cloud project.
- The pre-existing cloud project named `kushalsrirangam's Project` remains untouched.
- The free Supabase project automatically became `INACTIVE` after low activity, causing database timeouts and a failed production login until it was manually restored. It is healthy again, but an always-on paid plan or an explicit development wake-up/health-check process is required for reliable unattended availability.
- Private Realtime Broadcast is currently unusable on the restored free project because the platform-owned `realtime.messages` table has no date partitions. TableTime now uses RLS-protected Postgres Changes successfully as a restaurant-scale fallback; revisit Broadcast only after Supabase restores automatic message partition management.
- Supabase Postgres Changes does not deliver organization-filtered hard-delete events. Supported user workflows use soft-delete/status updates, and foreground/manual refresh repairs rare administrative hard-delete state.
- Supabase Security Advisor reports eight intentional warnings because authenticated users can call the narrow `SECURITY DEFINER` owner-bootstrap, clock, break, employee-invitation acceptance, request-submission, and request-review RPCs. Anonymous access is blocked, each function verifies `auth.uid()`, and the privileged operations are deliberately narrow. See the [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Supabase leaked-password protection is still disabled. Current official documentation confirms it is available only on the Pro plan or above, so enabling it requires an explicit paid-plan decision; no subscription expense was started. See the [password-security guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- Performance Advisor reports only unused-index informational notices. This is expected before realistic traffic; index usage must be reassessed after production-like usage. See the [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Employee roster add/edit/deactivate is wired to the live database but still requires a real authenticated owner or manager test.
- Hosted Supabase Auth still needs its Site URL set to `https://tabletime-3qn4.vercel.app` and its redirect allowlist updated with `https://tabletime-3qn4.vercel.app/**`, `tabletime://invite`, and `tabletime://reset-password`. The exact settings are committed in `supabase/config.toml`, but `supabase config push` failed because the local CLI has no Supabase access token, and the available dashboard browser session was signed out. Invitation and password-recovery email redirects cannot be verified until this hosted setting is applied after Supabase sign-in.
- The Supabase connector independently verifies the TableTime project is `ACTIVE_HEALTHY` on Postgres 17.6.1. The exact hosted Auth URL Configuration page is open for the owner to complete private GitHub sign-in; no password, 2FA value, or persistent access token was requested or exposed.
- npm reports 11 moderate and **zero high/critical** issues in transitive Expo/Xcode build tooling. The patched Metro 0.84.5 update removed all four high findings. A forced fix would perform an unsafe Expo downgrade, so it was not applied.
- Local Node.js is 24.0.2; React Native tooling requests 24.3+ or a supported Node 22 release. Builds currently pass, but Node should be upgraded before native release builds.
- The plain PowerShell `npm` shim resolves through a stale roaming installation and failed to load its npm CLI module. The explicit supported `C:\Program Files\nodejs\npm.cmd` launcher and direct bundled Node commands work and passed the release gate; repair the stale shim before relying on unqualified `npm` commands.
- The first sandboxed `expo install expo-splash-screen` attempt failed with network `EACCES`; the approved network retry installed the exact SDK 57-compatible package successfully.
- A checksum-verified official Android SDK command-line tools package was installed into the existing SDK, and an isolated Pixel 6 / Android 15 Google Play emulator was created. The AVD manager emitted a non-fatal missing `devices.xml` warning, but the AVD registered, booted, and authorized successfully through the existing local ADB key.
- The signed preview APK installed successfully on the Android 15 emulator, and the branded adaptive launcher icon rendered correctly. Launch then exposed a reproducible native-only JavaScript crash: `TypeError: Cannot read property 'pathname' of undefined` in `App`.
- The native crash was traced to web route helpers that checked only for `window`; React Native defines a `window` object without `window.location`. Both public-document routing and authentication URL cleanup now guard on `Platform.OS === 'web'`, following the Expo SDK 57 platform guidance.
- The post-fix release gate passed: strict TypeScript, Expo Doctor 18/18, production web export, and zero high/critical dependency findings. React quality review found no new hooks, render, accessibility, or performance issue in the platform guards.
- Android preview build `4a21820a-cc01-4be2-ac6e-44111187852e` and production build `727e0ac9-4375-4664-9541-b87448dbe1a6` are obsolete because they contain the pre-fix native crash and must not be uploaded to a store. Both have now been replaced; the new preview passed emulator verification and the new production AAB passed structure and signature checks.
- “TableTime” is already used by unrelated apps in both stores, so the release display/listing name is now `TableTime Staff`; final trademark/name clearance remains the owner's responsibility.
- iOS production building is blocked at Apple credential setup: EAS has no Distribution Certificate/provisioning credentials, and non-interactive setup cannot create them. The owner must use a paid Apple Developer account in one interactive EAS credentials/build session; the Apple password and 2FA code must be entered privately and must never be sent in chat or committed.
- Store publication still needs a real public support email, legal developer/company name and address, Apple/Google developer accounts, store credentials, screenshots, an iOS production build, physical-device testing, and final submissions. These values cannot be invented or committed as secrets.

## Next work in order

1. Sign in to Supabase once, apply the committed Auth Site URL/redirect allowlist, decide whether to upgrade to Pro for leaked-password protection, then verify one complete invitation email/password flow.
2. Test request review, live breaks, employee management, owner onboarding, and account deletion with a disposable identity in production.
3. Test the release on a physical Android device and upload versionCode 3 to a Google Play test track; complete private Apple credential setup, create/test the iOS build, and replace all demo listing drafts with signed-native store screenshots.
4. Add an external client-error destination and verify release alerting after a provider/account is selected; recurring public endpoint health checks are already active and verified.
5. Publish final legal pages with owner-supplied support/legal details, create the Apple/Google store records, connect credentials, submit internal/TestFlight builds, complete review forms, and submit production releases.

## Rule for future updates

Every completed task must add its verification result here. Every failure must remain listed until the underlying problem is fixed and verified.

Every final development-task response must show the current overall progress and the five category percentages: Design/MVP, Database foundation, Live backend, Advanced features, and Store publication.
