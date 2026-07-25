# Hero Realms Combat Tracker

A vertical, mobile-first web app used at the table during Hero Realms
games: a COMBAT/GOLD scratchpad for your turn, and a leaderboard with
Elo ratings derived from a hand-edited match log. Deployed as a static
site on GitHub Pages.

See [docs/VISION.md](docs/VISION.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
for the full design.

## Adding a match

1. Open [data/matches.json](data/matches.json) and append an entry to the
   `matches` array:

   ```json
   {
     "date": "2026-07-25",
     "players": ["Alice", "Bob", "Carol"],
     "winner": "Alice"
   }
   ```

   `date` is `YYYY-MM-DD`. `players` lists everyone who played, spelled
   exactly the way they're spelled everywhere else in the file — a typo
   like `"bob"` instead of `"Bob"` will fail validation rather than
   silently creating a second player. `winner` must be one of the names
   in `players`.

2. Regenerate the leaderboard cache:

   ```sh
   npm run generate:standings
   ```

   This overwrites [data/standings.json](data/standings.json). Never edit
   that file by hand — it's a build artifact.

3. Commit both files and push. CI re-verifies and rebuilds it anyway, so
   a forgotten regeneration fails the build rather than shipping a stale
   leaderboard.

## Development

```sh
npm install
npm run dev              # dev server
npm test                 # unit tests for the Elo engine + validation
npm run generate:standings   # rebuild data/standings.json from data/matches.json
npm run verify:standings     # check data/standings.json isn't stale, without writing
npm run build             # regenerates standings, type-checks, builds dist/
```

## Installing on a phone

The deployed site is installable as a home-screen app (icon, standalone
window, no browser address bar) via the web manifest in
[public/manifest.webmanifest](public/manifest.webmanifest):

- **iOS Safari**: Share → "Add to Home Screen"
- **Android Chrome**: menu (⋮) → "Add to Home screen" / "Install app"

This is installability only, not offline support — it still needs a
network connection to load, same as any other page.

## Deployment

Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
which verifies the standings cache, runs tests, builds, and publishes to
GitHub Pages.
