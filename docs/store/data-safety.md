# Store privacy and data-safety answers

These answers describe the current TableTime Staff 1.0.0 codebase and must be rechecked before each release.

## Google Play Data safety

- Data encrypted in transit: Yes
- Data deletion request available: Yes, through the signed-in Account screen and the public deletion-information URL
- Data shared for advertising: No
- Data sold: No
- Targeted advertising: No
- Precise or approximate device location: Not collected by the current mobile app
- Personal information collected: Name, work email, work phone, user identifiers
- Financial information collected: Hourly pay rate is employment/compensation data, not payment-card or purchase information
- App activity collected: Schedules, clock events, breaks, requests, and role-based audit events
- Diagnostics collected: Operational error and security audit information; no advertising analytics SDK is installed
- Files, photos, contacts, microphone, camera, health, SMS, call logs: Not collected

Collection purposes: app functionality, account management, fraud/security prevention, and legal/compliance recordkeeping by the restaurant.

## Apple App Privacy

Data linked to the user:

- Contact Info: name, email address, phone number
- Identifiers: user ID
- Other Data: employment role, location assignment, hourly rate
- User Content: schedule/request notes supplied by users or managers
- Usage/Operational Data: shifts, punches, breaks, and request history

Purposes: App Functionality and account/security management. Data is not used for tracking and is not linked with third-party advertising data.

## Permissions declaration

The current app requests no camera, microphone, contacts, photos, advertising tracking, health, or device-location permissions. Recheck generated native manifests before submission.
