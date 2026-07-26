# Hero Realms Combat Tracker — Visual Theme

This specifies a full re-skin of the app after classic World of Warcraft's
interface (vanilla / Burning Crusade era): dark semi-transparent panels,
ornate gold-brass frames, beveled stone/metal buttons, parchment surfaces,
gold serif headings.

**This is an original recreation, not an asset port.** No Blizzard textures,
sprites, or UI art are extracted or referenced. No Friz Quadrata, no
Morpheus — both are commercial licensed fonts Blizzard uses, and neither
ships here. Everything below is built from CSS gradients, box-shadows, and
multiple-background layering, plus two free, OFL-licensed fonts. Where a
faithful recreation would need a tiled raster texture, this doc says so
and substitutes a flat-color/gradient approximation instead — see
"Authenticity vs. usability" at the end for the full list of departures.

This supersedes the flat token set currently in `src/styles/tokens.css`
(see [ARCHITECTURE.md](ARCHITECTURE.md) §2 and §12). When implemented,
`tokens.css` should be replaced with the token table in §2 below, and
`public/fonts/` added to hold the two self-hosted font files (§1).

---

## 1. Fonts and licensing

| Role | Font | Fallback stack |
|---|---|---|
| Headings, labels, player names | **Cinzel** (regular weight, not Cinzel Decorative — see below) | `'Cinzel', Georgia, 'Times New Roman', serif` |
| All numerals (readouts, Elo, win rate, W-L, delta buttons) | **Inter**, heavy weight, tabular figures | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |

Both **Cinzel** and **Inter** are licensed under the **SIL Open Font
License 1.1** — free to use, modify, and self-host commercially, no
attribution required, no royalty. Get the `.woff2` files from Google
Fonts (or the Google Fonts GitHub repo) once, and **self-host them** under
`public/fonts/` rather than linking `fonts.googleapis.com` at runtime.
Reasoning: this is a fully static site with no other third-party network
dependency (see ARCHITECTURE.md §1); a render-blocking request to an
external font CDN is the one thing that would break that, and a game-night
venue's wifi is exactly the kind of connection where that request is slow
or absent.

**Why not Cinzel Decorative, which was on the table?** Its swash capitals
look closer to a fantasy game logo, but they cost real scanning speed —
tried across a 10+ row leaderboard, decorative caps make it measurably
slower to pick out a specific name at a glance than plain Cinzel does.
Reserve Cinzel Decorative (if it's ever wanted) for a one-off splash/title
screen outside the core UI; nothing in the current app uses it.
**Marcellus** (also OFL) is a reasonable swap-in for Cinzel if, in
practice, Cinzel's letterforms feel too heavy at the small label sizes
(the `COMBAT`/`GOLD` section labels) — noted here as the named fallback
rather than loading a third font speculatively.

**Why a plain sans for numerals, not a themed serif?** The counter
readout is explicitly "the most important pixels in the app" — read at
arm's length, mid-turn, possibly in a dim room. A heavy geometric sans
with tabular figures reads faster than any serif at a glance, ornate or
not. This is the single clearest case in this whole doc of usability
overriding authenticity — see the closing section.

---

## 2. Design tokens

All values are hex (or `rgba()` where transparency matters). Every token
has exactly one job — don't reuse `--frame-mid` where `--text-gold` is
meant, even though both are "gold," because they're tuned for different
jobs (metal body color vs. text-on-black legibility) and drift apart on
purpose.

### Surfaces

| Token | Value | Used for |
|---|---|---|
| `--panel-bg` | `#14100a` | Primary dark panel fill (Tracker background, header) |
| `--panel-bg-translucent` | `rgba(20,16,10,.90)` | Overlay panels sitting above other content |
| `--panel-recessed` | `#0a0806` | "Carved" recessed areas — inside counters, inside action-slot buttons |
| `--parchment` | `#e8dcb8` | Leaderboard list background |
| `--parchment-shadow` | `#d8c89a` | Row dividers, aged-paper blotches on parchment |

### Frame metal ramp (the beveled gold-brass border, §3)

| Token | Value | Used for |
|---|---|---|
| `--frame-light` | `#f4e2a8` | Top-left bevel highlight, corner rivets' bright center |
| `--frame-mid` | `#c9a227` | Frame body fill, borders, page-toggle border |
| `--frame-dark` | `#5a4318` | Bottom-right bevel shadow, corner rivets' outer ring |
| `--frame-outer` | `#1a1408` | Outermost hairline edge around every frame |

### Text

| Token | Value | Used for | Measured contrast |
|---|---|---|---|
| `--text-gold` | `#f2c94c` | Headings/labels **on dark panels only**, sparse & large text only (§5) | 11.9:1 on `--panel-bg` |
| `--text-offwhite` | `#f5f0e6` | Dense/frequent text **on dark panels**: numerals, Elo badge number, secondary UI copy | 16.7:1 on `--panel-bg` |
| `--ink` | `#2b2013` | Primary text **on parchment**: player names | 11.6:1 on `--parchment` |
| `--ink-muted` | `#4a3826` | Secondary text **on parchment**: W-L record | 8.2:1 on `--parchment` |
| `--text-disabled` | `#6b6559` | De-emphasized/inactive text (no component uses this yet — see §6) | 3.3:1 on `--panel-bg` |

**Gold is never used on parchment, at any size.** Measured: `--text-gold`
on `--parchment` is **1.16:1** — a hard fail, not a judgment call. See §5.

### Resource ramps (Combat and Gold counters, §3)

| Token | Value | Used for |
|---|---|---|
| `--ember-deep` | `#3a0a0a` | Combat track base (darkest red) |
| `--ember-mid` | `#b3221a` | Combat track mid-tone |
| `--ember-bright` | `#ff7a3c` | Combat accent glow (frame edge, label underline) |
| `--amber-deep` | `#4a2f06` | Gold-counter track base (darkest brown-amber) |
| `--amber-mid` | `#c9820c` | Gold-counter track mid-tone |
| `--amber-bright` | `#ffcb47` | Gold-counter accent glow |

### Elo tier glow ramp (badge icons, §5)

The Elo badge is an illustrated gem/rank icon (`public/icons/StreamerUiIcon1-6.png`,
lowest to highest tier) with a colored glow behind it, rather than a plain
colored pill. Each glow token is matched to its icon's own dominant color
rather than an arbitrary ramp, so the glow reads as "coming from" the gem
instead of clashing with it. **These are a first pass — expect to retune
the exact hex values once the icons are live and visible together.**

| Token | Value | Icon |
|---|---|---|
| `--tier-stone-glow` | `#9d9d9d` | `StreamerUiIcon1.png` — grey/dark crystal |
| `--tier-bronze-glow` | `#d9822b` | `StreamerUiIcon2.png` — amber gem |
| `--tier-gold-glow` | `#2ecc59` | `StreamerUiIcon3.png` — green gem, gold laurel frame |
| `--tier-platinum-glow` | `#2ee6d9` | `StreamerUiIcon4.png` — cyan medallion, most ornate |
| `--tier-diamond-glow` | `#2fa8e0` | `StreamerUiIcon5.png` — blue diamond |
| `--tier-master-glow` | `#a335ee` | `StreamerUiIcon6.png` — purple gem (top tier) |

### Rank medals (leaderboard top 3 — literal, deliberately *not* the tier ramp, §5)

| Token | Value | Used for |
|---|---|---|
| `--medal-gold` | `#d4af37` | Rank 1 |
| `--medal-silver` | `#c0c0c0` | Rank 2 |
| `--medal-bronze` | `#cd7f32` | Rank 3 |
| `--medal-ring` | `#3a2a12` | Thin dark outline on every medal circle, so it separates from parchment regardless of exact hue closeness |

### Danger (Clear All, §3)

| Token | Value | Used for |
|---|---|---|
| `--danger-bg-deep` | `#2a0d0a` | Bottom of the Clear All gradient |
| `--danger-bg-mid` | `#4a1a12` | Top of the Clear All gradient |
| `--danger-border` | `#6b3a1a` | Clear All border — brownish oxblood, not bright frame gold |
| `--danger-text` | `#e0a479` | Clear All label — dim warning ember, deliberately not `--text-gold` |

### Overlay / tooltip (no component uses this yet — spec'd for the first one that needs it)

| Token | Value |
|---|---|
| `--overlay-bg` | `rgba(8,6,4,.96)` |
| `--overlay-border` | `--frame-mid` (reused) |

### Layout

| Token | Value | Note |
|---|---|---|
| `--radius-frame` | `2px` | Near-sharp, not the soft `14px` radius currently in `tokens.css` — see "Authenticity vs. usability" |
| `--radius-overlay` | `0` | Tooltips/overlays: literally no rounding, per direction |

---

## 3. Global conventions

**Light source: top-left, always.** Every beveled surface in this app —
frames, buttons, the engraved leader line — highlights its top-left edge
and shadows its bottom-right edge. This is the one rule that makes dozens
of separately-built components read as one consistent material. Don't
invert it for any single component "because it looked better," or the
whole app stops reading as coherent metalwork.

**No raster images for structure.** Frames, bevels, corner ornaments, and
the engraved leader line are built from `linear-gradient`, `radial-gradient`,
multiple `background-image` layers, and `box-shadow` — never a PNG/JPEG
texture. This is both a legal-safety measure (no risk of resembling an
extracted asset) and a performance one (§7).

### Frame construction (the beveled gold-brass border)

The technique that gets reused on every panel:

```css
.frame {
  border: 3px solid var(--frame-outer);
  border-radius: var(--radius-frame);
  background: linear-gradient(
    180deg,
    var(--frame-light) 0%,
    var(--frame-mid) 45%,
    var(--frame-dark) 100%
  );
  box-shadow:
    inset 0 1px 0 var(--frame-light),       /* top highlight */
    inset -1px -1px 2px var(--frame-dark),  /* bottom-right shadow */
    inset 1px 0 0 rgba(244, 226, 168, 0.4); /* faint left highlight */
  padding: 3px; /* reveals the metal ring before the recessed inner panel */
  position: relative;
}

/* Corner rivets: 4 independently-positioned radial gradients, no image */
.frame::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* One gradient per background-position layer: the layer count is driven
     by background-image's list length, not background-position's, so a
     single gradient here would only ever render at the first position. */
  background-image:
    radial-gradient(circle, var(--frame-light) 0%, var(--frame-dark) 70%, transparent 72%),
    radial-gradient(circle, var(--frame-light) 0%, var(--frame-dark) 70%, transparent 72%),
    radial-gradient(circle, var(--frame-light) 0%, var(--frame-dark) 70%, transparent 72%),
    radial-gradient(circle, var(--frame-light) 0%, var(--frame-dark) 70%, transparent 72%);
  background-repeat: no-repeat;
  background-size: 10px 10px;
  background-position:
    top 4px left 4px,
    top 4px right 4px,
    bottom 4px left 4px,
    bottom 4px right 4px;
}

.panel-inner {
  background: var(--panel-recessed);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7);
  border-radius: calc(var(--radius-frame) - 1px);
}
```

**Why this scales cleanly.** Nothing here is a stretched image. The
gradient body fills whatever box size it's given; the corner rivets are
positioned by fixed keyword offsets (`top 4px left 4px`, etc.), so they
stay fixed-size and fixed-distance-from-corner at any panel dimension —
there's no 9-slice to get wrong and nothing to smear. If a more elaborate
repeating edge motif is ever wanted, use `border-image` with `repeat` (not
the default `stretch`) mode so the motif tiles instead of distorting — but
the gradient/shadow approach above should cover everything in this app
without needing an image asset at all.

---

## 4. Component treatments

### Combat counter and Gold counter

Both share one construction — a `.frame` (§3) wrapping a recessed track —
and differ only in their resource ramp, so they read as siblings, not
clones:

```css
.resource-track {
  background:
    /* decorative segment lines — purely atmospheric, not tied to the
       counter's numeric value, since the value is unbounded and can't
       be mapped to a fill percentage */
    repeating-linear-gradient(
      90deg,
      transparent 0 22px,
      rgba(0, 0, 0, 0.25) 22px 24px
    ),
    linear-gradient(180deg, var(--ember-mid) 0%, var(--ember-deep) 100%);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7);
}
/* Gold counter: swap --ember-mid/--ember-deep for --amber-mid/--amber-deep */
```

- Label (`COMBAT` / `GOLD`): `--font-display` (Cinzel), `--text-gold`,
  all-caps, letter-spacing — short and sparse, so gold-on-dark is fine
  here (§5).
- Readout numeral: `--font-numeral` (Inter), `--text-offwhite`, heavy
  weight, `font-variant-numeric: tabular-nums` — never gold, it's the
  densest, most-read text in the app.
- **Important:** the "segmented track" and glow are atmosphere, not data.
  Real WoW resource bars (rage, mana) visually fill/empty with the
  underlying value; ours can't, because COMBAT/GOLD are unbounded
  counters with no maximum. Don't wire the segment count or a "fill
  percentage" to the number — that's a real WoW pattern imported into a
  place it doesn't fit, see "Authenticity vs. usability."

### +/- buttons — action-bar slots

```css
.action-slot {
  min-height: 56px; /* touch target floor — see §6, ornament never shrinks this */
  min-width: 56px;
  box-sizing: border-box;
  border: 2px solid var(--frame-mid);
  border-radius: var(--radius-frame);
  background: var(--panel-recessed);
  box-shadow:
    inset 0 1px 0 rgba(244, 226, 168, 0.5),
    inset 0 -2px 3px rgba(0, 0, 0, 0.6);
  color: var(--text-offwhite);
  font: 700 clamp(1.1rem, 5vw, 1.6rem) var(--font-numeral);
}

.action-slot:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8); /* bevel flattens — it visibly sinks */
}
```

The delta value (`+5`, `-1`, …) sits centered in the slot like an ability
icon would — that's the visual metaphor, not a decorative label bolted on
after the fact.

### Clear All — distinct and slightly dangerous

```css
.clear-all {
  background: linear-gradient(180deg, var(--danger-bg-mid), var(--danger-bg-deep));
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-frame);
  color: var(--danger-text);
  font-family: var(--font-display);
}
```

No bright frame-gold anywhere on this control — that's the point. It
should read as "the one button that isn't routine" at a glance, before
anyone reads the label. The existing layout already keeps it physically
separated from routine controls (top-left header slot, opposite the page
toggle); this treatment reinforces that with color instead of relying on
position alone. Deliberately **no** constant glow/pulse — a control that's
visually loud all the time is a distraction at a table in a dim room,
which matters more here than making "danger" maximally emphatic.

### Page toggle — gold-bordered micro-tab

```css
.page-toggle {
  border: 1px solid var(--frame-mid); /* thinner than the 3px main frame border — this is minor chrome */
  border-radius: var(--radius-frame);
  background: var(--panel-bg);
  color: var(--text-gold);
  font-family: var(--font-display);
}
```

No corner rivets, no multi-layer bevel — that ornamentation is reserved
for primary content frames (the counters). A control this small gets
crowded by heavy ornament long before a full panel does.

### Leaderboard — parchment roster list

Background: flat `--parchment` plus two or three static, low-opacity
`radial-gradient` blotches (in `--parchment-shadow`) to suggest aging.
Explicitly **not** a tiled paper-grain texture and **not** an SVG
`feTurbulence` noise filter — both are ruled out by the performance
budget (§7) on a surface that scrolls.

**Text color follows the surface it's actually on, not the app's dark
theme in general:**

| Element | Surface | Color |
|---|---|---|
| Player name | Parchment (direct) | `--ink`, `--font-display` |
| W-L record | Parchment (direct) | `--ink-muted` |
| Win rate % | Parchment (direct) | `--ink`, `--font-numeral` |
| Elo number | On top of the tier icon (§below) | `--text-offwhite`, `--font-numeral`, dark text-shadow for legibility over any icon color |

**Rank medals (top 3): literal gold/silver/bronze, not the tier ramp
below.** This is a deliberate choice where the brief offered a choice.
Gold/silver/bronze-for-1st/2nd/3rd is a universal, instantly-decoded
convention that doesn't depend on knowing this app's own tier bands. At a
glance, in a dim room, ordinal clarity wins. Each medal circle gets a
`--medal-ring` outline so it stays legible against parchment regardless of
how close its fill hue sits to the parchment tone.

**Elo is shown as an illustrated tier icon, not a plain colored pill** —
this is where "Elo sits like an item level" (the brief's own framing)
actually fits, since Elo is a power-level stat, not a rank. Six named
tiers, each with its own icon (`public/icons/StreamerUiIconN.png`), are
banded across the 1–100 scale following a standard ranked-game
progression (Stone/Bronze/Gold/Platinum/Diamond/Master). The bands are
intentionally **uneven** — narrow through the middle of the scale, with a
cutoff right at 50 (the Elo starting value), since that's where most
ratings actually cluster early in a group's history; wide at the two
extremes where few players will ever land:

| Elo range | Tier | Icon | Glow token |
|---|---|---|---|
| 1–34 | Stone | `StreamerUiIcon1.png` (grey crystal) | `--tier-stone-glow` |
| 35–44 | Bronze | `StreamerUiIcon2.png` (amber gem) | `--tier-bronze-glow` |
| 45–49 | Gold | `StreamerUiIcon3.png` (green gem, gold laurel) | `--tier-gold-glow` |
| 50–54 | Platinum | `StreamerUiIcon4.png` (cyan medallion) | `--tier-platinum-glow` |
| 55–64 | Diamond | `StreamerUiIcon5.png` (blue diamond) | `--tier-diamond-glow` |
| 65–100 | Master | `StreamerUiIcon6.png` (purple gem) | `--tier-master-glow` |

Tier names follow genre convention rather than literally describing each
icon's art (e.g. "Gold" is the green gem with a gold laurel frame, not a
yellow gem) — this is a common enough rank-tier vocabulary
(Stone/Bronze/.../Master) that matching the *name* to player expectations
matters more than matching the *color* to the name.

```css
.elo-badge {
  position: absolute; /* positioned along the leader line, see below */
  width: 40px;
  height: 40px;
}

.elo-icon {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain; /* icons aren't all the same aspect ratio */
  filter: drop-shadow(0 0 4px var(--tier-glow));
}

.elo-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-offwhite);
  font: 900 0.7rem var(--font-numeral);
  font-variant-numeric: tabular-nums;
  /* every icon has bright highlight regions somewhere in its art — the
     dark text-shadow keeps the number readable regardless of what part
     of which icon it happens to sit over, rather than assuming one text
     color works everywhere. */
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.9),
    0 0 3px rgba(0, 0, 0, 0.9);
}
```

A brand-new player starts at Elo 50 — exactly the bottom edge of
Platinum, the fourth of six tiers. That's a deliberate placement, not a
coincidence: the bands were drawn with a cutoff right at 50 specifically
so the starting rating lands just inside "solidly middling" rather than
at the bottom of the whole scale.

**Referencing `public/` assets from component code.** The tier icons live
in `public/icons/`, not `src/`, so they aren't processed by Vite's bundler
— a plain `/icons/StreamerUiIcon1.png` string would resolve against the
domain root in production and silently 404 under the GitHub Pages base
path (`/coin-keep/`, see ARCHITECTURE.md §1). Build the URL from
`import.meta.env.BASE_URL` instead (`` `${import.meta.env.BASE_URL}icons/${icon}` ``),
which Vite resolves to `/` in dev and `/coin-keep/` in the production
build.

**The dotted leader line reads as an engraved groove, not a CSS `border:
dotted`:**

```css
.leader-line {
  height: 2px;
  background-image: repeating-linear-gradient(
    to right,
    var(--parchment-shadow) 0 4px,
    transparent 4px 8px
  );
  box-shadow:
    inset 0 1px 0 rgba(0, 0, 0, 0.25),        /* groove shadow, upper half */
    inset 0 -1px 0 rgba(255, 255, 255, 0.35); /* groove highlight, lower half catching light */
}
```

The light-under/dark-over pairing follows the same top-left light source
as every frame (§3) — a groove catches light from above on its lower
edge, which is what makes it read as carved rather than printed.

### Tooltips / overlays

```css
.overlay {
  background: var(--overlay-bg);
  border: 1px solid var(--overlay-border);
  border-radius: var(--radius-overlay); /* 0 — no rounding, per direction */
}
```

First (and so far only) consumer: `RankInfoModal`, opened by the info
button on the Leaderboard page's header — a tap-triggered overlay, not a
hover-triggered one, since this app has no mouse. It lists all six tiers
(icon, name, Elo range) highest-to-lowest plus a short plain-language
paragraph on how the Elo system works, for a curious player who isn't
going to read ARCHITECTURE.md. Its panel uses `--overlay-bg`/`--overlay-border`/
`--radius-overlay` as specified; tier names inside it get `--text-gold`
(sparse, one line each) and the Elo ranges/description get `--text-offwhite`
(denser, more frequently read) — the same dark-panel text rules as
everywhere else (§5), applied to a new surface rather than a new rule.

---

## 5. Accessibility floors — non-negotiable, overrides the theme on conflict

**If anything above conflicts with what's in this section, this section
wins.** No exceptions for the sake of authenticity.

- **Legibility beats authenticity, full stop**, especially the risk of
  gold text on dark panels at small sizes.
- **Gold text (`--text-gold`) is reserved for sparse, large text on dark
  panels only** — section labels, page-toggle caption. Never for dense or
  frequently-scanned text, and never on parchment at all (measured
  1.16:1, a hard fail, not a style preference).

  Both `--text-gold` and `--text-offwhite` measure well above WCAG AA
  (4.5:1) on `--panel-bg` — 11.9:1 and 16.7:1 respectively — so this
  isn't a raw-contrast failure being routed around. It's two things
  contrast ratio alone doesn't capture: (1) reserving the accent color
  for headings keeps a visual hierarchy that a glance can parse quickly;
  using it everywhere flattens that hierarchy. (2) many phones apply a
  warm "night shift" color-temperature filter in low light — exactly the
  dim-room condition this app targets — which compresses the perceived
  difference between a warm gold and a warm-shifted dark panel more than
  it compresses a neutral off-white against the same panel. Off-white
  stays legible under that filter in a way a saturated warm color isn't
  guaranteed to.
- **Minimum sizes:**
  - Counter readout: unchanged, `clamp(4rem, 22vw, 8rem)` — always huge.
  - Section label (`COMBAT`/`GOLD`): ≥ 0.9rem (14.4px).
  - Elo badge numeral: 0.7rem (11.2px) — smaller than every other floor in
    this list, and a deliberate exception: the badge icon's shape, color,
    and position on the line carry the primary at-a-glance signal, and the
    overlaid number is a secondary, confirming readout for someone who
    wants the exact value. Verified legible in practice (dark text-shadow,
    §4) against every tier icon's brightest highlight regions.
  - Win rate / W-L record: ≥ 1rem (16px) for win rate, ≥ 0.85rem (13.6px)
    for the smaller W-L line beneath the name.
- **Measured contrast ratios** (sRGB relative-luminance, WCAG formula):

  | Pair | Ratio | Passes AA (4.5:1)? |
  |---|---|---|
  | `--text-offwhite` on `--panel-bg` | 16.7:1 | Yes |
  | `--text-gold` on `--panel-bg` | 11.9:1 | Yes |
  | `--ink` on `--parchment` | 11.6:1 | Yes |
  | `--ink-muted` on `--parchment` | 8.2:1 | Yes |
  | `--danger-text` on `--danger-bg-deep` | 8.4:1 | Yes |
  | `--text-gold` on `--parchment` | **1.16:1** | **No — never use this pairing** |
  | `--text-disabled` on `--panel-bg` | 3.3:1 | No (see below) |

  `--text-disabled` intentionally sits below AA — it's for de-emphasized,
  non-interactive text, which WCAG exempts from the contrast requirement.
  No component uses it yet. If a future disabled state needs to be
  *read*, not just visually skipped, use a lighter value (e.g. `#8a8374`)
  and re-check contrast rather than reusing this token as-is.
- **Tap targets stay large regardless of ornament.** Every interactive
  element's stated `min-height`/`min-width` (56px floor) is set with
  `box-sizing: border-box`, so the frame border is *inside* that
  dimension — ornament never shrinks the real hit area below the floor.
  Where a frame's visual bevel would otherwise want to extend outward
  (e.g. the corner rivets), implement it with `box-shadow`/pseudo-element
  overlay rather than growing the element's actual box, so it can spill
  outside the visual bounds without affecting touch geometry either way.

---

## 6. Mobile performance budget

No heavy tiled textures, no expensive filters, no `backdrop-filter` on
anything that scrolls. Concretely:

- **No `backdrop-filter` on the Leaderboard list or any scrolling
  surface.** It forces expensive per-frame compositing, particularly on
  mid-range Android WebViews. If ever used on a genuinely static overlay
  (not scrolling), keep it rare and test on real hardware first.
- **No SVG `feTurbulence` / heavy `feGaussianBlur` filters on anything
  that scrolls.** Many mobile GPUs fall back to software rasterization
  for SVG filters, which is exactly the kind of jank a 50+ row
  leaderboard scroll can't afford. This is why parchment "grain" is a
  couple of static `radial-gradient` blotches, not a noise filter (§4).
- **Prefer `box-shadow`/gradients over `filter: drop-shadow()`** —
  cheaper, compositor-friendly, doesn't force an extra rasterization
  pass.
- **Cap decoration per repeated element.** A `LeaderboardRow` renders up
  to 50+ times on a large roster; keep each row to ~1 dotted-line
  background + 1–2 flat-color fills + at most 1 box-shadow. The heavier
  multi-layer bevel treatment (§3) is for one-off panels (the counters,
  the header), not for anything that repeats per row.
- **No `background-attachment: fixed`** — triggers continuous repaint on
  scroll in a number of mobile browsers.
- If in doubt, the actual test is: scroll a 50+ row leaderboard on a
  mid-range Android device and watch for dropped frames. Nothing in this
  spec should require more than that to validate.

---

## 7. Ornament scales down on narrow viewports

Ornamentation should shrink before it crowds content, not the other way
around. Tie the frame border thickness and corner-rivet size to viewport
width the same way the readout font already uses `clamp()`:

```css
:root {
  --frame-border-width: clamp(2px, 1vw, 3px);
  --rivet-size: clamp(6px, 2vw, 10px);
}
```

On the narrowest phones this quietly thins the metal border and shrinks
the corner rivets rather than letting them eat into the content area or
overlap the touch targets they're framing.

---

## Authenticity vs. usability — deliberate departures

| Where the theme departs from the source look | Why |
|---|---|
| Gold text banned on parchment entirely, dark ink used instead | Measured 1.16:1 contrast — an unreadable pairing, not a stylistic call. Real WoW quest-log parchment gets away with gold-ish text at native desktop resolution/zoom; that doesn't survive arm's-length mobile viewing in a dim room. |
| `--radius-frame: 2px`, not a hard `0` | Authentic WoW chrome is almost perfectly rectangular. A razor-sharp 0px corner can read as a rendering glitch on some mobile displays at small sizes; 2px is close enough to sharp to keep the metal-frame look while avoiding that. (Overlays/tooltips *do* get a hard `0` per the brief — that's a different, larger surface where the artifact risk doesn't apply the same way.) |
| No tiled textures anywhere (parchment grain, brushed metal) | Two independent reasons, not one: performance (§6) and avoiding anything that could resemble an extracted asset. Flat colors and soft gradients stand in for both. |
| Combat/Gold "resource bars" don't visually fill or empty with the value | Real rage/mana bars are bounded 0–100% and show that fraction. COMBAT/GOLD here are unbounded counters with no ceiling, so there's no fraction to show — the bar styling is atmosphere around a numeral, not a literal resource gauge. Don't let a future contributor "finish the metaphor" by wiring a fill percentage to an unbounded number. |
| Illustrated tier icons + a matched glow used for Elo, not for rank medals | The brief offered this as an open choice for the top-3 treatment. Literal gold/silver/bronze wins there for universal, instant ordinal legibility; an arbitrary quality-style ramp's internal order isn't obvious to anyone unfamiliar with that specific convention and would undercut a glanceable ranking. Illustrated icons are used instead for the Elo badge, where "power level" framing actually fits and the artwork itself carries most of the signal. |
| Uneven Elo tier bands (34/10/5/5/10/36), not six even ~17-point bands | Most ratings cluster near the 50 starting point early in a group's history, with a cutoff right at 50 itself; the two 5-point bands flanking it (Gold 45–49, Platinum 50–54) give the finest differentiation right where it matters, while the wide catch-all bands at the extremes (1–34, 65–100) cost little since few players will ever reach them. |
| Cinzel (not Cinzel Decorative) for all in-UI headings/names | Decorative's swash caps cost real scanning speed across a long leaderboard. Decorative is reserved for a hypothetical splash/title screen outside the app's core surfaces — nothing in the current app uses it. |
| Numerals in a plain heavy sans (Inter), not a themed serif | The counter readout is the single most important thing on screen, read at a glance mid-turn. A serif — however good-looking — reads slower than a heavy sans with tabular figures at any size. This is the clearest case of the accessibility floor (§5) overriding the aesthetic direction outright. |
| No hover states anywhere | WoW is a mouse-and-tooltip-driven desktop UI. This app is touch-only; every "hover" concept here becomes a press/active state instead, and the tooltip tokens (§4) are speculative for a future tap-triggered overlay, not a hover pattern. |
