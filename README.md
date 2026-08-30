# TELA-TELL

Fabric Identification

## Run the app

All commands run from the `tela-tell` folder:

```bash
cd tela-tell
npm install
npx expo start
```

Use `npx expo start -c` to clear the Metro cache if the app behaves oddly after dependency changes.

## Project layout

This is a fully on-device app - there is no separate backend/server.

- `tela-tell/app/` — screens and routing (Expo Router; the folder structure
  _is_ the navigation — each file/folder maps directly to a route)
- `tela-tell/features/<area>/` — business logic and components grouped by
  screen area (`scan`, `results`, `profile`, `recommendations`, `history`,
  `auth`, `fabrics`). Deliberately split into many small single-purpose files
  per area rather than a few large ones — e.g. `features/scan/lib/ml/`
  separates model loading, preprocessing, and live-camera analysis into their
  own files.
- `tela-tell/data/` — **static reference content only, never touches the
  database**: fabric definitions, health/eco advisory data, UI copy. Not user
  data.
- `tela-tell/db/` — **the actual persisted user data**: scans, accounts,
  preferences. The real "backend" — entirely local SQLite via `expo-sqlite`,
  no server involved.
- `tela-tell/components/` — shared UI primitives (icons, buttons) used across
  multiple features.
- `tela-tell/constants/` — design tokens (colors, fonts, shadows).
- `ml-training/` — sibling folder, one level up from `tela-tell/`; the Python
  training pipeline for the on-device model. Not part of the app itself.

### Where do I find X?

| Looking for...                                | Go to                                       |
| --------------------------------------------- | ------------------------------------------- |
| Fabric health-risk logic                      | `data/fabrics/synthetic-health-risk.ts`     |
| Live camera scanning                          | `features/scan/components/camera-guide.tsx` |
| On-device ML model loading/inference          | `features/scan/lib/ml/model.ts`             |
| A user's saved scans                          | `db/scans.ts`                               |
| Eco-alternative suggestions                   | `data/fabrics/eco-alternatives.ts`          |
| Confidence-level / blend-detection thresholds | `data/scans/scan-confidence.ts`             |
| Results screen                                | `app/results/[scanId].tsx`                  |
