# Coach: training + food log (PWA)

A static, offline-first web app. No build step, no CDNs, relative paths only, so it
runs from any GitHub Pages subpath (for example `https://<user>.github.io/coach/`).

On iPhone, open it in Safari, tap Share, then **Add to Home Screen**. It runs full-screen with a black status bar.

## Files
| File | What it is |
|---|---|
| `index.html` | The whole app: CSS and JS inlined |
| `program.js` | `const PROGRAM`: the 4-week block (days, blocks, exercises, rep ranges, rules). Edit this to change the plan |
| `history.json` | **Demo** imported strength history (a few fake lifts). The real one lives in the private data repo (see v1.5) |
| `coach.json` | **Demo** `COACH_DATA` (no readiness, no targets). The real one lives in the private data repo (see v1.5) |
| `sw.js` | Service worker: network-first with a 2.5 s timeout, cache fallback for the gym |
| `manifest.webmanifest`, `icons/` | Install metadata and icons (192, 512, maskable 512, apple-touch 180) |
| `src/` + `build.sh` | Optional: index.html split into parts. Edit `src/*` and run `./build.sh`, or just edit index.html |
| `screens/` | Headless screenshots at 390×844 (not needed for hosting) |

## Updating COACH_DATA (coach.json)
The app fetches coach.json with `no-store` every time it opens or comes back to the foreground (from the private repo when a sync token is set, otherwise the public demo copy). It keeps the last good copy in localStorage.

```json
{
  "updated": "2026-11-12T07:05:00-06:00",
  "readiness": {
    "date": "2026-11-12",          // must equal today's date for the rating to apply
    "rating": "green",             // green | amber | red | unknown
    "sleepH": 7.0, "sleepScore": 75,
    "hrv": 50, "hrvStatus": "Balanced",
    "rhr": 55, "bodyBattery": 60, "readiness": 70, "steps": 5000,
    "note": "Balanced HRV, 7 h sleep. Train as written."
  },
  "targets": {
    "back_squat": { "w": 135, "reps": [6, 6, 6], "badge": "Coach", "date": "2026-11-12", "note": "Found 135 @ RPE 7. Hold and own it." },
    "db_bench":   { "w": 50,  "reps": 9 }
  },
  "message": "Day B today. Trap bar: work to RPE 7, no grinding."
}
```
* **rating**: `amber` turns on the amber plan by default (drops the last set of every block, caps RPE at 7, and scales block time budgets). `red` shows "skip lifting, Zone 2 instead" with a "Lift anyway (amber)" option. You can override either from the banner. A reading whose `date` isn't today is shown but not applied.
* **targets**: keyed by exercise `id` from program.js. These override the automatic double-progression target for that exercise (`w` is the weight, `reps` is a number or a per-set array, plus an optional `badge` and `note` shown as Today and Why). Remove an entry to go back to automatic progression. **`date`** (optional but recommended): once the athlete logs that exercise in the app on a later date, the app ignores the target and progresses from his real log, so a stale target never pins him. To override again, push a target with a newer date. Targets only refresh exercises that have nothing logged yet in the current draft.
* After pushing, the phone picks it up on next open. There's no need to bump the SW version for coach.json.

### Coach corrections (`corrections`, v1.2)
Fix lifts already logged on the phone under the wrong id. Each entry is applied once (tracked in `S.fixes`) to app sessions, and to an unfinished draft, matching `date` (and `day`):
```json
{ "id": "2026-01-05-A-row", "date": "2026-01-05", "day": "A", "ex": "cable_row", "to": "bb_row", "name": "Barbell bent-over row", "gym": "crossfit" }
{ "id": "2026-01-05-A-pull", "date": "2026-01-05", "day": "A", "ex": "lat_pulldown", "to": "band_pullup", "name": "Band-assisted pull-up", "w": 40 }
{ "id": "2026-01-05-A-carry", "date": "2026-01-05", "day": "A", "ex": "farmer_carry", "kg": 24 }
```
The original is kept on the exercise as `orig`. Targets may also carry `kg` (for example `{ "w": 70, "kg": 32 }`); the card shows the kg number when the lift is in kg mode.

## v1.3: barcode scanner (Food tab)
* **Scan a barcode** opens the rear camera (`getUserMedia`, `facingMode: environment`). It decodes EAN-13, EAN-8, UPC-A and UPC-E with the native `BarcodeDetector` where it exists (Chrome/Android). Otherwise, including iOS Safari, it uses the vendored ZXing library `vendor/zxing.min.js` (@zxing/library 0.21.3, Apache-2.0, see `vendor/ZXING-LICENSE`). That file is lazy-loaded on first scan and precached by the SW for offline use. A typed-code field and a "No barcode? Enter food by hand" button cover every failure (camera denied, no camera, no decoder).
* Lookup: the local cache `S.scans[code]` first, then Open Food Facts v2 (`/api/v2/product/<code>.json`, trying the UPC-E→UPC-A and 12↔13-digit variants). Macros are read per serving when OFF has them, otherwise from per-100 g (scaled to `serving_quantity` when known, else a 100 g unit). If the product isn't found or has no macros, the same confirm sheet opens in manual mode, and what you type is cached under the code.
* Confirm sheet: image, name, brand, serving, Servings (0.25 steps) or Grams, live totals, editable per-unit macros and a meal chip (breakfast, lunch, dinner, snack, shake). It logs a normal `S.meals` row `{scan: code, serving, kcal/p/c/f per unit, servings, note: "40 g"}`, so daily totals and Send to Coach are unchanged (`- Snack: Quest Bar Cookies & Cream = 190 kcal 21P/22C/8F`).
* **Recent scans** on the Food tab: + logs it again with the last amount, and tapping the row reopens the sheet.

## v1.2: CrossFit gym, swaps, kg/lb
* **CrossFit gym toggle** (Workout tab, card under the recovery banner): `S.settings.gym = "std" | "crossfit"`, persisted. When on, every slot in `PROGRAM.crossfit` is replaced by its free-weight version (cable row → barbell row, pulldown/assisted pull-up → band pull-up, leg extension → heels-elevated goblet squat, and so on). Lifts that already have logged sets are pinned when the toggle flips. Sessions record `gym`, and Send to Coach adds `· crossfit gym`.
* **Swap menu**: tap an exercise name (the ⇅ icon) to pick from `PROGRAM.swaps[slot]`. The choice lives in `draft.swap[slotId]` for that session only, and is locked once a set is logged. A swapped lift logs under its **own id** (with `slot` = the program slot), so Last/Today, PRs, charts and coach.json targets key off the lift actually done. A swap with no history shows Find, plus the slot's last log as a hint.
* **kg/lb switch** (lb | kg on each card): per exercise, remembered in `S.units[id]`. Sets store canonical `w` in lb plus `kg` when entered in kg, so 24 kg is exact (52.9 lb) and the export reads `Farmer carry 24kg x40m per hand`. When every set last time was in kg, progression continues in kg (`incKg`, 4 kg on KB lifts).
* Unit `band`: weight is the band's assistance in lb (export: `40lb band x10`).
* history.json `appIds` now maps BTWB Bench Press, Front Squat, Barbell Row, Strict Press, Deadlift, Barbell Curl and Sumo Deadlift onto their swap ids.

Exercise ids: A: `back_squat, db_bench, cable_row, rdl, lat_pulldown, leg_ext, farmer_carry`.
B: `trap_bar, incline_db, assisted_pullup, split_squat, face_pull, leg_curl, pallof`.
C: `leg_press, ohp_db, cs_row, hip_thrust, cable_fly, cable_curl, pushdown, suitcase_carry`.

## Updating the program
Edit `program.js`. The field docs are in the header comment. **Never rename an exercise `id`**, because history, machine settings and targets key off it. When you change index.html or program.js, bump `VERSION` in `sw.js` so installed phones refresh their cache. The fetch is network-first, so they usually get the change anyway.

## Progression engine (Last / Today / Why)
Per exercise, from the most recent logged session:
1. No history: **FIND**. Ramp to RPE target. Week 1 caps RPE at 7.
2. Every set at the top of the range and RPE ≤ 8 (or blank): **+inc** (`inc` per exercise: +10 barbell lower and leg press, +5 upper/machine, +5 per DB, −5 assist on the pull-up). Reps drop to the bottom of the range.
3. Total reps fell 2 sessions in a row at the same load: **−10%**, rounded to 5.
4. Otherwise: **BEAT 1 REP**. Same weight; the weakest set's target gets +1 rep (+5 m on carries).
Week 4 (deload): same load, 2 sets, RPE 6. Week rules come from `PROGRAM.block.weeks` (`rpeCap`, `rpeMin`, `sets`, `rpe`, `deload`).

## Data model (localStorage key `mikecoach`, `schema: 2`; v1 data migrates in place)
```js
{
  schema: 1, created,
  sessions: [{ id, date:"YYYY-MM-DD", day:"A|B|C", week, mode:"normal|amber", rating,
               startedAt, endedAt, durationMin, prs, notes,
               exercises: [{ id, name, sets:[{ w, r, rpe, done:true }], warm:[{ w, r }] }] }],
  drafts: { A: { id, day, date, startedAt, mode, notes, wu:{0:true},
                 ex: { back_squat: { target:{w, reps:[]}, sets:[{w,r,rpe,done,t}], warm:[{w,r,done}],
                                     warmAuto, custom, touched } } } },   // in-progress workouts
  machine: { cable_row: { "Seat": "4", "Chest pad": "2" } },              // per-exercise settings
  foods:  [{ id, name, serving, kcal, p, c, f, src? }],                   // quick-add list (per serving)
  meals:  [{ id, date, label:"breakfast|lunch|dinner|snack", foodId, name, note, servings, kcal, p, c, f }],
           // kcal/p/c/f are PER SERVING; totals = value * servings
  bodyweight: [{ date, lb }],
  settings: { bar: 45, sound: true },
  rest: { endAt, total, label, sub, fired } | null,                       // survives reloads
  coachCache: <last coach.json>, ui: { tab, day, foodDate, lift, open:{} }
}
```
Drafts, the rest timer and the session clock are timestamps, so a reload or app switch mid-workout resumes exactly where you left off.
`migrate()` in index.html is the hook for future schema bumps. Settings → Export JSON gives a full backup (the iOS share sheet, or a download). Import replaces the data after a confirm.

## Send to Coach format
```
Alex → Coach

Day A · Mon, Jan 5 · Wk 1 · 41 min
Back squat 135x6,6,5 @7,8,9
DB bench press 50x8,8,8 per hand @7,7,8
Seated cable row 100x10,10,10 [Seat 4]
Notes: ...

Food Mon, Jan 5: 2100 kcal · 150P / 240C / 65F
Left: 300 kcal · 20P / 20C / 10F
- Breakfast: ...

Weight Jan 5: 180.4 lb (7-day avg 180.7)
```
This uses `navigator.share` (the iOS share sheet) and falls back to the clipboard with a toast.

## Known limits
* iOS Safari has no `navigator.vibrate`, so on iPhone the rest timer uses the beep plus the visual GO state. Vibration works on Android. iOS also won't beep while the app is backgrounded or locked (there are no push notifications). The screen wake lock keeps the display on during a workout on iOS 16.4+.
* Data is per device (localStorage). Use Export/Import, or Send to Coach, to move it.

## Imported history (history.json)
* Format: `{source, range, appIds:{"Back Squat":"back_squat",...}, context:{<programId>:[BTWB lifts]}, major:[...], sessions:[{id, date, workout, notes?, sets:[[lift, lb, reps, 1?]]}]}`. The 4th element `1` marks the set as e1RM-eligible (a straight set of 1-12 reps; complexes, tempo/pause and bodyweight sets aren't eligible).
* It's merged at read time and never written into localStorage, so existing phone data is untouched.
* **Progress:** e1RM charts, with BTWB in blue and app logs in lime, plus All / 12 mo. Lifts mapped via `appIds` share a chart with the program lift. Other major lifts get their own "BTWB" chips. The PR board covers app and BTWB, tagged by source.
* **Workout:** Last/Today use app logs only (plus coach.json targets). BTWB only appears as a "BTWB best: …" context row, so a 2021 number is never shown as "Last".
* **History:** app sessions first, then the BTWB sessions, read-only and marked BTWB, 20 at a time.
* In-workout PR chips compare against app logs only. This is deliberate, so new PRs are achievable after the layoff.

## v1.4: auto-sync to the coach (private repo)

- Settings › Sync: paste a fine-grained GitHub token (scoped to `mdsegalo/coach-data` with Contents: Read and write), tap **Save** and then **Test sync**. The status line shows "Last synced 2:31 PM" or the error.
- The token is kept only in this phone's localStorage (`mikecoach_gh_token`). It is masked in the UI and never goes into backups, `state.json`, Send to Coach or logs.
- About 5 s after any saved set, session, food entry, weigh-in or deletion, the app PUTs `days/YYYY-MM-DD.json` through the GitHub Contents API. Each day file holds the workouts (real swapped exercise ids with `slot`, kg/lb, gym mode, amber flag), the food (entries, totals, targets, left), the weight and the Send to Coach text. `state.json` is the full app data minus the token, sent at most every 10 minutes.
- Writes are coalesced and skipped when the content is unchanged. sha conflicts (409/422) refetch and retry. When offline or after a failure, changes wait in a queue (`mikecoach_sync`) and retry on `online`, on app open and on visibility change, backing off 30 s → 15 min.
- Commit messages are `sync YYYY-MM-DD`. The coach reads the data with `tools/pull_sync.py`.

## v1.5: personal data lives in a private repo (demo mode for everyone else)

- This public repo holds **only the app and demo data**. The real `coach.json` (readiness, targets, messages, corrections, plus a `profile` with name, gym, food targets, body-weight goal and HR-based rules) and the real `history.json` live in the **private** data repo (the same repo the phone syncs to) at `coach/coach.json` and `coach/history.json`.
- **With a sync token** (Settings › Sync), the app reads both files through the GitHub Contents API (`Accept: application/vnd.github.raw`, `no-store`, cache-busting `?t=`) on open, on returning to the foreground (history at most every 10 min), on **Refresh coach data** and right after saving a token. The last good copies are cached in localStorage (`S.coachCache` and `mikecoach_hist`), so it works offline. The public demo files are never used on a phone with a token.
- **Without a token**, the app loads the demo `coach.json` and `history.json` from this repo: no readiness, no targets, a few fake lifts, and "Demo mode: add a sync token in Settings to load your coach data."
- `coach.json` `profile` overrides `PROGRAM.targets`, `PROGRAM.goal`, `PROGRAM.redRule`/`amberRule` and the name used in Send to Coach (`<name> → Coach`); program.js only has generic defaults.
- Corrections are still applied once per `id` (tracked in `S.fixes`), whichever copy they come from.
- Removing the token (or erasing the phone) drops the cached private copies and switches back to demo.
- The coach publishes with `tools/push_coach.py` (outside this repo), which commits to the private repo.
