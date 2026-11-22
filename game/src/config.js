// Shared tuning for The Gilded Ledger — Amber Vault Heist.
// One place for every number that shapes how the heist feels:
// movement speeds, the alarm meter, guard and camera vision, tools.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 72;

export const PLAYER_RADIUS = 15;
export const WALK_SPEED = 150;
export const RUN_SPEED = 245;
export const CROUCH_SPEED = 82;

export const ALARM_RISE_GUARD = 46;
export const ALARM_RISE_CAMERA = 34;
export const ALARM_DRAIN = 26;
export const ALARM_WARN_AT = 62;
export const ALARM_MAX = 100;
export const MAX_STRIKES = 3;

export const GUARD_RANGE = 235;
export const GUARD_HALF_ANGLE = 0.46;
export const CAMERA_RANGE = 265;
export const CAMERA_HALF_ANGLE = 0.38;

export const COIN_COUNT = 5;
export const COIN_NOISE_RADIUS = 210;
export const SMOKE_COUNT = 2;
export const SMOKE_SECONDS = 4.5;
export const LOCKPICK_SECONDS = 1.6;
export const LEDGER_SCORE = 500;
export const EXIT_SCORE = 250;

export const PALETTE = {
  floor: '#2b2118',
  floorDark: '#241b13',
  wall: '#4a3b28',
  wallTop: '#6b563a',
  shelf: '#5a3d22',
  crate: '#7a5a30',
  caseGlass: '#9fd8e8',
  gold: '#f2c14e',
  amber: '#ff9d2e',
  guard: '#c94f4f',
  guardDark: '#8e2f2f',
  camera: '#e8e8e8',
  thief: '#3fa7a0',
  thiefDark: '#23665f',
  smoke: '#cfd6d4',
};
