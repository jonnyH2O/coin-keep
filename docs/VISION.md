# Hero Realms Combat Tracker — Vision

## What this is

A small, vertical, mobile-first web app that sits on the table during a
physical Hero Realms game. It replaces two things people currently track by
hand or in their head: the combat total they're accumulating on their turn,
and their gold. It also keeps a running leaderboard of the group's games
over time, using an Elo rating derived from a hand-edited match log.

It is deployed as a static site on GitHub Pages. There is no backend, no
accounts, no network calls at runtime.

## Who uses it

Each player at the table runs their own copy on their own phone. It is a
personal scratchpad for *their* turn, not a shared table display and not a
multiplayer session. Nobody else's phone knows what's on your screen, and
that's intentional — Hero Realms is a physical card game; the app's only
job is to save you from doing arithmetic in your head while holding cards.

Between games, the same small group looks at the Leaderboard page to see
who's winning over time.

## The two pages

**Tracker (default page).** The page you're on for the entire game. Top
half is COMBAT, bottom half is GOLD, each with a big numeric readout and
+5/+1/-1/-5 buttons directly beneath it. A "Clear All" button top-left zeros
both out at the start of a new turn or a new game. This is the page that
has to work perfectly one-handed, at speed, without looking away from the
table for more than a glance.

**Leaderboard.** The page you check between games, not during one. A
vertical, sorted list of everyone who has ever played: name, W–L record,
Elo rating, and win rate, with the top three visually called out
(gold/silver/bronze). It's read-only in the app — the data behind it comes
from a match log that lives in the repo, not from anything you tap on your
phone.

A single button in the top-right corner toggles between the two pages.

## Non-goals

This app deliberately does **not**:

- Sync or share state between players' phones. Each phone is independent.
- Track combat/gold per-player within a shared session, or know who "the
  other players" are during a game. The Tracker has no concept of players
  at all — it's one counter pair for whoever's holding the phone.
- Persist turn-by-turn or game-by-game history from the Tracker. Combat and
  gold values are throwaway; once the game's over or the phone refreshes
  days later, nobody expects them to still mean anything.
- Let you record a match result from the UI. Adding a match to the
  leaderboard is a deliberate, out-of-band act (edit JSON, push) — not
  something that happens accidentally from the same screen you're mashing
  buttons on mid-combat.
- Require an account, login, or any per-user identity beyond a display
  name string in the match log.
- Talk to a server or database. If GitHub Pages can't serve it as a static
  file, it doesn't happen.
- Enforce a fixed player cap, either at the table (match size) or in the
  overall roster. The group can grow indefinitely.

## What matters most at the table

- **Glanceability.** The current combat/gold number has to be readable at
  arm's length, in a dim room, without squinting. Big type, high contrast,
  minimal chrome.
- **Speed and forgiveness of touch.** Buttons are large and unambiguous,
  because this gets tapped rapidly and one-handed while the other hand is
  holding cards. No accidental zoom, no accidental text selection, no
  missed taps.
- **Trustworthy persistence without ceremony.** If the phone refreshes or
  locks mid-turn, the numbers should still be there — but nobody should
  ever feel like they need to "save" anything. It's scratch paper that
  happens to survive a refresh, not a record anyone is precious about.
- **Getting out of the way.** The app's entire value is being faster than
  mental math or a physical pad. Any friction — extra taps, load time,
  confirmation dialogs — works directly against the reason it exists.
- **Leaderboard trust.** The one thing that *is* durable — the match log
  and the ratings derived from it — has to be simple enough to hand-edit
  correctly and hard to silently corrupt, since there's no UI safety net
  protecting it.
