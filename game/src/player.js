// Sable, the retired locksmith. Movement with wall sliding, noise
// state (running is loud, crouching is quiet), and the coin throw.
import { CROUCH_SPEED, PLAYER_RADIUS, RUN_SPEED, WALK_SPEED } from './config.js';
import { circleHitsRect } from './geometry.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    facing: 0,
    running: false,
    crouching: false,
    moving: false,
    stepTime: 0,
    coins: 5,
    smoke: 2,
    hasLedger: false,
    lockpicking: 0,
  };
}

export function movePlayer(player, dx, dy, dt, solids) {
  const speed = player.crouching ? CROUCH_SPEED : player.running ? RUN_SPEED : WALK_SPEED;
  player.moving = dx !== 0 || dy !== 0;
  if (!player.moving) return;
  const len = Math.hypot(dx, dy);
  const nx = dx / len;
  const ny = dy / len;
  player.facing = Math.atan2(ny, nx);
  player.lastDx = nx;
  player.lastDy = ny;
  tryAxis(player, nx * speed * dt, 0, solids);
  tryAxis(player, 0, ny * speed * dt, solids);
  player.stepTime += dt;
}

function tryAxis(player, mx, my, solids) {
  const nextX = player.x + mx;
  const nextY = player.y + my;
  for (const rect of solids) {
    if (circleHitsRect(nextX, nextY, PLAYER_RADIUS, rect)) return;
  }
  player.x = nextX;
  player.y = nextY;
}

export function playerNoiseLevel(player) {
  if (player.running) return 1;
  if (player.crouching) return 0.15;
  return 0.45;
}
