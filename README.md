# The Gilded Ledger — Amber Vault Heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/mrmasudhafej-tech/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/mrmasudhafej-tech/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

An original top-down heist game. Sable, a retired locksmith, crosses three
guarded rooms of the Amber Vault, steals the Amber Ledger from its pedestal,
and reaches the getaway van — past patrolling guards with sweeping vision
cones and wall cameras with red sweeping cones, while the alarm meter climbs
whenever she is seen.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network
requests: every file the game loads lives under `game/`.

## How to play

- **WASD / arrow keys** — move Sable.
- **Shift** — run. Fast, but loud: guards spot a running thief sooner.
- **C** — crouch. Slow and quiet; crouching behind a crate breaks a
  guard's line of sight.
- **Mouse click** — throw a coin. The nearest guard walks over to
  investigate the clink. You carry 5 coins per room.
- **E** — grab side loot. **Hold E** at the pedestal to pick the lock
  (about 1.6 seconds) and take the Amber Ledger.
- **Q** — throw a smoke puff (2 per room). Smoke hides Sable inside it
  and blocks sight through it.
- **M** — mute. **R** — restart the heist.

The **ALARM** meter in the HUD rises while a guard or camera can see Sable
and drains while she is hidden. It flashes a warning above 62%. At 100% a
strike is called: Sable is sent back to the start of the room. Three
strikes and the job is blown. Grabbing the Ledger unlocks the exit; walking
into it clears the room. Clear all three rooms to win.

## Rooms

1. **The Vault Hall** — wide lanes between long shelves, two routes around
   the hall, three patrolling guards and two cameras.
2. **The Gilded Gallery** — crossing diagonal patrols around a central
   carpet, cameras watching both doors.
3. **The Amber Vault** — tight lanes, faster patrols, the final Ledger and
   the getaway van door.

Side loot in glass cases (coins, gems, masks, crowns, amber, opals, pearls,
rubies) adds score; the Ledger is worth 500 and the exit 250. Tools cost:
coins and smoke are limited per room, and lockpicking takes time in the open.

## Layout

- `main.ts` — hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `serve.ts` — tiny static server for local play-testing.
- `shots.json` — the four staged screenshot scenes and their URLs.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html` — the page; loads `game/src/main.js` as a module.
- `game/src/config.js` — tuning: speeds, alarm rates, vision, tool counts.
- `game/src/random.js` — seeded random helper for repeatable staging.
- `game/src/geometry.js` — rectangles, line of sight and vision raycasts.
- `game/src/level.js` — the three room floor plans and their patrols.
- `game/src/guards.js` — guard patrols, coin investigation, guard vision.
- `game/src/cameras.js` — sweeping wall cameras and camera vision.
- `game/src/player.js` — Sable's movement, wall sliding and noise.
- `game/src/audio.js` — synthesised WebAudio sounds only; no audio files.
- `game/src/input.js` — keyboard and mouse state.
- `game/src/render.js` — drawing the room, cones, people and loot.
- `game/src/hud.js` — the alarm meter, score, prompts and overlays.
- `game/src/game.js` — phases, alarm, strikes, loot, lockpicking, getaway.
- `game/src/shots.js` — staged `?shot=` scenes used for the screenshots.
- `game/src/main.js` — boot and the frame loop.
- `screenshots/` — four real renders of the game's own code, 1280×720.

## Screenshots

The cover (`1-cover.jpg`) shows the whole game in one frame: the Vault Hall,
Sable mid-room, three guards with vision cones, two cameras with red cones,
the glowing Amber Ledger and the alarm meter. The other shots show a guard
about to spot Sable with the alarm high, the lockpick at the pedestal, and
the getaway with the Ledger secured.

All art, names, sounds and levels are original to this entry. License: MIT
(see `LICENSE`).
