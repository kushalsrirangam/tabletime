# Native release checklist

## Repository and build

- [x] Expo SDK 57 configuration reviewed against the versioned documentation
- [x] Unique Android application ID and iOS bundle ID configured
- [x] Version 1.0.0 with initial native build versions configured
- [x] EAS preview and production build profiles configured
- [x] EAS production submission profiles prepared for draft/internal delivery
- [x] Production icon and adaptive icon sources added
- [x] Native splash screen plugin and asset configured
- [x] Isolated Android prebuild and generated permission manifest verified
- [ ] Expo account linked and EAS project ID written by `eas init`
- [ ] Android preview APK built and tested on a physical device
- [ ] Android production AAB built successfully
- [ ] iOS production IPA built successfully

## Product verification

- [ ] Owner onboarding verified end to end
- [ ] Manager employee add/edit/status/pay workflow verified end to end
- [ ] Invitation email, redirect, password creation, and activation verified end to end
- [ ] Employee clock-in, break, clock-out, and persistence verified end to end
- [ ] Employee request and manager review verified end to end
- [ ] Realtime cross-client update verified end to end
- [x] Account deletion path implemented and verified with rollback-safe hosted database tests and unauthenticated endpoint rejection
- [ ] Regression test completed on production web, Android, and iOS

## Hosting and security

- [x] Production web deployment available over HTTPS
- [x] Supabase row-level security and narrow RPCs verified
- [ ] Supabase Auth production Site URL and redirect allowlist applied
- [ ] Leaked-password protection enabled
- [ ] Always-on database plan or explicit uptime process selected
- [ ] Production error monitoring and release alerting configured
- [ ] Final dependency and native manifest review completed on supported Node.js

## Store records

- [x] Listing copy drafted
- [x] Privacy and data-safety answers drafted from current behavior
- [x] Review instructions drafted
- [ ] Public privacy-policy URL published
- [ ] Public support email and legal developer details supplied
- [ ] Account-deletion web URL deployed and verified publicly
- [ ] Phone and tablet screenshots captured from release build
- [ ] Google Play developer account and application created
- [ ] Apple Developer account and App Store Connect application created
- [ ] Content ratings, categories, pricing, countries, and declarations completed
- [ ] Store credentials connected to EAS without committing secrets
- [ ] Internal testing/TestFlight release submitted and reviewed
- [ ] Production releases submitted and approved
