// Patrolling guards: they walk their route, pause at each corner,
// turn to face where they walk, and investigate a thrown coin.
// A guard sees the thief only inside the sweeping vision cone with a
// clear line of sight — crouching behind a crate breaks the sight.
import { GUARD_RANGE, GUARD_HALF_ANGLE, COIN_NOISE_RADIUS } from './config.js';
import { angleDifference, distanceBetween, hasLineOfSight } from './geometry.js';

export function createGuard(def) {
  const start = def.path[0];
  return {
    name: def.name,
    path: def.path,
    speed: def.speed,
    pause: def.pause,
    x: start[0],
    y: start[1],
    targetIndex: 1 % def.path.length,
    facing: 0,
    pauseLeft: 0,
    investigate: null,
    investigateLeft: 0,
    alerted: false,
  };
}

export function updateGuard(guard, dt, blockers) {
  if (guard.investigate) {
    guard.investigateLeft -= dt;
    const dest = guard.investigate;
    const dist = distanceBetween(guard.x, guard.y, dest.x, dest.y);
    if (dist > 6) {
      const step = Math.min(dist, guard.speed * 1.35 * dt);
      guard.x += ((dest.x - guard.x) / dist) * step;
      guard.y += ((dest.y - guard.y) / dist) * step;
      guard.facing = Math.atan2(dest.y - guard.y, dest.x - guard.x);
    } else {
      guard.facing += Math.sin(performance.now() / 300) * 0.02;
    }
    if (guard.investigateLeft <= 0) {
      guard.investigate = null;
      guard.targetIndex = nearestPathIndex(guard);
    }
    return;
  }
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    return;
  }
  const target = guard.path[guard.targetIndex];
  const dist = distanceBetween(guard.x, guard.y, target[0], target[1]);
  if (dist < 8) {
    guard.targetIndex = (guard.targetIndex + 1) % guard.path.length;
    guard.pauseLeft = guard.pause;
    return;
  }
  const step = Math.min(dist, guard.speed * dt);
  guard.x += ((target[0] - guard.x) / dist) * step;
  guard.y += ((target[1] - guard.y) / dist) * step;
  guard.facing = Math.atan2(target[1] - guard.y, target[0] - guard.x);
}

function nearestPathIndex(guard) {
  let best = 0;
  let bestDist = Infinity;
  guard.path.forEach((point, index) => {
    const d = distanceBetween(guard.x, guard.y, point[0], point[1]);
    if (d < bestDist) {
      bestDist = d;
      best = index;
    }
  });
  return best;
}

// A coin landing nearby sends the closest guard to look at it.
export function sendGuardsToCoin(guards, coin) {
  let best = null;
  let bestDist = Infinity;
  for (const guard of guards) {
    const d = distanceBetween(guard.x, guard.y, coin.x, coin.y);
    if (d < COIN_NOISE_RADIUS && d < bestDist) {
      best = guard;
      bestDist = d;
    }
  }
  if (best) {
    best.investigate = { x: coin.x, y: coin.y };
    best.investigateLeft = 3.2;
    best.alerted = true;
  }
  return best !== null;
}

// Can this guard see the thief right now? Returns a 0..1 strength:
// closer and more centred in the cone reads stronger. The caller
// supplies the sight blockers, adding low crates only while the
// thief crouches, and handles smoke before calling this.
export function guardSeesThief(guard, player, blockers) {
  const dist = distanceBetween(guard.x, guard.y, player.x, player.y);
  if (dist > GUARD_RANGE) return 0;
  const toPlayer = Math.atan2(player.y - guard.y, player.x - guard.x);
  if (Math.abs(angleDifference(toPlayer, guard.facing)) > GUARD_HALF_ANGLE) return 0;
  if (!hasLineOfSight(guard.x, guard.y, player.x, player.y, blockers)) return 0;
  const closeness = 1 - dist / GUARD_RANGE;
  const centre = 1 - Math.abs(angleDifference(toPlayer, guard.facing)) / GUARD_HALF_ANGLE;
  let strength = 0.45 + closeness * 0.35 + centre * 0.2;
  if (player.running) strength += 0.25;
  if (player.crouching) strength -= 0.3;
  return Math.max(0, Math.min(1, strength));
}

export function guardConePoints(guard) {
  return { x: guard.x, y: guard.y, angle: guard.facing, range: GUARD_RANGE, half: GUARD_HALF_ANGLE };
}
