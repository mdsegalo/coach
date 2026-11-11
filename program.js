/* =====================================================================
   PROGRAM — Recomp Block 1 (Nov 11 – Dec 8, 2026)
   Personal values (name, food targets, body-weight goal, HR zones) are NOT here:
   they come from coach.json "profile" in the private coach-data repo and override
   the generic defaults below at runtime.
   Edit this file to change the plan. The app reads it on every load.
   Exercise fields:
     id        stable key (history, machine settings and targets use it; don't rename)
     sets/reps planned working sets x reps (reps = metres for carries)
     range     [low, high] double-progression rep range
     rpe       effort cue from the table ("7", "7-8", "Heavy", ...)
     rest      seconds of rest after this exercise's set; null = go straight to the paired "b"
     inc       load jump when the range is full (negative = less assistance)
     unit      "lb" | "lb/hand" | "assist"
     bar       barbell weight -> enables plate calculator
     warmup    true -> auto warm-up ramp from the working weight
     repStep   reps to add when "beating" last time (5 = +5 m on carries)
     machine   persisted settings fields
     muscles   for weekly volume (direct hard sets)
     e1rm      false -> leave out of strength charts
   Week fields: rpeCap (max), rpeMin (floor), sets (cap), rpe (override), deload
   ===================================================================== */
const PROGRAM = {
  version: "2026-11-10",
  athlete: "Athlete",
  sessionCapMin: 45,
  rotation: ["A", "B", "C"],
  block: {
    name: "Recomp Block 1",
    weeks: [
      { n: 1, start: "2026-11-11", end: "2026-11-17", rpeCap: 7, label: "RPE 7 on everything", focus: "Find working weights. Log every set." },
      { n: 2, start: "2026-11-18", end: "2026-11-24", rpeMin: "7-8", label: "RPE 7-8", focus: "Double progression: add reps at the same load." },
      { n: 3, start: "2026-11-25", end: "2026-12-01", rpeMin: "8", label: "RPE 8", focus: "Keep progressing. Add load where the rep range is full." },
      { n: 4, start: "2026-12-02", end: "2026-12-08", sets: 2, rpe: "6", deload: true, label: "Deload, RPE 6", focus: "Same loads, 2 sets per exercise, about 30 min." }
    ]
  },
  targets: { kcal: 2400, p: 170, c: 260, f: 75 },          // generic default; coach.json profile.targets overrides
  goal: { startLb: 200, targetLb: 190, startDate: "2026-11-10", targetDate: "2027-02-10" },   // generic default; profile.goal overrides
  amberRule: "Same loads, drop the last set of every block, cap RPE 7. About 32-35 min.",
  redRule: "Skip lifting. 30-40 min Zone 2 walk or easy spin (conversational pace). Don't make up the session; the rotation continues next time.",
  days: {
    A: {
      name: "Full Body", focus: "Squat / horizontal push-pull", totalMin: 41,
      desc: "Heavy squat first while you're fresh, then two antagonist supersets so the pairs rest each other. Finish with quads and a loaded carry.",
      shortOnTime: "Under 35 min? Do the warm-up and blocks 1-3, skip block 4 (saves 5 min). Under 25 min? Squat plus block 2 only.",
      blocks: [
        { id: "A0", label: "Warm-up", kind: "warmup", minutes: 4, items: ["Bike 2 min, easy", "10 bodyweight squats", "10 band pull-aparts"] },
        { id: "A1", label: "Block 1", minutes: 12, items: [
          { id: "back_squat", code: "1", name: "Back squat", sets: 3, reps: 6, range: [6, 8], rpe: "7", rest: 120, inc: 10, unit: "lb", bar: 45, warmup: true, muscles: ["quads", "glutes"],
            cues: ["Brace before you unrack: big breath into your belt line", "Knees track over toes, sit between your hips", "Hit depth (hip crease below knee) and drive up through mid-foot", "Bar stays over mid-foot the whole rep"] }
        ]},
        { id: "A2", label: "Block 2", superset: true, minutes: 10, items: [
          { id: "db_bench", code: "2a", name: "DB bench press", sets: 3, reps: 8, range: [8, 10], rpe: "7", rest: null, inc: 5, unit: "lb/hand", muscles: ["chest", "triceps"],
            cues: ["Shoulder blades pinned back and down", "Lower to the outside of the chest, elbows ~45 deg", "Feet planted, slight arch, press up and slightly in"] },
          { id: "cable_row", code: "2b", name: "Seated cable row", sets: 3, reps: 10, range: [8, 12], rpe: "7", rest: 90, inc: 5, unit: "lb", machine: ["Seat", "Chest pad"], muscles: ["back", "biceps"],
            cues: ["Tall chest, no rocking", "Pull elbows to your back pockets", "Pause 1 s with shoulder blades squeezed"] }
        ]},
        { id: "A3", label: "Block 3", superset: true, minutes: 10, items: [
          { id: "rdl", code: "3a", name: "Romanian deadlift", sets: 3, reps: 8, range: [8, 10], rpe: "7", rest: null, inc: 10, unit: "lb", bar: 45, muscles: ["hams", "glutes"],
            cues: ["Soft knees, push hips straight back", "Bar drags down your thighs", "Stop when hamstrings are loaded (usually just below the knee)", "Neutral spine, squeeze glutes to stand"] },
          { id: "lat_pulldown", code: "3b", name: "Lat pulldown", sets: 3, reps: 10, range: [10, 12], rpe: "7", rest: 90, inc: 5, unit: "lb", machine: ["Seat", "Thigh pad"], muscles: ["back", "biceps"],
            cues: ["Slight lean back, chest up to the bar", "Drive elbows down to your ribs", "Control the bar up for 2 s"] }
        ]},
        { id: "A4", label: "Block 4", superset: true, minutes: 5, items: [
          { id: "leg_ext", code: "4a", name: "Leg extension", sets: 2, reps: 12, range: [12, 15], rpe: "8", rest: null, inc: 5, unit: "lb", machine: ["Seat", "Back pad", "Shin pad"], muscles: ["quads"],
            cues: ["Knee joint lined up with the machine pivot", "Squeeze 1 s at the top", "3 s on the way down"] },
          { id: "farmer_carry", code: "4b", name: "Farmer carry", sets: 2, reps: 40, range: [40, 50], repUnit: "m", repStep: 5, rpe: "Heavy", rest: 60, inc: 5, unit: "lb/hand", muscles: ["core"], e1rm: false,
            cues: ["Stand tall, shoulders packed down", "Short quick steps, don't let the bells swing", "Add distance to 50 m, then add load"] }
        ]}
      ]
    },
    B: {
      name: "Full Body", focus: "Hinge / incline / vertical pull", totalMin: 43,
      desc: "Trap-bar pull is the main lift. Incline press plus pull-ups, then single-leg work and shoulder health, finishing with hamstrings and anti-rotation core.",
      shortOnTime: "Under 35 min? Skip block 4 (saves 6 min). Under 25 min? Trap bar plus block 2 only.",
      blocks: [
        { id: "B0", label: "Warm-up", kind: "warmup", minutes: 4, items: ["Bike 2 min, easy", "10 glute bridges", "10 band pull-aparts", "5 inchworms"] },
        { id: "B1", label: "Block 1", minutes: 12, items: [
          { id: "trap_bar", code: "1", name: "Trap-bar deadlift", sets: 3, reps: 5, range: [5, 7], rpe: "7", rest: 120, inc: 10, unit: "lb", bar: 45, warmup: true, muscles: ["hams", "glutes", "quads"],
            cues: ["Stand centered, handles in line with your ankles", "Hips down, chest up, take the slack out of the bar", "Push the floor away; hips and shoulders rise together", "Stand tall, don't lean back"] }
        ]},
        { id: "B2", label: "Block 2", superset: true, minutes: 10, items: [
          { id: "incline_db", code: "2a", name: "Incline DB press (30 deg)", sets: 3, reps: 8, range: [8, 10], rpe: "7", rest: null, inc: 5, unit: "lb/hand", muscles: ["chest", "shoulders"],
            cues: ["Bench at 30 deg, not 45", "Elbows slightly tucked, lower to the upper chest", "Press up and slightly back over the shoulders"] },
          { id: "assisted_pullup", code: "2b", name: "Assisted pull-up", sets: 3, reps: 8, range: [8, 12], rpe: "7", rest: 90, inc: -5, unit: "assist", machine: ["Knee pad"], muscles: ["back", "biceps"], e1rm: false,
            alt: "Neutral-grip pulldown if the machine is taken",
            cues: ["Weight here is ASSISTANCE: less is harder", "Start from a dead hang, shoulders down first", "Chin over the bar, 2 s down"] }
        ]},
        { id: "B3", label: "Block 3", superset: true, minutes: 9, items: [
          { id: "split_squat", code: "3a", name: "DB split squat", sets: 2, reps: 10, range: [10, 12], repNote: "per leg", rpe: "7", rest: null, inc: 5, unit: "lb/hand", muscles: ["quads", "glutes"],
            cues: ["Long stance, back knee drops straight down", "Front heel stays planted", "Torso tall, slight forward lean is fine"] },
          { id: "face_pull", code: "3b", name: "Cable face pull", sets: 2, reps: 15, range: [12, 15], rpe: "7-8", rest: 75, inc: 5, unit: "lb", machine: ["Pulley height"], muscles: ["back", "shoulders"],
            cues: ["Rope at forehead height", "Pull to your eyes, thumbs back", "Finish like a double-biceps pose"] }
        ]},
        { id: "B4", label: "Block 4", superset: true, minutes: 6, items: [
          { id: "leg_curl", code: "4a", name: "Seated leg curl", sets: 2, reps: 12, range: [12, 15], rpe: "8", rest: null, inc: 5, unit: "lb", machine: ["Seat", "Back pad", "Ankle pad", "Thigh pad"], muscles: ["hams"],
            cues: ["Knee lined up with the pivot", "Thigh pad snug", "Squeeze, then 3 s back up"] },
          { id: "pallof", code: "4b", name: "Pallof press", sets: 2, reps: 10, range: [10, 15], repNote: "per side", rpe: "Controlled", rest: 60, inc: 5, unit: "lb", machine: ["Pulley height"], muscles: ["core"], e1rm: false,
            cues: ["Cable at chest height, stand side-on", "Press straight out and hold 2 s", "Don't let the cable twist you"] }
        ]}
      ]
    },
    C: {
      name: "Full Body", focus: "Leg machine / overhead / unilateral row", totalMin: 42,
      desc: "Joint-friendly leg press first, then overhead press with a chest-supported row, glutes plus chest, arms, and a heavy suitcase carry.",
      shortOnTime: "Under 35 min? Skip block 4 arms (saves 6 min). Under 25 min? Leg press plus block 2 only.",
      blocks: [
        { id: "C0", label: "Warm-up", kind: "warmup", minutes: 4, items: ["Bike 2 min, easy", "10 bodyweight squats", "10 band dislocates"] },
        { id: "C1", label: "Block 1", minutes: 11, items: [
          { id: "leg_press", code: "1", name: "Leg press", sets: 3, reps: 10, range: [10, 12], rpe: "7", rest: 120, inc: 10, unit: "lb", warmup: true, machine: ["Seat", "Foot position"], muscles: ["quads", "glutes"],
            cues: ["Feet shoulder-width, mid-platform", "Lower until your hips want to curl, not further", "Don't lock the knees at the top"] }
        ]},
        { id: "C2", label: "Block 2", superset: true, minutes: 10, items: [
          { id: "ohp_db", code: "2a", name: "Standing DB overhead press", sets: 3, reps: 8, range: [8, 10], rpe: "7", rest: null, inc: 5, unit: "lb/hand", muscles: ["shoulders", "triceps"],
            cues: ["Squeeze glutes and brace, no leaning back", "Bells start at the shoulders, press to lockout over your ears", "Control down"] },
          { id: "cs_row", code: "2b", name: "Chest-supported DB row", sets: 3, reps: 10, range: [8, 12], rpe: "7", rest: 90, inc: 5, unit: "lb/hand", machine: ["Bench angle"], muscles: ["back", "biceps"],
            cues: ["Bench at 30-45 deg, chest glued to the pad", "Row to your hips", "Pause at the top"] }
        ]},
        { id: "C3", label: "Block 3", superset: true, minutes: 7, items: [
          { id: "hip_thrust", code: "3a", name: "Barbell hip thrust", sets: 2, reps: 10, range: [10, 12], rpe: "7-8", rest: null, inc: 10, unit: "lb", bar: 45, muscles: ["glutes", "hams"],
            cues: ["Bench just under the shoulder blades, pad the bar", "Chin tucked, ribs down", "Drive to full hip lockout and squeeze 1 s"] },
          { id: "cable_fly", code: "3b", name: "Cable fly (mid height)", sets: 2, reps: 12, range: [12, 15], rpe: "8", rest: 75, inc: 5, unit: "lb", machine: ["Pulley height"], muscles: ["chest"],
            cues: ["Slight elbow bend, locked", "Hug a big tree, hands meet at the chest", "Stretch under control"] }
        ]},
        { id: "C4", label: "Block 4", superset: true, minutes: 6, items: [
          { id: "cable_curl", code: "4a", name: "Cable curl", sets: 2, reps: 12, range: [12, 15], rpe: "8", rest: null, inc: 5, unit: "lb", machine: ["Pulley height"], muscles: ["biceps"],
            cues: ["Elbows pinned at your sides", "Full stretch at the bottom", "Squeeze at the top"] },
          { id: "pushdown", code: "4b", name: "Rope triceps pushdown", sets: 2, reps: 12, range: [12, 15], rpe: "8", rest: 60, inc: 5, unit: "lb", machine: ["Pulley height"], muscles: ["triceps"],
            cues: ["Elbows pinned, slight forward lean", "Split the rope at the bottom", "Control up to 90 deg"] }
        ]},
        { id: "C5", label: "Block 5", minutes: 4, items: [
          { id: "suitcase_carry", code: "5", name: "Suitcase carry", sets: 2, reps: 30, range: [30, 50], repUnit: "m", repStep: 5, repNote: "per side", rpe: "Heavy", rest: 30, inc: 5, unit: "lb", muscles: ["core"], e1rm: false,
            cues: ["One heavy DB, stand perfectly tall", "Don't lean toward or away from the weight", "Switch hands at the turn"] }
        ]}
      ]
    }
  },
  muscleLabels: { quads: "Quads", hams: "Hamstrings", glutes: "Glutes", back: "Back", chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", core: "Core / carry" },
  sources: [
    "Jeff Nippard, Fundamentals Hypertrophy Program",
    "Dr. Mike Israetel / RP, Scientific Principles of Hypertrophy Training",
    "Eric Helms, Stronger By Science, autoregulation (RPE/RIR)",
    "Schoenfeld et al. 2017, weekly sets dose-response",
    "Iversen et al. 2021, No Time to Lift? (supersets)",
    "Peter Attia, Zone 2",
    "Dan John, loaded carries"
  ]
};

/* =====================================================================
   SWAPS + CROSSFIT GYM (v1.2)
   Each program exercise above is a "slot". The swap menu on its card offers
   PROGRAM.swaps[slotId] (ids from PROGRAM.alts or other program exercises).
   The CrossFit gym toggle auto-swaps every slot listed in PROGRAM.crossfit
   (no cables / pulldown / leg extension / leg curl / leg press there).
   A swapped lift logs under ITS OWN id, so history, PRs and coach.json
   targets key off the lift actually done. Slot keeps code/sets/rpe/rest;
   the variant brings name/unit/inc/bar/cues and, if it defines them, reps/range.
   gear: "cable" | "machine" marks options a CrossFit box won't have.
   kgDefault: true -> the kg/lb switch starts on kg (kettlebells).
   incKg: load jump when the set was logged in kg (default 2 kg).
   unit "band": weight = band assistance in lb (less is harder), e.g. 50.
   ===================================================================== */
Object.assign(PROGRAM, {
  gymRule: "CrossFit gym: no cables or machines. Cable/machine lifts swap to barbell, DB, KB, band, rig and sled versions. Same sets, reps and time.",
  crossfit: {
    cable_row: "bb_row", lat_pulldown: "band_pullup", leg_ext: "hs_goblet_squat",
    assisted_pullup: "band_pullup", face_pull: "band_face_pull", leg_curl: "slider_leg_curl", pallof: "band_pallof",
    leg_press: "front_squat", cable_fly: "db_fly", cable_curl: "db_curl", pushdown: "band_pushdown"
  },
  swaps: {
    back_squat: ["front_squat", "goblet_squat", "ssb_squat"],
    db_bench: ["bb_bench", "incline_db", "incline_bb_bench", "pushup"],
    cable_row: ["bb_row", "ring_row", "cs_row", "db_row"],
    rdl: ["db_rdl", "good_morning", "sl_rdl"],
    lat_pulldown: ["band_pullup", "assisted_pullup", "pullup", "ring_row"],
    leg_ext: ["hs_goblet_squat", "sled_drag", "spanish_squat"],
    farmer_carry: ["trapbar_carry", "rack_carry", "suitcase_carry"],
    trap_bar: ["deadlift", "sumo_deadlift", "kb_deadlift"],
    incline_db: ["incline_bb_bench", "db_bench", "bb_bench"],
    assisted_pullup: ["band_pullup", "lat_pulldown", "pullup", "ring_row"],
    split_squat: ["bulgarian", "reverse_lunge", "step_up"],
    face_pull: ["band_face_pull", "band_pull_apart", "rear_delt_fly"],
    leg_curl: ["slider_leg_curl", "nordic_curl", "kb_swing"],
    pallof: ["band_pallof", "dead_bug"],
    leg_press: ["front_squat", "goblet_squat", "hs_goblet_squat", "back_squat"],
    ohp_db: ["bb_press", "kb_press", "seated_db_press"],
    cs_row: ["db_row", "bb_row", "ring_row", "cable_row"],
    hip_thrust: ["glute_bridge", "kb_swing"],
    cable_fly: ["db_fly", "ring_fly", "pushup"],
    cable_curl: ["db_curl", "bb_curl", "band_curl"],
    pushdown: ["band_pushdown", "db_skull"],
    suitcase_carry: ["farmer_carry", "rack_carry"]
  },
  alts: {
    // squat / quads
    front_squat: { name: "Front squat", unit: "lb", inc: 10, bar: 45, warmup: true, muscles: ["quads", "glutes"], cues: ["Bar on the shoulders, elbows high", "Sit straight down between your heels", "Stay tall; elbows up out of the hole"] },
    goblet_squat: { name: "Goblet squat", unit: "lb", inc: 5, incKg: 4, range: [8, 12], muscles: ["quads", "glutes"], cues: ["Bell at the chest, elbows inside the knees", "Sit deep, chest up", "Drive through mid-foot"] },
    ssb_squat: { name: "Safety-bar squat", unit: "lb", inc: 10, bar: 65, warmup: true, muscles: ["quads", "glutes"], cues: ["Hands on the handles, upper back tight", "Bar pushes you forward: fight to stay upright", "Same depth as back squat"] },
    hs_goblet_squat: { name: "Heels-elevated goblet squat", unit: "lb", inc: 5, incKg: 4, kgDefault: true, reps: 12, range: [12, 15], muscles: ["quads"], cues: ["Heels on a plate or wedge", "Knees travel well past the toes", "Slow 3 s down, squeeze quads at the top"] },
    sled_drag: { name: "Reverse sled drag", unit: "lb", inc: 10, reps: 20, range: [20, 30], repUnit: "m", repStep: 5, rpe: "Hard", muscles: ["quads"], e1rm: false, cues: ["Walk backwards, sit low", "Push through the balls of the feet", "Arms long, short quick steps"] },
    spanish_squat: { name: "Spanish squat (band)", unit: "band", inc: 0, reps: 15, range: [12, 20], muscles: ["quads"], e1rm: false, cues: ["Heavy band behind the knees, anchored to the rig", "Sit back into the band, shins vertical", "Hold 2 s at the bottom"] },
    // presses
    bb_bench: { name: "Barbell bench press", unit: "lb", inc: 5, bar: 45, warmup: true, reps: 6, range: [6, 8], muscles: ["chest", "triceps"], cues: ["Eyes under the bar, shoulder blades pinned", "Touch the lower chest, elbows ~45 deg", "Leg drive, press back over the shoulders"] },
    incline_bb_bench: { name: "Incline barbell bench", unit: "lb", inc: 5, bar: 45, muscles: ["chest", "shoulders"], cues: ["Bench at 30 deg", "Touch just under the collarbone", "Press up and slightly back"] },
    pushup: { name: "Push-up", unit: "lb", inc: 0, reps: 15, range: [12, 20], muscles: ["chest", "triceps"], e1rm: false, cues: ["Body in a straight line, glutes tight", "Chest to the floor, elbows ~45 deg", "Weight = vest or plate on the back (blank = bodyweight)"] },
    bb_press: { name: "Barbell strict press", unit: "lb", inc: 5, bar: 45, muscles: ["shoulders", "triceps"], cues: ["Squeeze glutes, ribs down", "Head through the window at the top", "No leg drive"] },
    kb_press: { name: "Double KB press", unit: "lb/hand", inc: 5, incKg: 4, kgDefault: true, muscles: ["shoulders", "triceps"], cues: ["Bells in the rack, wrists straight", "Press to lockout by the ears", "Brace, no leaning back"] },
    seated_db_press: { name: "Seated DB shoulder press", unit: "lb/hand", inc: 5, muscles: ["shoulders", "triceps"], cues: ["Bench almost upright", "Bells start at the shoulders", "Press up and slightly in"] },
    db_fly: { name: "DB fly", unit: "lb/hand", inc: 5, muscles: ["chest"], cues: ["Slight elbow bend, locked", "Lower until you feel the stretch", "Hug the bells together over the chest"] },
    ring_fly: { name: "Ring fly", unit: "lb", inc: 0, muscles: ["chest"], e1rm: false, cues: ["Rings low, body at an angle (steeper = easier)", "Open wide with soft elbows", "Squeeze back to the top"] },
    db_skull: { name: "DB skull crusher", unit: "lb/hand", inc: 5, muscles: ["triceps"], cues: ["Upper arms angled slightly back", "Lower the bells beside your head", "Extend without flaring the elbows"] },
    band_pushdown: { name: "Band triceps pushdown", unit: "band", inc: 0, reps: 15, range: [15, 20], muscles: ["triceps"], e1rm: false, cues: ["Band anchored high on the rig", "Elbows pinned to your sides", "Squeeze at full lockout"] },
    // pulls
    bb_row: { name: "Barbell bent-over row", unit: "lb", inc: 5, bar: 45, muscles: ["back", "biceps"], cues: ["Hinge to ~45 deg, flat back", "Pull the bar to the belly button", "No body English: control down"] },
    ring_row: { name: "Ring row", unit: "lb", inc: 0, reps: 12, range: [10, 15], muscles: ["back", "biceps"], e1rm: false, cues: ["Body straight as a plank", "Pull the rings to your ribs", "Walk feet forward to make it harder"] },
    db_row: { name: "One-arm DB row", unit: "lb", inc: 5, repNote: "per arm", muscles: ["back", "biceps"], cues: ["Hand and knee on the bench, flat back", "Row to the hip", "Pause, then 2 s down"] },
    band_pullup: { name: "Band-assisted pull-up", unit: "band", inc: -10, reps: 8, range: [8, 12], muscles: ["back", "biceps"], e1rm: false, cues: ["Weight here is the BAND in lb: lighter band is harder", "Dead hang, shoulders down first", "Chin over the bar, 2 s down"] },
    pullup: { name: "Pull-up", unit: "lb", inc: 5, reps: 6, range: [5, 10], muscles: ["back", "biceps"], e1rm: false, cues: ["Weight = added load (blank = bodyweight)", "Dead hang to chin over bar", "Control down"] },
    band_face_pull: { name: "Band face pull", unit: "band", inc: 0, reps: 15, range: [15, 20], muscles: ["back", "shoulders"], e1rm: false, cues: ["Band at forehead height on the rig", "Pull to your eyes, thumbs back", "Pause 1 s"] },
    band_pull_apart: { name: "Band pull-apart", unit: "band", inc: 0, reps: 20, range: [15, 25], muscles: ["back", "shoulders"], e1rm: false, cues: ["Arms straight at chest height", "Pull the band to your chest", "Squeeze the shoulder blades"] },
    rear_delt_fly: { name: "DB rear-delt fly", unit: "lb/hand", inc: 5, reps: 15, range: [12, 15], muscles: ["back", "shoulders"], cues: ["Hinged over or chest on an incline bench", "Lead with the pinkies", "Light weight, slow"] },
    db_curl: { name: "DB curl", unit: "lb/hand", inc: 5, muscles: ["biceps"], cues: ["Elbows pinned", "Full stretch at the bottom", "Squeeze at the top"] },
    bb_curl: { name: "Barbell curl", unit: "lb", inc: 5, muscles: ["biceps"], cues: ["Elbows pinned, no swing", "Full range", "2 s down"] },
    band_curl: { name: "Band curl", unit: "band", inc: 0, reps: 15, range: [15, 20], muscles: ["biceps"], e1rm: false, cues: ["Stand on the band", "Elbows pinned", "Squeeze at the top"] },
    // hinge / hams / glutes
    deadlift: { name: "Conventional deadlift", unit: "lb", inc: 10, bar: 45, warmup: true, muscles: ["hams", "glutes"], cues: ["Bar over mid-foot, shins touch the bar", "Pull the slack out, chest up", "Push the floor away, lock out with glutes"] },
    sumo_deadlift: { name: "Sumo deadlift", unit: "lb", inc: 10, bar: 45, warmup: true, muscles: ["glutes", "hams", "quads"], cues: ["Wide stance, toes out", "Knees out over the toes", "Hips close to the bar"] },
    kb_deadlift: { name: "KB deadlift (double)", unit: "lb/hand", inc: 5, incKg: 4, kgDefault: true, muscles: ["hams", "glutes"], cues: ["Bells between the feet", "Hinge, flat back", "Stand tall, squeeze glutes"] },
    db_rdl: { name: "DB Romanian deadlift", unit: "lb/hand", inc: 5, muscles: ["hams", "glutes"], cues: ["Soft knees, hips back", "Bells slide down the thighs", "Stop at the hamstring stretch"] },
    good_morning: { name: "Good morning", unit: "lb", inc: 5, bar: 45, muscles: ["hams", "glutes"], cues: ["Bar on the upper back", "Soft knees, push hips back", "Light: this is a hamstring stretch, not a max"] },
    sl_rdl: { name: "Single-leg DB RDL", unit: "lb/hand", inc: 5, repNote: "per leg", muscles: ["hams", "glutes"], cues: ["Hips square to the floor", "Back leg straight behind you", "Touch something for balance if needed"] },
    slider_leg_curl: { name: "Slider / ring hamstring curl", unit: "lb", inc: 0, reps: 10, range: [10, 15], muscles: ["hams"], e1rm: false, cues: ["Heels on sliders or in rings, hips up", "Curl heels to your butt, keep hips high", "3 s back out"] },
    nordic_curl: { name: "Band-assisted Nordic curl", unit: "band", inc: -10, reps: 5, range: [5, 8], muscles: ["hams"], e1rm: false, cues: ["Ankles anchored, band from the rig to your chest", "Lower as slow as you can", "Push back up with your hands"] },
    kb_swing: { name: "KB swing", unit: "lb", inc: 5, incKg: 4, kgDefault: true, reps: 15, range: [12, 20], muscles: ["hams", "glutes"], e1rm: false, cues: ["Hike the bell back high between the legs", "Snap the hips, bell floats to chest height", "Plank at the top"] },
    glute_bridge: { name: "Barbell glute bridge", unit: "lb", inc: 10, bar: 45, muscles: ["glutes", "hams"], cues: ["Back on the floor, pad the bar", "Drive through the heels", "Squeeze 1 s at the top"] },
    // single leg
    bulgarian: { name: "Bulgarian split squat", unit: "lb/hand", inc: 5, repNote: "per leg", muscles: ["quads", "glutes"], cues: ["Back foot on a box or bench", "Drop the back knee straight down", "Front heel planted"] },
    reverse_lunge: { name: "DB reverse lunge", unit: "lb/hand", inc: 5, repNote: "per leg", muscles: ["quads", "glutes"], cues: ["Step back long", "Back knee kisses the floor", "Drive up through the front heel"] },
    step_up: { name: "DB box step-up", unit: "lb/hand", inc: 5, repNote: "per leg", muscles: ["quads", "glutes"], cues: ["Box about knee height", "Drive through the top foot only", "Control down"] },
    // core / carries
    band_pallof: { name: "Band Pallof press", unit: "band", inc: 0, repNote: "per side", rpe: "Controlled", muscles: ["core"], e1rm: false, cues: ["Band on the rig at chest height", "Press out, hold 2 s", "Don't let it twist you"] },
    dead_bug: { name: "Dead bug", unit: "lb", inc: 0, repNote: "per side", rpe: "Controlled", muscles: ["core"], e1rm: false, cues: ["Low back pressed into the floor", "Opposite arm and leg reach long", "Exhale fully each rep"] },
    trapbar_carry: { name: "Trap-bar carry", unit: "lb", inc: 10, reps: 40, range: [40, 50], repUnit: "m", repStep: 5, rpe: "Heavy", muscles: ["core"], e1rm: false, cues: ["Stand tall in the middle of the bar", "Short quick steps", "Add distance to 50 m, then load"] },
    rack_carry: { name: "Double KB front-rack carry", unit: "lb/hand", inc: 5, incKg: 4, kgDefault: true, reps: 40, range: [40, 50], repUnit: "m", repStep: 5, rpe: "Heavy", muscles: ["core"], e1rm: false, cues: ["Bells in the rack, elbows tight", "Breathe behind the brace", "Short steps"] }
  },
  // gear for the program's own machine/cable lifts (flagged in the swap menu at a CrossFit gym)
  gear: { cable_row: "cable", lat_pulldown: "machine", leg_ext: "machine", assisted_pullup: "machine", face_pull: "cable", leg_curl: "machine", pallof: "cable", leg_press: "machine", cable_fly: "cable", cable_curl: "cable", pushdown: "cable" },
  kgDefault: { farmer_carry: false, suitcase_carry: false },
  incKg: { farmer_carry: 4, suitcase_carry: 4 }
});
