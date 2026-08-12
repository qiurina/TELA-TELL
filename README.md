# TELA-TELL

Fabric verification

## Run the app

All commands run from the `tela-tell` folder:

```bash
cd tela-tell
npm install
npx expo start
```

Use `npx expo start -c` to clear the Metro cache if the app behaves oddly after dependency changes.

## Project layout

- `tela-tell/app/` — screens and routing (Expo Router)
- `tela-tell/features/` — scan, results, profile, recommendations
- `tela-tell/data/` — mock scan data and fabric references
