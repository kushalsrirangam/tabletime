# TableTime Staff store assets

Prepared August 23, 2026 for store-listing planning and release handoff.

## Google Play

- `google-play/app-icon-512.png` - 512 x 512, 32-bit PNG with alpha
- `google-play/feature-graphic-1024x500.png` - 1024 x 500, 24-bit RGB PNG without alpha
- `google-play/feature-graphic-source.png` - retained high-resolution generated source
- `google-play/phone/` - five 1080 x 1920, 24-bit RGB phone screenshot drafts

## Apple App Store

- `app-store/iphone-6.1/` - five 1080 x 2340, 24-bit RGB iPhone screenshot drafts

## Important release note

The ten phone screenshots are correctly sized listing drafts created from the local responsive web demo. They are useful for layout, copy, and listing planning, but they are not final submission screenshots. They still contain demo-only UI such as the Manager/Employee role switch and `Demo mode`. Before submission, recapture the same five views from signed native release builds with production-safe sample data and no demo labels.

The Google Play icon and feature graphic are final-dimension brand assets. Store-console review is still required before submission.

## Screenshot sequence and alt text

1. Manager overview - Manager overview showing active staff, weekly labor hours, pending requests, and current floor coverage.
2. Schedule - Weekly team schedule with current shifts, scheduled labor totals, draft shifts, and publishing controls.
3. Team - Employee directory showing positions, locations, weekly hours, work status, and edit controls.
4. Requests - Manager approval center with pending time-off and shift-swap requests plus approval actions.
5. Employee clock - Employee time clock showing an active shift, break and clock-out controls, and recent punch history.

## Feature graphic generation record

Mode: built-in Codex image generation, using `assets/tabletime-icon.png` as a visual reference.

Prompt:

> Use case: ads-marketing. Asset type: Google Play feature graphic, landscape 1024 x 500 pixels (2.048:1), final production-quality raster. Primary request: Create a polished TableTime Staff feature graphic for a restaurant workforce scheduling and time-clock app. Input images: Image 1 is a brand-style reference only; preserve its forest-green, warm-cream, and small orange-accent visual language, but do not simply enlarge or repeat the full app icon. Scene/backdrop: Deep forest-green background with a subtle refined hospitality texture, warm cream content shapes, mint highlights, and one restrained orange accent. Subject: On the right, an elegant abstract composition of a weekly schedule grid, staff status cards, and a clock face integrated with subtle fork-and-knife cues. On the left, strong clean brand copy. Style/medium: Premium flat editorial brand illustration, crisp geometric shapes, high contrast, sophisticated restaurant-operations software aesthetic. Composition/framing: Wide landscape. Keep all important elements inside generous safe margins. Left 45% for text, right 55% for illustration. No device mockup. Text (verbatim): "TableTime Staff". Secondary text (verbatim): "Team. Schedule. Time clock. Together." Constraints: Text must be spelled exactly and remain highly legible at small size; no alpha channel or transparency; no app-store badges; no rankings, reviews, pricing, download CTA, people, photographs, watermarks, or third-party logos. Avoid pure black. Make it visually consistent with the TableTime app screenshots.

The generated source was resized mechanically with high-quality interpolation to the exact 1024 x 500 Play requirement.

## Specification references

- Google Play graphic assets: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
- Apple screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
