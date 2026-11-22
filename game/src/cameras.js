// Wall cameras: fixed pivots whose red cones sweep back and forth.
// A camera never moves, so its cone is the one pattern a careful
// thief can learn and time. Cameras see a little farther than guards
// but only while the thief stands in the sweeping cone.
import { CAMERA_RANGE, CAMERA_HALF_ANGLE } from './config.js';
import { angleDifference, distanceBetween, hasLineOfSight } from './geometry.js';

export function createCamera(def) {
  return {
    name: def.name,
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    speed: def.speed,
    // Deterministic sweep phase from the mount position, so two runs
    // of the same room sweep the same way from the same start.
    phase: (def.x * 0.013 + def.y * 0.007) % (Math.PI * 2),
    angle: def.baseAngle,
  };
}

export function updateCamera(camera, timeSeconds) {
  camera.angle = camera.baseAngle + Math.sin(timeSeconds * camera.speed + camera.phase) * camera.sweep;
}

export function cameraSeesThief(camera, player, blockers) {
  const dist = distanceBetween(camera.x, camera.y, player.x, player.y);
  if (dist > CAMERA_RANGE) return 0;
  const toPlayer = Math.atan2(player.y - camera.y, player.x - camera.x);
  if (Math.abs(angleDifference(toPlayer, camera.angle)) > CAMERA_HALF_ANGLE) return 0;
  if (!hasLineOfSight(camera.x, camera.y, player.x, player.y, blockers)) return 0;
  const closeness = 1 - dist / CAMERA_RANGE;
  let strength = 0.5 + closeness * 0.4;
  if (player.crouching) strength -= 0.25;
  return Math.max(0, Math.min(1, strength));
}

export function cameraConePoints(camera) {
  return { x: camera.x, y: camera.y, angle: camera.angle, range: CAMERA_RANGE, half: CAMERA_HALF_ANGLE };
}
