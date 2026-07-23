# Plot 47 — a working garden plan

A personal allotment planner as an installable, offline-first mobile web app (PWA).
A hand-inked survey map of the plot with plant pins, a week 1–52 time scrubber that
simulates the season, a plant database with organic-growing care notes, a derived
calendar, and a journal.

## Using it on your phone

1. Open the deployed site (GitHub Pages) in **Safari** (iPhone) or **Chrome** (Android).
2. iPhone: Share → **Add to Home Screen**. Android: menu → **Add to Home screen / Install app**.
3. It opens full-screen, works completely offline, and keeps all data on the device.

## First deploy (one-time setup)

The repo ships a GitHub Actions workflow that builds and publishes to GitHub Pages
on every push to `main`:

1. On GitHub: **Settings → Pages → Source: GitHub Actions**.
2. Merge/push this code to `main`.
3. The app appears at `https://<user>.github.io/allotmentapp/`.

> The Vite `base` is set to `/allotmentapp/` in `vite.config.ts` — change it if the
> repository is renamed.

## Screens

- **Map** — the plot, drawn in the hand-inked notebook style. View mode: tap a pin
  for the inspector bottom sheet. Build mode: place/drag/resize plant pins
  (pinch or slider) and edit the plot furniture itself (beds, pond, shed, paths…).
  The time scrubber re-renders every pin's state (ghost → sown → growing →
  bloom/harvest) for any week of the year. A second, sunrise-to-sunset day
  scrubber moves the sun along its (real, latitude-derived) arc for that week
  and casts ground shadows from the shed, trees, bushes, cage and other
  furniture — shadow length is height ÷ tan(sun elevation), scaled to the
  plot's real 6 m × 20 m size, so you can see which beds sit in shade at any
  hour of any week.
- **Database** — 16 seeded plants (8 veg, 8 flowers) with care requirements,
  companions/enemies, pests with organic controls only, and pruning/training for
  flowers. User plants can be added.
- **Calendar** — what to sow / plant out / harvest / enjoy for the scrubbed week,
  plus whole-year timeline bars per plant.
- **Journal** — dated notes with optional photos, taggable to a plant.

## Data & backup

- All data lives in IndexedDB on the device (`navigator.storage.persist()` is
  requested on first save and the result surfaced in Settings).
- **Backup — file**: Settings → Export/Import a full JSON snapshot (photos embedded).
  Import merges last-write-wins per record.
- **Backup — Google Drive**: paste a Google OAuth client ID (scope
  `drive.appdata`, no server needed) in Settings, sign in, and every change is
  auto-pushed to a hidden app-data file. Create the client ID at
  console.cloud.google.com → OAuth client → Web application → add the deployed
  origin as an authorised JavaScript origin.
- **Weather**: set a location once in Settings; live readings come from
  Open-Meteo (free, keyless), cached for offline; falls back to seasonal
  averages otherwise.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
```

Stack: Vite + React + TypeScript, Dexie (IndexedDB), vite-plugin-pwa (Workbox),
self-hosted Archivo & Caveat via Fontsource. No UI library — the aesthetic
(paper `#f5f0e4`, ink `#3a4232`, SVG turbulence "wobble" filters on every map
feature and pin) is custom, ported from the design reference.
