// Geometry helpers: rectangles, circles, segments and line of sight.
// Everything the guards, cameras and the player collide with or hide
// behind is an axis-aligned rectangle in world coordinates.
export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleHitsRect(cx, cy, radius, rect) {
  const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < radius * radius;
}

function segmentsCross(p1, p2, p3, p4) {
  const d = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = d(p3, p4, p1);
  const d2 = d(p3, p4, p2);
  const d3 = d(p1, p2, p3);
  const d4 = d(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

export function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (x1 >= rect.x && x1 <= rect.x + rect.w && y1 >= rect.y && y1 <= rect.y + rect.h) return true;
  if (x2 >= rect.x && x2 <= rect.x + rect.w && y2 >= rect.y && y2 <= rect.y + rect.h) return true;
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h },
  ];
  for (let i = 0; i < 4; i += 1) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    if (segmentsCross({ x: x1, y: y1 }, { x: x2, y: y2 }, a, b)) return true;
  }
  return false;
}

// True when no sight-blocking rectangle stands between the two points.
export function hasLineOfSight(x1, y1, x2, y2, blockers) {
  for (const rect of blockers) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

export function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

// Cast one ray from (ox, oy) along `angle`; stop at the first blocker
// or at maxDistance. Used to draw vision cones that hug the furniture.
export function castVisionRay(ox, oy, angle, maxDistance, blockers) {
  let low = 0;
  let high = maxDistance;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  for (let step = 0; step < 22; step += 1) {
    const mid = (low + high) / 2;
    if (hasLineOfSight(ox, oy, ox + dx * mid, oy + dy * mid, blockers)) low = mid;
    else high = mid;
  }
  return low;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distanceBetween(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}
