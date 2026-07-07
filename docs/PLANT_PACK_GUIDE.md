# Plant Pack Guide — instructions for Claude

You (Claude, or any assistant/developer) are being asked to produce a **plant pack**:
a single JSON file the app's owner imports on their phone via
**Settings → Import backup** to add new plants to — or update existing plants in —
the Plot 47 plant database. No code changes, no redeploy: the file *is* the update.

Read this whole guide before writing the file. The worked example at the bottom is
a complete, importable pack — copy its structure exactly.

## How import works (why the file is shaped this way)

The app's importer accepts its own backup format (`Snapshot` version 1) and merges
it into the on-device database **last-write-wins per record**, keyed by `id`,
using `updatedAt` (epoch milliseconds). Empty arrays are harmless — they simply
update nothing. So a plant pack is a Snapshot with only `plants` populated:

```json
{
  "version": 1,
  "exportedAt": 1751884800000,
  "pins": [],
  "features": [],
  "journal": [],
  "settings": {},
  "photos": [],
  "plants": [ /* your plant objects here */ ]
}
```

Hard rules:

- `version` must be exactly `1`, and `pins` must be present as an array (the
  importer validates both). Include all the empty arrays shown above.
- Every plant needs `updatedAt` set to the current epoch-ms timestamp. A record
  only overwrites an existing one if its `updatedAt` is **greater**, so a stale
  timestamp silently loses.
- `id` is the merge key. **New plant** → invent a unique id, prefix `custom-`
  (e.g. `custom-parsnip`). **Edit a built-in plant** → reuse its exact seed id
  (see list below); your object replaces it wholesale, so include *every* field,
  not just the ones you're changing.
- To **remove** a previously added custom plant, ship its object with
  `"deleted": true` (keep id + updatedAt). Never delete seed plants.

Seed ids you can override: `broadbean`, `pea`, `carrot`, `leek`, `kale`,
`chard`, `courgette`, `beetroot`, `dahlia`, `cosmos`, `tulip`, `sunflower`,
`calendula`, `lavender`, `sweetpea`, `allium`.

## The Plant object

Authoritative source: `src/types.ts` (`Plant`) and `src/data/catalogue.ts`
(16 examples of exactly the right shape and voice). Field reference:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Merge key. `custom-<slug>` for new plants; seed id to override. |
| `name` | string | Display name, e.g. `"Parsnip"`. |
| `latin` | string | Italic latin name, e.g. `"Pastinaca sativa"`. |
| `family` | string | Botanical family, e.g. `"Apiaceae"`. |
| `cat` | string | `"Vegetable"`, `"Flower"`, `"Fruit bush"`, or `"Herb"`. |
| `col` | string | Pin colour, hex. Match the muted catalogue palette — desaturated, earthy (`#8aa85a`, `#cf5a72`), never neon. |
| `size` | number | Default pin diameter in world px, 26–62 in the seed data. Match the plant's real footprint (carrot 34, courgette 62). |
| `veg` | string? | Pictogram drawn in the pin, one of: `carrot`, `leek`, `kale`, `chard`, `courgette`, `beetroot`, `pea`, `bean`, `squash`, `radish`, `garlic`, `potato` (also good for other tubers — it tints to `col`), `broccoli`, `psb` (purple sprouting), `artichoke`, `rhubarb`, `onion` (spring onion/shallot), `leaf` (generic leafy rosette, tints to `col` — good for salads, spinach, mustards, sorrel), `strawberry`, `berry` (cluster, tints to `col` — raspberry, blackberry, currants). Works on any non-flower category (Vegetable, Herb, Fruit bush). Pick the closest match. Omit for flowers. |
| `sketch` | string? | Edge decoration for flowers, one of: `spiky`, `dotted`, `cloud`, `cross`, `smooth`. Omit for vegetables. |
| `perennial` | boolean? | `true` keeps the pin present all year (like lavender). Omit otherwise. |
| `sow` | [number, number]? | Week window, 1–52 inclusive. |
| `plant` | [number, number]? | Plant-out window. For direct-sown crops, same as `sow`. |
| `harvest` | [number, number]? | For crops. Give **either** `harvest` **or** `bloom`, not both. |
| `bloom` | [number, number]? | For flowers. Its presence is what makes the app treat the plant as flowering (pink "bloom" bar, bloom pin state). |
| `note` | string | 1–2 sentence practical note shown in the inspector. |
| `stages` | array | Week-labelled stages, see below. |
| `restStage` | string | Label when no stage rule matches. |
| `care` | object | `{ "light": "...", "watering": "...", "soil": "..." }`. |
| `companions` | string[]? | Plant **ids** (seed or custom) — they render as tappable cross-links, so every id must exist in the catalogue or this same pack. |
| `enemies` | string[]? | Same rules as companions. |
| `pests` | array? | `[{ "name": "...", "control": "..." }]` — **organic controls only**. |
| `pruning` | string? | Pruning & training paragraph — required for flowers and fruit bushes, omit for most veg. |
| `custom` | boolean? | **`true` for new plants** (this is what makes them appear in the app: "My plants" in the database list and plant key, and at the end of the Vegetables/Flowers rows in the build palette). **Omit it when overriding a seed plant**, or the plant will show up twice. |
| `updatedAt` | number | Epoch ms, current time. |

### Stages

`stages` is a list of inclusive week ranges checked in order — first match wins,
`restStage` is the fallback:

```json
"stages": [
  { "from": 1,  "to": 7,  "label": "Not in yet" },
  { "from": 8,  "to": 17, "label": "In modules" },
  { "from": 18, "to": 27, "label": "Growing on" },
  { "from": 28, "to": 44, "label": "Lifting roots" }
],
"restStage": "Finished"
```

Ranges may wrap the new year (`from` > `to`, e.g. `{"from": 44, "to": 20}` for
autumn-planted bulbs). Cover the whole year between `stages` + `restStage`, keep
labels short (2–4 words), and make them line up with the sow/plant/harvest
windows — the map pin's appearance (ghost → seedling → grown → harvest/bloom) is
derived from the windows, and the stage text sits beside it in the inspector.

Season reference: spring = weeks 9–22, summer = 23–35, autumn = 36–48,
winter = the rest. Week N ≈ Jan 1 + (N−1)×7 days.

## Content style (as important as the schema)

The owner is a UK allotment grower with a few years' experience. Match the voice
of the existing catalogue — practical, first-person-plot, no filler:

- Skip absolute-beginner content; include the *why*, not just the *what*
  ("thin on a still evening — carrot fly hunts by smell").
- `note` reads like a margin scribble: "Each 'seed' is a cluster — thin to one."
- **Pest controls must be organic only**: netting, mesh, timing, barriers,
  hand-picking, biological controls, resistant varieties. Never synthetic sprays.
- UK growing calendar (last frost ≈ mid-May, week 20).
- Check `companions`/`enemies` ids against the seed list above — a typo renders
  as a dead chip.

## Delivering the pack

1. Name the file something the owner will recognise: `plot47-plants-<topic>.json`
   (e.g. `plot47-plants-roots.json`).
2. It must be valid JSON — no comments, no trailing commas.
3. Tell the owner: open the app → ⚙ Settings → **Import backup** → pick the file.
   Suggest they tap **Export backup** first if the pack overrides seed plants.
4. Import is merge-safe: it cannot delete or damage pins, journal entries, or
   settings, because those arrays are empty in the pack.

### Pre-flight checklist

- [ ] `version: 1`, all six data keys present, `plants` is the only non-empty one
- [ ] every plant has `id`, `updatedAt` (current epoch ms), `name`, `cat`, `col`, `size`, `note`, `stages`, `restStage`, `care`
- [ ] new plants: `custom: true` and a `custom-` id · seed overrides: full object, no `custom` flag
- [ ] vegetables have `veg` + `harvest`; flowers have `sketch` + `bloom` + `pruning`
- [ ] all weeks within 1–52; stage ranges cover the year
- [ ] all companion/enemy ids exist
- [ ] pest controls organic only
- [ ] JSON parses (run it through a validator)

## Worked example

A complete pack adding one vegetable and one flower — importable as-is:

```json
{
  "version": 1,
  "exportedAt": 1751884800000,
  "pins": [],
  "features": [],
  "journal": [],
  "settings": {},
  "photos": [],
  "plants": [
    {
      "id": "custom-parsnip",
      "custom": true,
      "name": "Parsnip",
      "latin": "Pastinaca sativa",
      "family": "Apiaceae",
      "cat": "Vegetable",
      "col": "#d8c98a",
      "size": 36,
      "veg": "carrot",
      "sow": [12, 18],
      "plant": [12, 18],
      "harvest": [42, 52],
      "note": "Slow to germinate — always sow fresh seed. Sweetens properly after the first frost.",
      "stages": [
        { "from": 1, "to": 11, "label": "Bare soil" },
        { "from": 12, "to": 20, "label": "Waiting on germination" },
        { "from": 21, "to": 41, "label": "Growing on" },
        { "from": 42, "to": 52, "label": "Lifting after frost" }
      ],
      "restStage": "Bare soil",
      "care": {
        "light": "Full sun. Like all the deep roots, shade gives leaf and no root.",
        "watering": "Steady moisture until established, then largely rain-fed. Erratic watering splits the roots.",
        "soil": "Deep, stone-free, not freshly manured — forked parsnips come from rich pockets and stones. pH 6.5–7.5."
      },
      "companions": ["pea", "calendula"],
      "enemies": [],
      "pests": [
        { "name": "Carrot fly", "control": "Same fly as the carrots — sow under fine mesh or behind a 60cm barrier, and don't bruise the foliage on a still evening." },
        { "name": "Canker", "control": "Orange-brown rot on the shoulder. Grow resistant varieties ('Gladiator', 'Albion'), avoid overliming, and don't damage the crown when hoeing." }
      ],
      "updatedAt": 1751884800000
    },
    {
      "id": "custom-nasturtium",
      "custom": true,
      "name": "Nasturtium",
      "latin": "Tropaeolum majus",
      "family": "Tropaeolaceae",
      "cat": "Flower",
      "col": "#d97a3a",
      "size": 44,
      "sketch": "smooth",
      "sow": [16, 22],
      "plant": [20, 24],
      "bloom": [26, 42],
      "note": "Sacrificial and edible in one. Sow where it is to flower — it sulks if moved.",
      "stages": [
        { "from": 1, "to": 15, "label": "Not sown" },
        { "from": 16, "to": 25, "label": "Scrambling out" },
        { "from": 26, "to": 42, "label": "Flowering" }
      ],
      "restStage": "Frosted off",
      "care": {
        "light": "Full sun on poor ground gives the most flowers; rich soil gives you a leaf jungle.",
        "watering": "Almost none once going. Water only new sowings and pot-grown plants.",
        "soil": "The poorer the better — genuinely. No feed, ever."
      },
      "companions": ["courgette", "kale"],
      "enemies": [],
      "pests": [
        { "name": "Blackfly", "control": "It draws blackfly off the beans — that's the job. Pinch out and bin the worst-colonised shoots rather than treating." },
        { "name": "Cabbage white caterpillars", "control": "They lay on it readily, which keeps them off netted brassicas. Hand-pick the egg rafts from leaves you plan to eat." }
      ],
      "pruning": "No pruning as such — pinch tips to keep it bushy and deadhead if you want flowers over seed. Let a few pods ripen and dry for next year; it also self-seeds happily.",
      "updatedAt": 1751884800000
    }
  ]
}
```
