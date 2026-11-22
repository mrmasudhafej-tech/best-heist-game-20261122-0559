// Staged scenes for screenshots: ?shot=cover|alert|loot|getaway
// places the thief, guards, cameras and loot deterministically so
// one frame shows the whole game. A staged game is frozen — the
// scene is posed, not played — so the screenshot is exactly the
// frame the maker composed.
import { loadLevel } from './game.js';

const SHOT_NAMES = ['cover', 'alert', 'loot', 'getaway'];

export function shotNameFromUrl(search) {
  const params = new URLSearchParams(search);
  const name = params.get('shot');
  return SHOT_NAMES.includes(name) ? name : null;
}

function faceToward(guard, x, y) {
  guard.facing = Math.atan2(y - guard.y, x - guard.x);
}

export function applyShot(state, name) {
  // Always stage room 1: it is the room the cover must show.
  loadLevel(state, 0);
  state.phase = 'playing';
  state.staged = true;
  state.elapsed = 74;
  state.score = 620;
  const player = state.player;
  const [mara, pell, odo] = state.guards;
  const [camA, camB] = state.cameras;

  if (name === 'cover') {
    player.x = 600;
    player.y = 440;
    player.facing = -0.5;
    mara.x = 300; mara.y = 300; faceToward(mara, 640, 360);
    pell.x = 920; pell.y = 280; faceToward(pell, 640, 380);
    odo.x = 560; odo.y = 615; faceToward(odo, 640, 360);
    camA.angle = 0.15;
    camB.angle = Math.PI;
    state.alarm = 28;
    state.prompt = 'READ THE CONES — THEN MOVE';
  } else if (name === 'alert') {
    player.x = 560;
    player.y = 360;
    player.facing = 0.2;
    mara.x = 380; mara.y = 360; faceToward(mara, player.x, player.y);
    pell.x = 980; pell.y = 260; faceToward(pell, 700, 300);
    odo.x = 300; odo.y = 600; faceToward(odo, 500, 480);
    mara.alerted = true;
    state.strikes = 1;
    camA.angle = 0.35;
    camB.angle = Math.PI - 0.3;
    state.alarm = 82;
    state.prompt = 'SPOTTED — BREAK LINE OF SIGHT!';
  } else if (name === 'loot') {
    player.x = 648;
    player.y = 408;
    player.facing = -Math.PI / 2;
    player.lockpicking = 1;
    state.lockProgress = 0.62;
    mara.x = 280; mara.y = 240; faceToward(mara, 500, 240);
    pell.x = 980; pell.y = 240; faceToward(pell, 800, 300);
    odo.x = 560; odo.y = 620; faceToward(odo, 500, 480);
    camA.angle = 0.1;
    camB.angle = Math.PI;
    state.alarm = 18;
    state.prompt = 'HOLD E — PICK THE LOCK';
    state.score = 740;
  } else if (name === 'getaway') {
    player.x = 1112;
    player.y = 610;
    player.facing = 0;
    player.hasLedger = true;
    state.ledgerTaken = true;
    state.lootTaken = 3;
    state.score = 1290;
    mara.x = 300; mara.y = 300; faceToward(mara, 500, 360);
    pell.x = 800; pell.y = 180; faceToward(pell, 640, 300);
    odo.x = 500; odo.y = 600; faceToward(odo, 700, 500);
    camA.angle = 0.25;
    camB.angle = Math.PI + 0.2;
    state.alarm = 12;
    state.prompt = 'LEDGER SECURED — REACH THE GETAWAY EXIT!';
  }
  return state;
}
