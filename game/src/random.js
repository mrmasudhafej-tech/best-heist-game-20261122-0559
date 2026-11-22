// A tiny seeded random generator so staged screenshots and patrol
// wobble are exactly repeatable for a given seed.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSeedFromUrl(search) {
  const params = new URLSearchParams(search);
  const raw = Number.parseInt(params.get('seed') ?? '7', 10);
  return Number.isFinite(raw) ? raw : 7;
}

export function rangeWith(rng, min, max) {
  return min + rng() * (max - min);
}

export function shuffleWith(rng, list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
