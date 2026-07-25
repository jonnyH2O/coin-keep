# Hero Realms Combat Tracker — Architecture

## 1. Stack and rationale

**React + TypeScript + Vite**, deployed to GitHub Pages via GitHub Actions.

- **Vite** gives a fast dev server and a trivial static build (`dist/`) —
  exactly what GitHub Pages wants. It also imports JSON natively, which
  matters for how standings data reaches the Leaderboard (see §5).
- **React** earns its keep here mainly for component reuse: the COMBAT and
  GOLD sections are the same component with different props, and the
  Leaderboard is a list of one repeated row component. That's a small
  surface, but it's exactly the shape React is good at, and it keeps the
  Tracker/Leaderboard toggle as trivial conditional rendering rather than
  hand-rolled DOM swapping.
- **TypeScript** is doing real work in exactly one place — the Elo module
  and match-log validation — where correctness matters and the data shape
  (players, winner, ratings) is worth encoding as types rather than
  discovering at runtime. Everywhere else it's a light-touch backstop.
- No state management library, no CSS framework, no router. The app is two
  screens and a handful of counters; none of that machinery would pay for
  itself.

### The GitHub Pages routing gotcha — and why it doesn't apply here

The classic GitHub Pages problem is client-side routers (React Router etc.):
Pages serves static files with no server-side rewrite rule, so a deep link
or a refresh on `/leaderboard` 404s because there's no `leaderboard/`
directory on disk.

This app sidesteps the problem entirely rather than working around it: the
Tracker/Leaderboard toggle is **not a route**. It's a single piece of
in-memory state (`page: 'tracker' | 'leaderboard'`) in `App.tsx`. There is
exactly one URL, exactly one HTML file, and nothing to 404 on. Refreshing
always lands you back on the Tracker (see Open Questions on whether that
should be remembered instead), which is also the correct default behavior
for "start of a new turn."

The one real Pages-specific concern is the **base path**. A project page
is served at `https://<user>.github.io/<repo>/`, not at the domain root, so
`vite.config.ts` must set:

```ts
export default defineConfig({
  base: '/hero-realms-combat-tracker/', // must match the repo name exactly
  plugins: [react()],
});
```

Getting this wrong is the #1 cause of a GitHub Pages deploy that loads a
blank white page with 404s in the console for every asset.

## 2. Folder structure

```
hero-realms-combat-tracker/
├── docs/
│   ├── VISION.md
│   ├── ARCHITECTURE.md
│   └── THEME.md               # visual design spec — see §12
├── data/
│   ├── matches.json          # hand-edited source of truth
│   └── standings.json        # generated — never hand-edited
├── scripts/
│   └── generate-standings.ts # reads matches.json, writes standings.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                # page toggle state, top-level chrome
│   ├── elo/
│   │   ├── types.ts           # Match, PlayerStanding, Standings
│   │   ├── elo.ts             # pure rating engine
│   │   ├── elo.test.ts
│   │   ├── validate.ts        # match-log validation
│   │   └── validate.test.ts
│   ├── pages/
│   │   ├── Tracker.tsx
│   │   └── Leaderboard.tsx
│   ├── components/
│   │   ├── CounterSection.tsx  # shared COMBAT/GOLD readout + buttons
│   │   ├── AdjustButton.tsx    # single +5/+1/-1/-5 button
│   │   ├── LeaderboardRow.tsx  # name … dotted leader … Elo … win rate
│   │   └── PageToggle.tsx
│   ├── hooks/
│   │   └── useLocalStorageNumber.ts
│   └── styles/
│       ├── global.css          # resets, safe-area, touch-action, theme
│       └── tokens.css          # design tokens — see docs/THEME.md §2
├── public/
│   ├── favicon.svg
│   └── fonts/                  # self-hosted Cinzel + Inter .woff2 — see docs/THEME.md §1
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .github/workflows/deploy.yml
```

`data/` sits outside `src/` deliberately: `matches.json` is content a
non-developer edits by hand on GitHub's web UI if needed, and it's the
input to a Node script (`generate-standings.ts`) that runs outside the
browser bundle. `standings.json` is imported into `src/` at build time
(§5), but it's generated into `data/` so it lives next to its source and
both are visible in the same diff when a match is added.

## 3. Component tree

```
App                          (page: 'tracker' | 'leaderboard', in useState)
├── Header
│   ├── ClearAllButton        (Tracker page only)
│   └── PageToggle            (always, top-right)
├── Tracker                   (rendered when page === 'tracker')
│   ├── CounterSection label="COMBAT"
│   │   └── AdjustButton × 4  (+5 / +1 / -1 / -5)
│   └── CounterSection label="GOLD"
│       └── AdjustButton × 4
└── Leaderboard                (rendered when page === 'leaderboard')
    └── LeaderboardRow × N     (one per player in standings.json)
```

`CounterSection` is the one reusable piece on the Tracker: it takes a
label, a value, and an `onAdjust(delta)` callback, and renders the big
readout plus its four buttons. COMBAT and GOLD are two instances of it with
independent state — nothing is shared between them except the component
definition.

## 4. Data model

Two JSON files. One is a source you edit; the other is output you never
touch by hand.

### 4.1 `data/matches.json` — hand-edited source of truth

```json
{
  "matches": [
    {
      "date": "2026-07-20",
      "players": ["Alice", "Bob", "Carol", "Dave"],
      "winner": "Alice"
    },
    {
      "date": "2026-07-22",
      "players": ["Alice", "Bob"],
      "winner": "Bob"
    }
  ]
}
```

Design choices, made specifically so this is comfortable and safe to
hand-edit:

- **A match is three fields, no more.** `date` (ISO `YYYY-MM-DD`), `players`
  (every participant, as display-name strings, in no particular order),
  `winner` (one of the strings in `players`). There's no `id`, no
  `loser`/`rank` list, nothing to keep in sync by hand.
- **Player identity is the string itself.** There is no separate player ID
  to look up — you type the name the same way every time. This is the
  single biggest silent-typo risk (`"Bob"` vs `"bob"` vs `"Bob "`), so the
  validator (§7) specifically checks for near-duplicate names across the
  whole file and fails loudly rather than quietly creating a second Bob.
- **Roster size is never declared anywhere.** The set of players is just
  "every distinct name that has ever appeared in `players`." Adding a new
  person to the group is exactly as invasive as adding their first match —
  nothing else to register.
- **The array is the whole file.** No pagination, no per-player files. At
  the scale of a home game group's match history (tens to low hundreds of
  entries), one flat JSON array stays easy to skim, diff, and grep.
- **Matches are processed in array order**, not re-sorted by `date`. In
  practice you append chronologically, so this is usually moot; `date` is
  there for the record and for display, not as a sort key the engine
  depends on. The generator emits a non-fatal warning if it notices dates
  out of order, since that usually means an entry was inserted in the
  wrong place.

### 4.2 `data/standings.json` — generated, never hand-edited

```json
{
  "generatedAt": "2026-07-25T14:03:00Z",
  "sourceMatchCount": 2,
  "players": [
    {
      "name": "Bob",
      "elo": 54,
      "wins": 1,
      "losses": 1,
      "gamesPlayed": 2,
      "winRate": 0.5
    },
    {
      "name": "Alice",
      "elo": 49,
      "wins": 1,
      "losses": 1,
      "gamesPlayed": 2,
      "winRate": 0.5
    },
    {
      "name": "Carol",
      "elo": 49,
      "wins": 0,
      "losses": 1,
      "gamesPlayed": 1,
      "winRate": 0
    },
    {
      "name": "Dave",
      "elo": 49,
      "wins": 0,
      "losses": 1,
      "gamesPlayed": 1,
      "winRate": 0
    }
  ]
}
```

- `players` is pre-sorted by the generator (win rate desc, then Elo desc,
  then games played desc, then name asc) — the app renders it in the order
  it receives, no client-side sorting.
- `generatedAt` and `sourceMatchCount` exist for the staleness check in §6,
  not for display (though there's no harm surfacing "last updated" in a
  footer if useful).
- Every field here is derived, which is the point: if it's wrong, the fix
  is fixing `matches.json` and regenerating, never editing this file.

### 4.3 Roster file: recommend *not* having one

The prompt for this doc explicitly raised the question of whether a
separate players file is needed. Recommendation: **don't add one.** The
roster is fully derivable from `matches.json` (§4.1), and nothing in the
current feature set needs data that can't live there — no avatars, no
join dates, no bios. Introducing `players.json` now would be a second
source of truth for player identity with no feature depending on it.

Revisit this if a real need shows up — e.g. wanting `"Bob"` in the log but
`"Bobby"` displayed, or wanting a stable player after a rename, or storing
metadata that isn't derivable from match history. At that point a small
`players.json` mapping canonical log-name → display metadata is the right
shape, added additively without changing `matches.json`.

## 5. The Elo module

Lives entirely in `src/elo/`, has zero dependency on React or the DOM, and
is imported by both the browser bundle (not directly — see below) and the
Node generation script. This is what makes it unit-testable in isolation.

### 5.1 Why the standard 400 divisor doesn't apply

Standard chess Elo uses `E = 1 / (1 + 10^((Rb-Ra)/400))`. That 400 is
calibrated to a rating scale that spans roughly 4 digits (a few hundred to
~2900); a 400-point gap is a huge, rare skill difference. On a **1–100**
scale, the entire rating range is smaller than that one divisor — every
realistic pairing would round to ~50% expectation, and the system would
barely respond to anything. The divisor has to shrink to match the scale.

**Chosen: expectation divisor = 40.** This preserves the *shape* of the
classic curve at a familiar reference point — chess treats a 200-point gap
(200/400 = 0.5 of the divisor) as ~76% for the favorite; a 20-point gap
here is the same ratio (20/40 = 0.5) and comes out to the same ~76%. So
"the highest-rated player in the group vs. the lowest-rated" (a 99-point
spread, the most extreme possible) lands around 99.7% — dominant but not
mathematically impossible, which is the right feel for a game with real
variance.

### 5.2 Why K has to scale with player count

A naive port of pairwise Elo to an N-player free-for-all — winner vs. each
loser, full K per pairing — makes the winner's total rating gain scale
with `N-1`: winning a 6-player game would move their rating ~5x further
than winning a 2-player game, purely because there were more losers to be
compared against, not because the win was more impressive.

**Fix: divide K by `N-1` for every pairing in that match**, where `N` is
the number of players in the match. With that scaling, the winner's total
change becomes `K_base × (average expectation deficit across opponents)` —
independent of `N`. A 6-player win and a 2-player win of similar relative
"surprise" move the rating by roughly the same amount.

This same scaling directly governs the loser side too, since each pairing
is zero-sum: a specific loser's rating loss is `K_match × their own
expectation of winning that pairing`, and `K_match` shrinks as the table
gets bigger. So the effect on losers isn't neutral — it's *protective*: a
loss in a 6-player free-for-all costs a given player noticeably less than
a loss in a 1v1, not more. That's intentional and, I'd argue, correct: in
a 6-player game your prior odds of winning were already only ~1-in-6, so
any single loss carries less information about your skill than a 1v1 loss
does, and the rating shouldn't swing as if it were the same event.

**Chosen: `K_base = 8`.** With the divide-by-`(N-1)` rule above, this is
also a hard ceiling: no single match can move the winner's rating by more
than 8 points, regardless of table size, and that only happens in the
extreme case of a huge underdog beating a lobby of much higher-rated
players. Typical matches move ratings by 1–4 points. On a 100-point scale
with a small group playing dozens of games over a season, this converges
at a reasonable pace without being so twitchy that one lucky night
reshuffles the podium.

Both constants are one-line exports and meant to be tuned after watching
real data — see Open Questions.

### 5.3 Specification

```ts
// src/elo/types.ts
export interface Match {
  date: string;      // "YYYY-MM-DD"
  players: string[]; // length >= 2, unique
  winner: string;    // must equal one entry in players
}

export interface PlayerStanding {
  name: string;
  elo: number;        // integer, 1..100
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;    // wins / gamesPlayed, 0..1
}

export interface Standings {
  generatedAt: string;    // ISO datetime
  sourceMatchCount: number;
  players: PlayerStanding[]; // sorted, see §4.2
}
```

```ts
// src/elo/elo.ts
export const ELO_START = 50;
export const ELO_MIN = 1;
export const ELO_MAX = 100;
export const ELO_K_BASE = 8;
export const ELO_EXPECTATION_DIVISOR = 40;

/** Probability that `self` beats `opponent`, per the divisor in §5.1. */
export function expectedScore(self: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - self) / ELO_EXPECTATION_DIVISOR));
}

/**
 * Applies one match to a ratings map and returns a new map.
 * Decomposes the match into (N-1) winner-vs-loser pairings, each scaled
 * by K_base / (N-1), sums each player's deltas across all their pairings
 * in this match, then rounds and clamps once per player. Pure — same
 * inputs always produce the same outputs.
 */
export function applyMatch(
  ratings: Readonly<Record<string, number>>,
  match: Match,
): Record<string, number> {
  const n = match.players.length;
  const kMatch = ELO_K_BASE / (n - 1);
  const deltas: Record<string, number> = {};

  for (const player of match.players) {
    if (player === match.winner) continue;
    const eWinner = expectedScore(ratings[match.winner], ratings[player]);
    const delta = kMatch * (1 - eWinner);
    deltas[match.winner] = (deltas[match.winner] ?? 0) + delta;
    deltas[player] = (deltas[player] ?? 0) - delta;
  }

  const next = { ...ratings };
  for (const [name, delta] of Object.entries(deltas)) {
    const clamped = Math.min(ELO_MAX, Math.max(ELO_MIN, Math.round(next[name] + delta)));
    next[name] = clamped;
  }
  return next;
}
```

`computeStandings(matches: Match[]): Standings` (also in `elo.ts`) folds
`applyMatch` over the match list in array order, starting every player at
`ELO_START` the moment they first appear, and accumulates `wins`/`losses`/
`gamesPlayed` alongside the rating in the same pass. It calls
`validateMatches` (§7) first and lets validation errors propagate — it
never silently produces partial output from a bad log.

Rounding happens **once per player per match**, immediately after summing
that match's pairwise deltas — not once per pairing. This keeps the rating
history an integer sequence, which is what "big readout, 1–100" wants, at
the cost of a small amount of rounding drift on the total pool (see the
worked example below — the four deltas don't sum to exactly zero once each
is rounded independently). That drift doesn't compound: because
`computeStandings` always replays the *entire* log from `ELO_START` rather
than incrementally patching a previous cache, the output for a given log
is deterministic and reproducible regardless of how many times it's
regenerated.

### 5.4 Worked example — 4-player match

Starting ratings: Alice 50, Bob 60, Carol 45, Dave 55. Alice wins.
`N = 4`, so `K_match = 8 / 3 = 2.667`.

| Pairing (winner vs.) | Expectation for Alice | Alice's gain | Opponent's loss |
|---|---|---|---|
| vs. Bob (60)   | E = 1/(1+10^(10/40)) = 0.360 | 2.667 × 0.640 = 1.707 | −1.707 |
| vs. Carol (45) | E = 1/(1+10^(−5/40)) = 0.571 | 2.667 × 0.429 = 1.143 | −1.143 |
| vs. Dave (55)  | E = 1/(1+10^(5/40)) = 0.429  | 2.667 × 0.571 = 1.524 | −1.524 |

Alice's total delta: `1.707 + 1.143 + 1.524 = 4.374` → 50 + 4.374 = 54.37
→ **rounds to 54**.

Each opponent is adjusted independently by their own (negative) delta,
then rounded and clamped:

| Player | Before | Delta | After (rounded, clamped) |
|---|---|---|---|
| Alice | 50 | +4.374 | **54** |
| Bob   | 60 | −1.707 | **58** |
| Carol | 45 | −1.143 | **44** |
| Dave  | 55 | −1.524 | **53** |

Note this is a genuine upset-weighted result: Alice gained the *most*
ground against Bob, the player she was least expected to beat, and lost
the least ground against Carol, whom she was already favored against.

## 6. Regeneration workflow and staleness detection

**Script:** `scripts/generate-standings.ts`, run with `tsx` (no separate
compile step needed for a small Node script). It:

1. Reads and JSON-parses `data/matches.json`.
2. Runs `validateMatches` (§7); on any failure, prints every problem found
   and exits non-zero without touching `standings.json`.
3. Calls `computeStandings` from `src/elo/elo.ts` — the exact same pure
   function unit-tested in isolation — and writes the result to
   `data/standings.json`.

```json
// package.json (relevant scripts)
{
  "scripts": {
    "generate:standings": "tsx scripts/generate-standings.ts",
    "verify:standings": "tsx scripts/generate-standings.ts --check",
    "prebuild": "npm run generate:standings",
    "test": "vitest run",
    "build": "vite build"
  }
}
```

**When it runs — recommendation: CI, at two points, plus a local
convenience hook:**

1. **`prebuild` (primary guarantee).** `npm run build` always regenerates
   `standings.json` immediately before `vite build` bundles it. This makes
   a stale *deployed* site structurally impossible: even if someone
   committed a log change without regenerating, the production build
   computes fresh output from `matches.json` every time. This is the
   answer to "how does the app detect a stale cache" — it doesn't need to,
   because the build never ships one.
2. **`verify:standings` as a required CI check (the actual staleness
   detector).** The `--check` flag runs generation into memory and diffs
   it against the committed `data/standings.json` instead of writing to
   disk; it exits non-zero if they differ. Wired into the GitHub Actions
   workflow as its own step, this fails the PR/build the moment someone
   pushes a `matches.json` edit without regenerating — which is the
   "fails loudly rather than rendering a broken leaderboard" behavior for
   the *repository state*, distinct from the deployed-site guarantee
   above.
3. **Optional local pre-commit hook** (e.g. via `simple-git-hooks`) that
   runs `generate:standings` and re-stages `data/standings.json`
   automatically whenever `data/matches.json` is staged. This is a
   convenience so a contributor's own commit already contains correct,
   reviewable standings — not a safety requirement, since steps 1 and 2
   cover correctness either way.

## 7. Validation

`src/elo/validate.ts` exports `validateMatches(matches: Match[]): void`,
called by `computeStandings` and by the generation script before it does
anything else. It collects **every** problem in the file before throwing
one error with all of them listed, so a hand-editor fixes everything in
one pass instead of re-running after each fix.

Checks:

- Each match has `players.length >= 2`.
- No exact-duplicate names within one match's `players`.
- `winner` is exactly one of the strings in that match's `players`
  (catches the classic typo: winner spelled slightly differently from
  their entry in the participant list).
- `date` matches `YYYY-MM-DD` and parses to a real calendar date.
- **Cross-file near-duplicate name detection**: every distinct exact
  player-name string across the whole log is lowercased and trimmed; if
  two *different* exact strings collide after that normalization (e.g.
  `"Bob"` and `"bob"`, or `"Carol"` and `"Carol "`), validation fails and
  names both variants — this is the main defense against silently
  fragmenting one real player into two roster entries.
- (Non-fatal warning, not a failure) matches whose `date` is earlier than
  a previous entry's `date`, since processing is array-order and an
  out-of-order date usually signals a misplaced insert.

Because this runs as a required CI step (§6) rather than only client-side,
a malformed entry can never reach the deployed leaderboard — the build
simply fails first.

## 8. State management

- **Tracker counters**: a small `useLocalStorageNumber(key, initial)` hook
  wrapping `useState`, syncing to `localStorage` on every change and
  reading the initial value from it on mount. Two independent instances —
  `hrct:combat` and `hrct:gold` — with no shared state between them. This
  is the entire persistence layer: no IndexedDB, no serialization format
  beyond a plain number-as-string.
- **Clear All** resets both keys to `0` directly; it doesn't need to know
  about the hook internals beyond calling each section's setter.
- **Leaderboard data**: not fetched at runtime at all. `standings.json` is
  imported as a module — `import standings from '../../data/standings.json'`
  — which Vite inlines into the JS bundle at build time (`resolveJsonModule`
  in `tsconfig.json`). There's no loading state, no fetch failure case,
  and no risk of the app and its data getting out of sync at runtime,
  because they're literally the same bundle. The data only ever changes on
  a new deploy, which is exactly when a new bundle ships anyway.
- **Page toggle**: `useState<'tracker' | 'leaderboard'>('tracker')` in
  `App.tsx`. Deliberately not a route (§1) and not persisted across a
  refresh — the app always reopens to the Tracker.

No global store (Redux/Zustand/Context-as-store) — every piece of state
here is owned by exactly one component or hook and never needs to be read
by a distant part of the tree.

## 9. Mobile-at-the-table requirements → implementation

| Requirement | Implementation |
|---|---|
| No double-tap-to-zoom | `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">` in `index.html`, plus `touch-action: manipulation` on interactive elements as a belt-and-suspenders CSS rule. |
| No text selection on rapid taps | `user-select: none` (and `-webkit-user-select: none`) globally on buttons and readout text in `global.css`. |
| Safe-area insets | `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)` on the root layout container, plus `viewport-fit=cover` in the viewport meta tag so `env()` actually resolves on notched devices. |
| Large tap targets | Minimum 56–64px touch height on all `AdjustButton`s and the page toggle; the COMBAT/GOLD readouts and buttons together should comfortably fill their half of the viewport on a typical phone. |
| Usable in a dim room | Dark background by default (not just a "dark mode" toggle — this is the only mode), large high-contrast numerals, no low-contrast grays on interactive elements. |

This is a deliberate tradeoff against general accessibility (pinch-zoom is
also how low-vision users compensate for small text elsewhere), accepted
here in favor of fast, unambiguous taps at the table.

## 10. Build and deploy pipeline

GitHub Actions, triggered on push to `main`:

```yaml
# .github/workflows/deploy.yml (shape, not final file)
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run verify:standings   # fails PR/build if data/standings.json is stale
      - run: npm test                   # vitest run — elo.ts, validate.ts
      - run: npm run build              # prebuild regenerates standings.json fresh, then vite build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions: { pages: write, id-token: write }
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

Ordering matters: `verify:standings` runs against the **committed** file
to catch a forgotten regeneration (repo-hygiene check), then `build` runs
its own `prebuild` regeneration regardless, so the artifact that actually
ships is always freshly computed even if `verify:standings` were somehow
skipped.

## 11. Phased build order

1. **Scaffold + deploy skeleton.** Empty Vite+React+TS app, correct `base`
   path, GitHub Actions workflow deploying a placeholder page. Confirms
   the GitHub Pages pipeline works before any real feature exists —
   deploy config is the thing most annoying to debug late.
2. **Elo engine + validation, with tests.** `src/elo/*`, `elo.test.ts`,
   `validate.test.ts`, `scripts/generate-standings.ts`, a sample
   `data/matches.json`, wire up `verify:standings` in CI. No UI yet — this
   phase is done when `npm test` and `npm run generate:standings` both
   work against real fixture data.
3. **Tracker page.** `CounterSection`, `AdjustButton`, `useLocalStorageNumber`,
   Clear All. This is the page used every single game, so it ships before
   the Leaderboard.
4. **Leaderboard page.** `LeaderboardRow`, dotted-leader-line layout,
   gold/silver/bronze treatment for top three, rendering the imported
   `standings.json`.
5. **Chrome + mobile polish.** `PageToggle`, header layout, safe-area
   insets, no-zoom/no-select rules, dark/dim-room theme pass, tap-target
   sizing pass on a real phone.
6. **Edge cases and hardening.** Empty roster, single-match players,
   very long names, a roster past a screenful (confirm plain scroll is
   still fine), a short README documenting "how to add a match."

## 12. Visual theme

Full visual design — a World of Warcraft-inspired re-skin (dark ornate
gold-brass frames, parchment leaderboard, beveled buttons) — is specified
separately in [THEME.md](THEME.md): the complete token set, per-component
CSS treatments detailed enough to implement directly, the font stack and
its OFL licensing, accessibility floors that override the theme wherever
the two conflict, a mobile performance budget, and a list of deliberate
departures from the source look.

Two structural implications for what's described above: `src/styles/tokens.css`
(§2) gets replaced with THEME.md's token table rather than extended
piecemeal, and `public/fonts/` (§2) is a new addition to hold the two
self-hosted `.woff2` files THEME.md calls for. Nothing else in this
document — component tree, data model, Elo module, build pipeline —
changes to accommodate the theme; it's a styling pass over the existing
structure, not a rearchitecture.
