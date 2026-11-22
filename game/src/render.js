// All drawing: the room, the sweeping vision cones, the people,
// the loot, and the HUD with its large alarm meter. Nothing here
// changes game state — it only paints the state game.js owns.
import { HUD_H, PALETTE, VIEW_W, VIEW_H, ALARM_WARN_AT } from './config.js';
import { castVisionRay } from './geometry.js';

export function drawCone(ctx, ox, oy, angle, range, half, blockers, fill, edge) {
  const steps = 26;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  for (let i = 0; i <= steps; i += 1) {
    const a = angle - half + (2 * half * i) / steps;
    const dist = castVisionRay(ox, oy, a, range, blockers);
    ctx.lineTo(ox + Math.cos(a) * dist, oy + Math.sin(a) * dist);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx, time) {
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  ctx.fillStyle = PALETTE.floorDark;
  for (let y = HUD_H + 8; y < VIEW_H; y += 56) {
    for (let x = 16; x < VIEW_W - 16; x += 56) {
      const odd = ((x / 56) | 0) + ((y / 56) | 0);
      if (odd % 2 === 0) ctx.fillRect(x, y, 56, 56);
    }
  }
  // The grand carpet down the middle of the hall.
  ctx.fillStyle = '#5d2e2e';
  ctx.fillRect(520, HUD_H + 24, 240, VIEW_H - HUD_H - 48);
  ctx.strokeStyle = '#c9a24a';
  ctx.lineWidth = 3;
  ctx.strokeRect(520, HUD_H + 24, 240, VIEW_H - HUD_H - 48);
  ctx.strokeStyle = 'rgba(201,162,74,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(536, HUD_H + 40, 208, VIEW_H - HUD_H - 80);
  void time;
}

function drawRectWithTop(ctx, rect, fill, top) {
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = top;
  ctx.fillRect(rect.x, rect.y, rect.w, 7);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function drawLabel(ctx, text, x, y, size, color) {
  ctx.font = `bold ${size}px Verdana, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function drawWorld(ctx, state, time) {
  const level = state.level;
  drawFloor(ctx, time);
  const blockers = state.sightBlockers;

  // Faint dotted patrol routes, so the thief can read each guard's
  // beat before stepping out of cover.
  ctx.save();
  ctx.strokeStyle = 'rgba(255,220,120,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 8]);
  for (const guard of state.guards) {
    ctx.beginPath();
    guard.path.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point[0], point[1]);
      else ctx.lineTo(point[0], point[1]);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Camera cones first (under the furniture), then guard cones.
  for (const camera of state.cameras) {
    drawCone(ctx, camera.x, camera.y, camera.angle, 265, 0.38, blockers,
      'rgba(255,70,70,0.13)', 'rgba(255,90,90,0.45)');
  }
  for (const guard of state.guards) {
    const fill = guard.alerted ? 'rgba(255,190,60,0.22)' : 'rgba(255,220,120,0.17)';
    drawCone(ctx, guard.x, guard.y, guard.facing, 235, 0.46, blockers,
      fill, 'rgba(255,220,120,0.5)');
  }

  for (const rect of level.walls) drawRectWithTop(ctx, rect, PALETTE.wall, PALETTE.wallTop);
  for (const shelf of level.shelves) {
    drawRectWithTop(ctx, shelf, PALETTE.shelf, '#7a5a34');
    ctx.fillStyle = 'rgba(242,193,78,0.55)';
    for (let i = 0; i < 3; i += 1) {
      ctx.fillRect(shelf.x + 6 + i * 12, shelf.y + shelf.h / 2 - 6, 7, 12);
    }
  }
  for (const crate of level.crates) {
    drawRectWithTop(ctx, crate, PALETTE.crate, '#9a783f');
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(crate.x, crate.y + crate.h / 2);
    ctx.lineTo(crate.x + crate.w, crate.y + crate.h / 2);
    ctx.stroke();
    drawLabel(ctx, 'HIDE', crate.x + crate.w / 2, crate.y + crate.h + 16, 10, '#d8c9a8');
  }
  for (const c of level.cases) {
    ctx.fillStyle = 'rgba(159,216,232,0.28)';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = PALETTE.caseGlass;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    drawLabel(ctx, c.label, c.x + c.w / 2, c.y + c.h / 2 + 4, 11, '#eaf7fb');
  }

  // The pedestal and its glowing prize.
  const ped = level.pedestal;
  const glow = 0.55 + 0.3 * Math.sin(time * 3);
  if (!state.ledgerTaken) {
    const grad = ctx.createRadialGradient(ped.x + ped.w / 2, ped.y + ped.h / 2, 8, ped.x + ped.w / 2, ped.y + ped.h / 2, 110);
    grad.addColorStop(0, `rgba(255,157,46,${glow})`);
    grad.addColorStop(1, 'rgba(255,157,46,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ped.x + ped.w / 2, ped.y + ped.h / 2, 110, 0, Math.PI * 2);
    ctx.fill();
  }
  drawRectWithTop(ctx, ped, '#3d3a4a', '#6a6580');
  if (!state.ledgerTaken) {
    const cx = ped.x + ped.w / 2;
    const cy = ped.y + ped.h / 2 - 8 + Math.sin(time * 2.4) * 3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.12);
    ctx.fillStyle = PALETTE.amber;
    ctx.fillRect(-17, -12, 34, 24);
    ctx.fillStyle = '#ffe9b0';
    ctx.fillRect(-13, -8, 26, 16);
    ctx.fillStyle = '#8a5a10';
    ctx.fillRect(-9, -4, 18, 2);
    ctx.fillRect(-9, 1, 12, 2);
    ctx.restore();
    drawLabel(ctx, '★ THE AMBER LEDGER ★', cx, ped.y - 12, 14, '#ffd97a');
  } else {
    drawLabel(ctx, 'EMPTY PEDESTAL', ped.x + ped.w / 2, ped.y - 10, 11, '#9a8f7a');
  }

  // Side loot still on the floor, as small gold purses.
  for (const loot of level.loot) {
    if (loot.taken) continue;
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(loot.x, loot.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5a10';
    ctx.font = 'bold 12px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', loot.x, loot.y + 4);
  }

  // The exit door: locked red until the Ledger is taken, then green.
  const exit = level.exit;
  const open = state.ledgerTaken;
  ctx.fillStyle = open ? '#1f6b3a' : '#5a2323';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = open ? '#7dff9a' : '#c96a6a';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
  if (open) {
    const pulse = 0.5 + 0.4 * Math.sin(time * 4);
    ctx.strokeStyle = `rgba(125,255,154,${pulse})`;
    ctx.lineWidth = 5;
    ctx.strokeRect(exit.x - 5, exit.y - 5, exit.w + 10, exit.h + 10);
  }
  drawLabel(ctx, open ? '➤ GETAWAY!' : 'LOCKED', exit.x + exit.w / 2, exit.y + exit.h / 2 - 4, 13, '#ffffff');
  drawLabel(ctx, exit.label, exit.x + exit.w / 2, exit.y + exit.h / 2 + 14, 10, '#e8e0d0');

  // Smoke clouds hide the thief inside them.
  for (const cloud of state.smokeClouds) {
    ctx.fillStyle = 'rgba(207,214,212,0.55)';
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(cloud.x - 22, cloud.y - 14, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thrown coins in flight, then resting with a ring.
  for (const coin of state.coinsFlying) {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(242,193,78,0.7)';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const coin of state.coinsLanded) {
    ctx.strokeStyle = 'rgba(242,193,78,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 18 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cameras on their wall mounts.
  for (const camera of state.cameras) {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(camera.x - 12, camera.y - 9, 24, 18);
    ctx.fillStyle = PALETTE.camera;
    ctx.fillRect(camera.x - 8, camera.y - 6, 16, 12);
    ctx.fillStyle = '#ff4040';
    ctx.beginPath();
    ctx.arc(camera.x + Math.cos(camera.angle) * 10, camera.y + Math.sin(camera.angle) * 10, 4, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, camera.name, camera.x, camera.y - 16, 10, '#ffb0b0');
  }

  // Guards: red coats, caps, facing tick, name and a "!" when alerted.
  for (const guard of state.guards) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(guard.x, guard.y + 13, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.guardDark;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y - 5, 11, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#ffe9b0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.facing) * 20, guard.y + Math.sin(guard.facing) * 20);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.facing) * 6 - 3, guard.y + Math.sin(guard.facing) * 6 - 3, 2.4, 0, Math.PI * 2);
    ctx.arc(guard.x + Math.cos(guard.facing) * 6 + 3, guard.y + Math.sin(guard.facing) * 6 + 3, 2.4, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, guard.name.toUpperCase(), guard.x, guard.y - 24, 10, '#ffb9b9');
    if (guard.alerted && guard.investigate) drawLabel(ctx, '?', guard.x, guard.y - 38, 18, '#ffd97a');
  }

  // Sable the thief: teal coat, wide hat, facing tick, crouch pose.
  const p = state.player;
  const radius = p.crouching ? 12 : 15;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + radius - 1, radius, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thiefDark;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 6, radius + 2, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eafaf7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.facing) * (radius + 6), p.y + Math.sin(p.facing) * (radius + 6));
  ctx.stroke();
  if (p.hasLedger) {
    ctx.fillStyle = PALETTE.amber;
    ctx.fillRect(p.x - 6, p.y - radius - 12, 12, 9);
  }
  drawLabel(ctx, 'SABLE', p.x, p.y - radius - (p.hasLedger ? 16 : 6), 10, '#bdf0ea');
  if (p.crouching) drawLabel(ctx, 'HIDDEN', p.x, p.y + radius + 16, 10, '#9fd8c8');
}
