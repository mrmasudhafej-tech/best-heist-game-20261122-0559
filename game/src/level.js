// The three rooms of the Amber Vault job. Each room is one floor plan:
// outer walls, tall shelves that block sight, low crates to crouch
// behind, glass display cases, loot spots, one pedestal holding the
// room's prize, patrol routes, cameras and a getaway exit.
// Coordinates live in the world area below the HUD (y from 92 to 700).
import { HUD_H } from './config.js';

function wall(x, y, w, h) {
  return { x, y, w, h, kind: 'wall' };
}

function roomBounds() {
  return [
    wall(16, HUD_H + 8, 1248, 16),
    wall(16, 684, 1248, 16),
    wall(16, HUD_H + 8, 16, 592),
    wall(1248, HUD_H + 8, 16, 592),
  ];
}

// Room 1: the Vault Hall. Wide lanes between long shelves, a central
// pedestal, two routes around either side of the hall.
export function buildVaultHallLevel() {
  return {
    id: 1,
    name: 'ROOM 1 — THE VAULT HALL',
    hint: 'Cross the hall. The Amber Ledger waits on the pedestal.',
    playerStart: { x: 80, y: 620 },
    exit: { x: 1150, y: 560, w: 78, h: 104, label: 'SERVICE DOOR' },
    pedestal: { x: 620, y: 300, w: 56, h: 56 },
    walls: [
      ...roomBounds(),
      wall(300, 200, 220, 26),
      wall(760, 200, 220, 26),
      wall(300, 470, 220, 26),
      wall(760, 470, 220, 26),
    ],
    shelves: [
      { x: 250, y: 280, w: 34, h: 150, kind: 'shelf' },
      { x: 520, y: 150, w: 240, h: 30, kind: 'shelf' },
      { x: 996, y: 280, w: 34, h: 150, kind: 'shelf' },
      { x: 520, y: 540, w: 240, h: 30, kind: 'shelf' },
      { x: 150, y: 380, w: 30, h: 120, kind: 'shelf' },
    ],
    crates: [
      { x: 400, y: 330, w: 52, h: 52, kind: 'crate' },
      { x: 830, y: 330, w: 52, h: 52, kind: 'crate' },
      { x: 640, y: 590, w: 52, h: 52, kind: 'crate' },
      { x: 180, y: 160, w: 52, h: 52, kind: 'crate' },
      { x: 1050, y: 160, w: 52, h: 52, kind: 'crate' },
    ],
    cases: [
      { x: 340, y: 130, w: 90, h: 44, kind: 'case', label: 'COINS' },
      { x: 850, y: 130, w: 90, h: 44, kind: 'case', label: 'GEMS' },
      { x: 340, y: 610, w: 90, h: 44, kind: 'case', label: 'SEALS' },
      { x: 850, y: 610, w: 90, h: 44, kind: 'case', label: 'RELIC' },
    ],
    loot: [
      { x: 385, y: 196, value: 120, name: 'Coin Hoard', taken: false },
      { x: 895, y: 196, value: 150, name: 'Gem Case', taken: false },
      { x: 385, y: 586, value: 120, name: 'Wax Seals', taken: false },
      { x: 895, y: 586, value: 150, name: 'Old Relic', taken: false },
    ],
    guards: [
      { path: [[220, 240], [1060, 240], [1060, 430], [220, 430]], speed: 78, pause: 0.9, name: 'Guard Mara' },
      { path: [[210, 240], [210, 560]], speed: 92, pause: 1.2, name: 'Guard Pell' },
      { path: [[1120, 140], [1120, 600], [900, 600]], speed: 70, pause: 1.0, name: 'Guard Odo' },
    ],
    cameras: [
      { x: 40, y: 240, baseAngle: 0, sweep: 0.8, speed: 0.55, name: 'Cam A' },
      { x: 1240, y: 380, baseAngle: Math.PI, sweep: 0.7, speed: 0.7, name: 'Cam B' },
    ],
  };
}

// Room 2: the Gilded Gallery. A ring of display cases around a carpet,
// patrols crossing at diagonals, cameras watching the two doors.
export function buildGalleryLevel() {
  return {
    id: 2,
    name: 'ROOM 2 — THE GILDED GALLERY',
    hint: 'The Ledger moved to the gallery. Mind the crossing patrols.',
    playerStart: { x: 80, y: 140 },
    exit: { x: 1150, y: 130, w: 78, h: 104, label: 'STAIR DOOR' },
    pedestal: { x: 620, y: 380, w: 56, h: 56 },
    walls: [
      ...roomBounds(),
      wall(420, 240, 26, 220),
      wall(834, 240, 26, 220),
      wall(560, 330, 160, 26),
    ],
    shelves: [
      { x: 180, y: 260, w: 200, h: 30, kind: 'shelf' },
      { x: 900, y: 260, w: 200, h: 30, kind: 'shelf' },
      { x: 180, y: 470, w: 200, h: 30, kind: 'shelf' },
      { x: 900, y: 470, w: 200, h: 30, kind: 'shelf' },
      { x: 600, y: 150, w: 80, h: 30, kind: 'shelf' },
    ],
    crates: [
      { x: 480, y: 180, w: 52, h: 52, kind: 'crate' },
      { x: 750, y: 180, w: 52, h: 52, kind: 'crate' },
      { x: 480, y: 520, w: 52, h: 52, kind: 'crate' },
      { x: 750, y: 520, w: 52, h: 52, kind: 'crate' },
      { x: 1080, y: 400, w: 52, h: 52, kind: 'crate' },
    ],
    cases: [
      { x: 240, y: 130, w: 90, h: 44, kind: 'case', label: 'MASKS' },
      { x: 950, y: 130, w: 90, h: 44, kind: 'case', label: 'CROWNS' },
      { x: 240, y: 610, w: 90, h: 44, kind: 'case', label: 'SCROLLS' },
      { x: 950, y: 610, w: 90, h: 44, kind: 'case', label: 'JEWELS' },
    ],
    loot: [
      { x: 285, y: 196, value: 140, name: 'Gold Masks', taken: false },
      { x: 995, y: 196, value: 160, name: 'Crowns', taken: false },
      { x: 285, y: 586, value: 140, name: 'Scrolls', taken: false },
      { x: 995, y: 586, value: 160, name: 'Jewels', taken: false },
    ],
    guards: [
      { path: [[140, 140], [140, 560]], speed: 100, pause: 0.7, name: 'Guard Fen' },
      { path: [[470, 140], [470, 500]], speed: 84, pause: 1.0, name: 'Guard Rook' },
      { path: [[810, 140], [810, 500]], speed: 84, pause: 1.0, name: 'Guard Wren' },
    ],
    cameras: [
      { x: 40, y: 380, baseAngle: 0, sweep: 0.8, speed: 0.6, name: 'Cam A' },
      { x: 640, y: 690, baseAngle: -Math.PI / 2, sweep: 0.8, speed: 0.5, name: 'Cam B' },
    ],
  };
}

// Room 3: the Amber Vault itself. Tight lanes, fast patrols, the
// Ledger behind a final ring of cases — then the getaway van door.
export function buildAmberVaultLevel() {
  return {
    id: 3,
    name: 'ROOM 3 — THE AMBER VAULT',
    hint: 'Last room. Take the Ledger and reach the getaway van.',
    playerStart: { x: 80, y: 620 },
    exit: { x: 1150, y: 560, w: 78, h: 104, label: 'GETAWAY VAN' },
    pedestal: { x: 640, y: 340, w: 64, h: 64 },
    walls: [
      ...roomBounds(),
      wall(300, 160, 26, 380),
      wall(954, 160, 26, 380),
      wall(470, 240, 340, 26),
      wall(470, 470, 340, 26),
    ],
    shelves: [
      { x: 380, y: 300, w: 30, h: 130, kind: 'shelf' },
      { x: 870, y: 300, w: 30, h: 130, kind: 'shelf' },
      { x: 560, y: 120, w: 160, h: 30, kind: 'shelf' },
      { x: 560, y: 590, w: 160, h: 30, kind: 'shelf' },
    ],
    crates: [
      { x: 350, y: 180, w: 52, h: 52, kind: 'crate' },
      { x: 880, y: 180, w: 52, h: 52, kind: 'crate' },
      { x: 350, y: 520, w: 52, h: 52, kind: 'crate' },
      { x: 880, y: 520, w: 52, h: 52, kind: 'crate' },
      { x: 640, y: 450, w: 52, h: 52, kind: 'crate' },
    ],
    cases: [
      { x: 480, y: 130, w: 90, h: 44, kind: 'case', label: 'AMBER' },
      { x: 710, y: 130, w: 90, h: 44, kind: 'case', label: 'OPALS' },
      { x: 480, y: 610, w: 90, h: 44, kind: 'case', label: 'PEARLS' },
      { x: 710, y: 610, w: 90, h: 44, kind: 'case', label: 'RUBIES' },
    ],
    loot: [
      { x: 525, y: 196, value: 180, name: 'Amber Shards', taken: false },
      { x: 755, y: 196, value: 180, name: 'Opals', taken: false },
      { x: 525, y: 586, value: 180, name: 'Pearls', taken: false },
      { x: 755, y: 586, value: 180, name: 'Rubies', taken: false },
    ],
    guards: [
      { path: [[120, 200], [120, 560]], speed: 112, pause: 0.5, name: 'Guard Vex' },
      { path: [[1010, 200], [1010, 520]], speed: 106, pause: 0.6, name: 'Guard Hal' },
      { path: [[520, 300], [760, 300], [760, 440], [520, 440]], speed: 88, pause: 0.8, name: 'Guard Ivo' },
    ],
    cameras: [
      { x: 640, y: 108, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.75, name: 'Cam A' },
      { x: 40, y: 140, baseAngle: 0.5, sweep: 0.7, speed: 0.65, name: 'Cam B' },
    ],
  };
}

export function buildAllLevels() {
  return [buildVaultHallLevel(), buildGalleryLevel(), buildAmberVaultLevel()];
}

// Every rectangle the player cannot walk through, and the subset
// tall enough to block a guard's line of sight.
export function collisionRects(level) {
  return [...level.walls, ...level.shelves, ...level.crates, ...level.cases, level.pedestal];
}

export function sightBlockers(level) {
  return [...level.walls, ...level.shelves];
}
