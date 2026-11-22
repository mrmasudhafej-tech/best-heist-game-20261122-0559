// The heist itself: phases, the alarm meter, strikes, loot,
// lockpicking, coins, smoke and the getaway. Rendering lives in
// render.js and hud.js; this file owns every rule that changes state.
import {
  ALARM_DRAIN,
  ALARM_MAX,
  ALARM_RISE_CAMERA,
  ALARM_RISE_GUARD,
  COIN_COUNT,
  EXIT_SCORE,
  LEDGER_SCORE,
  LOCKPICK_SECONDS,
  MAX_STRIKES,
  SMOKE_COUNT,
  SMOKE_SECONDS,
} from './config.js';
import { buildAllLevels, collisionRects, sightBlockers } from './level.js';
import { cameraSeesThief, createCamera, updateCamera } from './cameras.js';
import { createGuard, guardSeesThief, sendGuardsToCoin, updateGuard } from './guards.js';
import { createPlayer, movePlayer } from './player.js';
import { distanceBetween, hasLineOfSight, rectsOverlap } from './geometry.js';
import {
  ensureAudio,
  playAlarmBeep,
  playCaughtSting,
  playCoinClink,
  playDoorUnlock,
  playFootstep,
  playLockTick,
  playLootChime,
  playSmokeWhoosh,
  playWinFanfare,
  toggleMute,
} from './audio.js';
import { endFrameInput, keyHeld, keyPressed } from './input.js';

export function createGame(seed) {
  const levels = buildAllLevels();
  const state = {
    seed,
    levels,
    levelIndex: 0,
    phase: 'title',
    alarm: 0,
    strikes: 0,
    score: 0,
    elapsed: 0,
    lootTaken: 0,
    lootTotal: levels.reduce((n, level) => n + level.loot.length, 0),
    spottedTimer: 0,
    beepTimer: 0,
    prompt: '',
    lockProgress: 0,
    ledgerTaken: false,
    staged: false,
    coinsFlying: [],
    coinsLanded: [],
    smokeClouds: [],
    levelStartScore: 0,
    levelStartLoot: 0,
    time: 0,
  };
  loadLevel(state, 0);
  return state;
}

export function loadLevel(state, index) {
  state.levelIndex = index;
  state.level = state.levels[index];
  state.guards = state.level.guards.map(createGuard);
  state.cameras = state.level.cameras.map(createCamera);
  state.player = createPlayer(state.level.playerStart);
  state.player.coins = COIN_COUNT;
  state.player.smoke = SMOKE_COUNT;
  state.solids = collisionRects(state.level);
  state.sightBlockers = sightBlockers(state.level);
  state.alarm = 0;
  state.lockProgress = 0;
  state.ledgerTaken = false;
  state.coinsFlying = [];
  state.coinsLanded = [];
  state.smokeClouds = [];
  state.levelStartScore = state.score;
  state.levelStartLoot = state.lootTaken;
  // Fresh loot for this room.
  state.level.loot.forEach((loot) => { loot.taken = false; });
}

function restoreLevelAfterStrike(state) {
  state.score = state.levelStartScore;
  state.lootTaken = state.levelStartLoot;
  state.strikes += 1;
  if (state.strikes >= MAX_STRIKES) {
    state.phase = 'caught';
    return;
  }
  loadLevel(state, state.levelIndex);
  state.score = state.levelStartScore;
  state.lootTaken = state.levelStartLoot;
  state.phase = 'playing';
}

function playerHiddenBySmoke(state) {
  return state.smokeClouds.some((cloud) => distanceBetween(cloud.x, cloud.y, state.player.x, state.player.y) < 72);
}

function smokeBlocksSight(state, fromX, fromY) {
  for (const cloud of state.smokeClouds) {
    const rect = { x: cloud.x - 55, y: cloud.y - 55, w: 110, h: 110 };
    if (hasLineOfSight(fromX, fromY, state.player.x, state.player.y, [rect]) === false) return true;
  }
  return false;
}

function strongestSight(state) {
  if (playerHiddenBySmoke(state)) return { strength: 0, kind: 'none' };
  const player = state.player;
  // Crouching behind a low crate breaks sight: crates join the
  // sight blockers only while the thief is crouched.
  const blockers = player.crouching
    ? [...state.sightBlockers, ...state.level.crates]
    : state.sightBlockers;
  let best = { strength: 0, kind: 'none' };
  for (const guard of state.guards) {
    if (smokeBlocksSight(state, guard.x, guard.y)) continue;
  const strength = guardSeesThief(guard, player, blockers);
    if (strength > best.strength) best = { strength, kind: 'guard' };
  }
  for (const camera of state.cameras) {
    if (smokeBlocksSight(state, camera.x, camera.y)) continue;
    const strength = cameraSeesThief(camera, player, blockers);
    if (strength > best.strength) best = { strength, kind: 'camera' };
  }
  return best;
}

function updatePlaying(state, dt, input, audio, time) {
  const player = state.player;
  const level = state.level;
  state.elapsed += dt;

  // Movement.
  let dx = 0;
  let dy = 0;
  if (keyHeld(input, 'a', 'arrowleft')) dx -= 1;
  if (keyHeld(input, 'd', 'arrowright')) dx += 1;
  if (keyHeld(input, 'w', 'arrowup')) dy -= 1;
  if (keyHeld(input, 's', 'arrowdown')) dy += 1;
  player.running = keyHeld(input, 'shift') && (dx !== 0 || dy !== 0);
  player.crouching = keyHeld(input, 'c');
  const before = { x: player.x, y: player.y };
  movePlayer(player, dx, dy, dt, state.solids);
  const moved = Math.hypot(player.x - before.x, player.y - before.y);
  if (moved > 1) {
    player.stepTime -= dt;
    if (player.stepTime <= 0) {
      playFootstep(audio, player.running);
      player.stepTime = player.running ? 0.24 : 0.38;
    }
  }

  // Coin throw: click aims, the coin flies and lands with a clink.
  if (input.mouse.clicked && player.coins > 0 && state.phase === 'playing') {
    ensureAudio(audio);
    player.coins -= 1;
    const tx = input.mouse.clickX;
    const ty = input.mouse.clickY;
    const dist = Math.max(1, distanceBetween(player.x, player.y, tx, ty));
    const reach = Math.min(dist, 280);
    state.coinsFlying.push({
      fromX: player.x, fromY: player.y,
      x: player.x, y: player.y,
      toX: player.x + ((tx - player.x) / dist) * reach,
      toY: player.y + ((ty - player.y) / dist) * reach,
      t: 0,
    });
  }
  for (const coin of state.coinsFlying) {
    coin.t += dt / 0.32;
    const t = Math.min(1, coin.t);
    coin.x = coin.fromX + (coin.toX - coin.fromX) * t;
    coin.y = coin.fromY + (coin.toY - coin.fromY) * t - Math.sin(t * Math.PI) * 26;
    if (coin.t >= 1) {
      coin.landed = true;
      playCoinClink(audio);
      sendGuardsToCoin(state.guards, { x: coin.toX, y: coin.toY });
      state.coinsLanded.push({ x: coin.toX, y: coin.toY, ttl: 4 });
    }
  }
  state.coinsFlying = state.coinsFlying.filter((coin) => !coin.landed);
  for (const coin of state.coinsLanded) coin.ttl -= dt;
  state.coinsLanded = state.coinsLanded.filter((coin) => coin.ttl > 0);

  // Smoke puff at the thief's feet.
  if (keyPressed(input, 'q') && player.smoke > 0) {
    ensureAudio(audio);
    player.smoke -= 1;
    state.smokeClouds.push({ x: player.x, y: player.y, ttl: SMOKE_SECONDS });
    playSmokeWhoosh(audio);
  }
  for (const cloud of state.smokeClouds) cloud.ttl -= dt;
  state.smokeClouds = state.smokeClouds.filter((cloud) => cloud.ttl > 0);

  // Patrols and cameras.
  for (const guard of state.guards) updateGuard(guard, dt, state.sightBlockers);
  for (const camera of state.cameras) updateCamera(camera, time);

  // The alarm meter: seen and it climbs, hidden and it drains.
  const seen = strongestSight(state);
  if (seen.strength > 0) {
    const rate = seen.kind === 'camera' ? ALARM_RISE_CAMERA : ALARM_RISE_GUARD;
    state.alarm = Math.min(ALARM_MAX, state.alarm + rate * seen.strength * dt);
    state.beepTimer -= dt;
    if (state.alarm >= 55 && state.beepTimer <= 0) {
      playAlarmBeep(audio);
      state.beepTimer = 0.55;
    }
  } else {
    state.alarm = Math.max(0, state.alarm - ALARM_DRAIN * dt);
  }
  if (state.alarm >= ALARM_MAX) {
    state.phase = 'spotted';
    state.spottedTimer = 1.1;
    playCaughtSting(audio);
    return;
  }

  // Loot, lockpicking and prompts.
  state.prompt = '';
  const ped = level.pedestal;
  const pedDist = distanceBetween(player.x, player.y, ped.x + ped.w / 2, ped.y + ped.h / 2);
  let nearLoot = null;
  for (const loot of level.loot) {
    if (!loot.taken && distanceBetween(player.x, player.y, loot.x, loot.y) < 48) nearLoot = loot;
  }
  if (nearLoot && keyPressed(input, 'e')) {
    nearLoot.taken = true;
    state.lootTaken += 1;
    state.score += nearLoot.value;
    playLootChime(audio);
  }
  if (!state.ledgerTaken && pedDist < 78) {
    state.prompt = 'HOLD E — PICK THE LOCK';
    if (keyHeld(input, 'e')) {
      player.lockpicking = 1;
      state.lockProgress += dt / LOCKPICK_SECONDS;
      if (Math.random() < dt * 3) playLockTick(audio);
      if (state.lockProgress >= 1) {
        state.ledgerTaken = true;
        player.hasLedger = true;
        state.score += LEDGER_SCORE;
        player.lockpicking = 0;
        playDoorUnlock(audio);
        playLootChime(audio);
      }
    } else {
      player.lockpicking = 0;
      state.lockProgress = Math.max(0, state.lockProgress - dt * 0.8);
    }
  } else if (nearLoot) {
    state.prompt = `PRESS E — GRAB ${nearLoot.name.toUpperCase()} (+${nearLoot.value})`;
    player.lockpicking = 0;
  } else {
    player.lockpicking = 0;
    if (!state.ledgerTaken && pedDist < 160) state.prompt = 'THE AMBER LEDGER — GET TO THE PEDESTAL';
    else if (state.ledgerTaken) state.prompt = 'LEDGER SECURED — REACH THE GETAWAY EXIT!';
  }

  // The exit: walk in with the Ledger to clear the room.
  const exit = level.exit;
  const inExit = rectsOverlap(
    { x: player.x - 12, y: player.y - 12, w: 24, h: 24 },
    exit,
  );
  if (inExit && state.ledgerTaken) {
    state.score += EXIT_SCORE;
    if (state.levelIndex >= state.levels.length - 1) {
      state.phase = 'won';
      playWinFanfare(audio);
    } else {
      state.phase = 'roomClear';
    }
  } else if (inExit) {
    state.prompt = 'LOCKED — TAKE THE AMBER LEDGER FIRST';
  }

  if (keyPressed(input, 'm')) toggleMute(audio);
  if (keyPressed(input, 'r')) {
    state.strikes = 0;
    state.score = 0;
    state.lootTaken = 0;
    state.elapsed = 0;
    loadLevel(state, 0);
  }
}

export function updateGame(state, dt, input, audio) {
  state.time += dt;
  if (state.staged) {
    endFrameInput(input);
    return;
  }
  switch (state.phase) {
    case 'title':
      if (keyPressed(input, 'enter') || input.mouse.clicked) {
        ensureAudio(audio);
        state.phase = 'playing';
      }
      break;
    case 'playing':
      updatePlaying(state, dt, input, audio, state.time);
      break;
    case 'spotted':
      state.spottedTimer -= dt;
      if (state.spottedTimer <= 0) restoreLevelAfterStrike(state);
      break;
    case 'caught':
      if (keyPressed(input, 'r') || keyPressed(input, 'enter')) {
        state.strikes = 0;
        state.score = 0;
        state.lootTaken = 0;
        state.elapsed = 0;
        loadLevel(state, 0);
        state.phase = 'playing';
      }
      break;
    case 'roomClear':
      if (keyPressed(input, 'enter')) {
        loadLevel(state, state.levelIndex + 1);
        state.phase = 'playing';
      }
      break;
    case 'won':
      if (keyPressed(input, 'r')) {
        state.strikes = 0;
        state.score = 0;
        state.lootTaken = 0;
        state.elapsed = 0;
        loadLevel(state, 0);
        state.phase = 'playing';
      }
      break;
    default:
      break;
  }
  endFrameInput(input);
}

// Test hook: read-only snapshot of the rules that matter in a
// play-test (alarm, strikes, phase, loot, position).
export function gameSnapshot(state) {
  return {
    phase: state.phase,
    alarm: Math.round(state.alarm),
    strikes: state.strikes,
    score: state.score,
    lootTaken: state.lootTaken,
    hasLedger: state.player.hasLedger,
    player: { x: Math.round(state.player.x), y: Math.round(state.player.y) },
    level: state.levelIndex + 1,
  };
}
