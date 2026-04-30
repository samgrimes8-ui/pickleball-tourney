# Dynamic Tournament Builder — design notes

Park this until tonight. Don't ship anything from this doc without re-discussing.

## Goal

Feed the app a roster (names + skill levels, optional gender / availability /
notes), let it pick a sensible format, balance teams, name them, and emit the
same `tournament_format` JSON the existing UI already renders. Make it
sport-agnostic so this isn't pickleball-only.

**Decision:** no Anthropic API key in the deploy. We generate the JSON
*offline* (Claude Code session, local script, or paste-into-chat) and upload
it to the Admin tab via the existing `Import JSON` button. The deployed app
stays a pure renderer/editor.

## End-to-end flow

```
roster.json ──► generator (offline) ──► tournament.json ──► Admin → Import JSON
                                                                    │
                                                                    ▼
                                                          Netlify Blobs (live)
```

The generator is a deterministic function. Names can come from a static word
list or a one-off LLM session — but they're baked into the JSON before the
upload, so the running app never makes an external call.

---

## 1. Builder input — `roster.json`

What you (or I) feed the generator. Single source of truth for an event.

```jsonc
{
  "schema": "tournament-builder/v1",
  "sport": "pickleball",                  // see Sport Profiles
  "event": "Spring Smash",
  "date": "2026-05-15",                   // M/D/YYYY also accepted
  "venues": 2,                            // courts (pickleball) or fields (soccer, etc.)
  "time_budget_minutes": 180,             // optional; constrains format choice
  "constraints": {
    "team_size": 2,                       // integer or "auto"
    "allow_uneven": true,                 // permit one trio if odd-numbered
    "format_preference": "auto",          // auto | round_robin | groups | knockout
    "name_style": "punny",                // punny | serious | numeric ("Team 1..N")
    "name_seed_words": ["dink","kitchen","lob","smash"],  // optional theme hints
    "balance_by": ["skill","gender"],     // ordered preferences
    "pin_pairs": [                        // players that must be on the same team
      ["Sam", "Yuhao"]
    ],
    "split_pairs": []                     // players that must NOT be on the same team
  },
  "skill_scoring": {                      // override defaults if you want
    "Advanced": 3,
    "Intermediate": 2,
    "Beginner": 1
  },
  "players": [
    { "name": "Sam",   "skill_level": "Intermediate", "gender": "M", "notes": "captain energy" },
    { "name": "Tabi",  "skill_level": "Beginner",     "gender": "F" },
    { "name": "Ozan",  "skill_level": "Beginner",     "gender": "M", "available_from_slot": 2 }
    // ...
  ],
  "not_playing": [
    { "name": "Assiya", "reason": "PTD" },
    { "name": "Tom",    "reason": "Declined" }
  ]
}
```

Notes:

- `available_from_slot` (and a matching `available_through_slot`) lets the
  scheduler keep someone resting in their unavailable slots. Optional.
- `pin_pairs` / `split_pairs` are honored as hard constraints; the balancer
  refuses to violate them. If they make balancing impossible, the generator
  returns an error rather than fudging it.

---

## 2. Sport profile — `src/lib/sports.ts`

Tiny registry. Determines vocabulary, defaults, and time math. Start with two
or three; add as needed.

```ts
export type SportProfile = {
  id: string;                 // "pickleball", "spikeball", "soccer-5s"
  display_name: string;
  venue_term: "court" | "field" | "rink" | "table";
  default_team_size: number;
  scoring_text: string;       // free-form; surfaced in Hero marquee
  target_score: number;       // e.g. 11 for pickleball
  win_by: number;             // e.g. 2
  match_minutes_estimate: number;   // for time-budget math
  default_name_themes: string[];    // hints for namer
};

export const SPORTS: Record<string, SportProfile> = {
  pickleball: {
    id: "pickleball",
    display_name: "Pickleball",
    venue_term: "court",
    default_team_size: 2,
    scoring_text: "Best of 1, game to 11 (win by 2), rally scoring",
    target_score: 11,
    win_by: 2,
    match_minutes_estimate: 12,
    default_name_themes: ["dink", "kitchen", "lob", "smash", "pickle"]
  },
  // spikeball, ping-pong, etc.
};
```

UI swap: replace any "Court" string with `profile.venue_term`. Hero already
reads `tournament_format.scoring`, so populating that from the profile is
enough for the marquee.

---

## 3. Builder output — `tournament.json`

Same shape `src/data/initialData.ts` already uses, with two additions:
`sport` at the top level, and `built_at` / `builder_version` so old uploads
are easy to tell apart from new ones. Validation in the API route already
checks `teams` + `tournament_format` — that stays the gate.

```jsonc
{
  "schema": "tournament/v2",
  "builder_version": "1.0.0",
  "built_at": "2026-04-30T20:00:00Z",

  "sport": "pickleball",
  "event": "Pickleball Team Building",
  "date": "4/30/2026",
  "notes": "Auto-generated. 5 teams. Round robin + final.",
  "venues": 2,                      // replaces "courts" — see Migration
  "courts": 2,                      // kept as alias for the current UI

  "tournament_format": {
    "type": "Round Robin + Final",  // or "Groups + Knockout", "Single Elim", ...
    "team_count": 5,
    "team_size": "2 (one team of 3)",
    "scoring": "Best of 1, game to 11 (win by 2), rally scoring",
    "advancement": "Top 2 from round robin play Championship Final",

    // Present when type == "Round Robin + Final"
    "round_robin": {
      "total_matches": 10,
      "matches": [
        {
          "match": 1,
          "home": "Three's a Crowd",
          "away": "Pickle Rick",
          "venue": 1,           // canonical
          "court": 1,           // alias for current UI
          "slot": 1,
          "bye": "Ace Ventura", // optional, only when a team rests this slot
          "home_score": null,
          "away_score": null
        }
        // ...
      ]
    },

    // Present when type involves group play
    "groups": [
      {
        "group_id": "A",
        "group_color": "Red",
        "teams": ["Dink or Swim", "Lob Stars", "Pickle Rick"],
        "matches": [ /* same shape as round_robin matches */ ]
      }
    ],

    // Present when there's any post-round-robin / post-groups bracket
    "knockout": {
      "semi_finals": [
        { "match": "SF1", "home": "Group A Winner", "away": "Wildcard", "venue": 1, "slot": 6, "home_score": null, "away_score": null }
      ],
      "finals": [
        { "match": "F1", "label": "Championship", "home": "SF1 Winner", "away": "SF2 Winner", "venue": 1, "slot": 7, "home_score": null, "away_score": null },
        { "match": "F2", "label": "3rd Place",    "home": "SF1 Loser",  "away": "SF2 Loser",  "venue": 2, "slot": 7, "home_score": null, "away_score": null }
      ]
    },

    // Shortcut: when there's no knockout, just a final off the round robin
    "finals": [
      { "match": "F1", "label": "Championship", "home": "#1 Seed", "away": "#2 Seed", "venue": 1, "slot": 6, "home_score": null, "away_score": null },
      { "match": "F2", "label": "3rd Place",    "home": "#3 Seed", "away": "#4 Seed", "venue": 2, "slot": 6, "home_score": null, "away_score": null }
    ]
  },

  "rest_schedule": {
    "slot_1": "Ace Ventura",
    "slot_2": "Smash Bros"
  },

  "skill_scoring": { "Advanced": 3, "Intermediate": 2, "Beginner": 1 },

  "teams": [
    {
      "team_id": 1,
      "team_name": "Three's a Crowd",
      "player_count": 3,
      "total_skill_score": 5,
      "avg_skill_score": 1.67,
      "notes": "Trio — rotate one player out each game.",
      "members": [
        { "name": "Tan",    "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
        { "name": "Safian", "skill_level": "Intermediate", "gender": "M" },
        { "name": "Lau",    "skill_level": "Beginner",     "gender": "M" }
      ]
    }
    // ...
  ],

  "not_playing": [
    { "name": "Assiya", "reason": "PTD" },
    { "name": "Tom",    "reason": "Declined" }
  ],

  "build_log": {                       // nice-to-have, audit trail
    "format_chosen": "Round Robin + Final",
    "format_reason": "5 teams, 2 venues, 180-min budget — full RR fits.",
    "balance_variance": 0.4,           // std dev of team skill totals
    "name_source": "claude-session"    // claude-session | wordlist | manual
  }
}
```

### Field rules

- `match.venue` is canonical; emit `match.court` as a duplicate so the
  current UI keeps working without changes.
- Likewise emit both `venues` and `courts` at the root.
- Match numbers: round robin/group matches are integers (`1, 2, ...`);
  knockout/finals matches are strings (`"SF1"`, `"F1"`). The standings code
  already handles both.
- `slot` is global across the day, increasing through round robin into
  knockout/finals so the resolution order in the UI lines up with reality.
- Scores are always `null` until played. `0` means "shut out", not unplayed.

### Migration from v1

Today's blob is the v1 schema (no `sport`, no `venue` aliases). The API route
already re-seeds when `round_robin` is missing. Add an analogous check: when
`schema !== "tournament/v2"` and the import looks v1, the loader injects
`sport: "pickleball"` and aliases `courts` → `venues`. No data loss.

---

## 4. Format selection (rule-based)

Given `T` teams, `V` venues, `M` budget minutes, `m` minutes/match from the
sport profile:

- `T <= 6` → round robin + final.
- `7 <= T <= 12` → groups of 3 or 4 + single-elim knockout, top 1/2 advance.
- `T >= 13` → pool play + bracket; double elim only if budget allows.
- Time gate: if `T*(T-1)/2 * m / V > 0.8 * M` → fall back to groups even when
  the team count would have allowed full RR.

Pure function, easy to unit-test before wiring up. Lives in
`src/lib/builder/format.ts`.

## 5. Team balancing

Skill score per team uses `skill_scoring`. Honor `pin_pairs` first
(merged into a virtual super-player whose score is the sum), then run a
greedy snake draft over remaining skill-sorted players, then a single-swap
hill-climb on variance. Stops when no swap improves variance.

Constraint precedence (highest first): `pin_pairs`, `split_pairs`, target
team size, `balance_by` ordering. If the balancer can't satisfy all hard
constraints, return an explicit error — don't silently fudge.

`src/lib/builder/balance.ts`. Pure, testable.

## 6. Schedule generation

- Round robin: circle method. Court assignment minimizes back-to-back slots
  for any team.
- Groups: same circle method per group, then offset match numbers / slots
  globally.
- Knockout: standard seeded bracket; resolve seeds against round-robin or
  group standings using the existing `resolveSeed` helper.
- Rest schedule: derive `rest_schedule` from any team that doesn't appear in
  a slot's matches.

`src/lib/builder/schedule.ts`. Pure.

## 7. Naming

Three sources, picked by `constraints.name_style`:

- `numeric` — `Team 1..N`. Always works, no creativity needed.
- `punny` / `serious` — generated offline (Claude Code session or local
  script). Output is a flat array of strings the builder slots into teams in
  draft order. Goal is just to get the JSON ready for upload.

Names are *not* generated by the running app. Keep this surface small.

---

## 8. Suggested incremental rollout

1. Add `sport` field + `sports.ts` registry. Default `"pickleball"`. Today's
   data still works.
2. Pull format/balance/schedule into `src/lib/builder/*` as pure functions
   with tests. No UI changes yet.
3. CLI / Claude-session recipe that takes `roster.json` → emits
   `tournament.json` ready for the Admin Import button. Document it in this
   doc once we've used it once.
4. (Optional) Admin "Build from Roster" panel: paste roster JSON, click
   Build, preview the generated tournament, save. Still no live LLM call —
   names default to numeric or come from a static wordlist.
5. (Optional) Per-sport scoring config (`target_score`, `win_by`) so we stop
   hard-coding 11/2 in the UI.

## 9. Open questions for tonight

- One sport per event, or multi-sport days? Single keeps the schema simple.
- Persist *historical* tournaments? Today's blob is "the current event"; if
  we want history, we need a list endpoint and a key-per-event store.
- Naming style default — punny stays, but worth confirming.
- Worth supporting partial uploads (just teams, no schedule) for cases where
  someone wants to hand-set the bracket?

## 10. Things to be careful about

- Format selection and team balancing must be deterministic code. No LLMs
  in the runtime path.
- The Admin Import button is the only ingress for new tournaments — make
  sure it validates `schema`, `tournament_format`, and `teams` before
  overwriting the live blob, and refuse anything older than the current
  schema version unless we explicitly migrate.
- If a JSON import fails validation, *do not* clobber the running blob.
  Reject and show why.
- Keep `match.court` / root-level `courts` as aliases until the UI is
  switched over to `venue` / `venues`. Single PR for the swap, easy revert.
