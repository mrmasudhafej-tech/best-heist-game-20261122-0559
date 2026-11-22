// The HUD and the full-screen overlays: the big alarm meter, score,
// timer, loot, tools and strikes — plus title, caught, win and
// level-clear screens. The alarm meter is deliberately the largest
// thing on screen after the room itself.
import { ALARM_WARN_AT, HUD_H, MAX_STRIKES, VIEW_W } from './config.js';

function bar(ctx, x, y, w, h, fraction, fill, back) {
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, fraction)), h);
  ctx.strokeStyle = '#0d0a07';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

export function drawHud(ctx, state, time) {
  ctx.fillStyle = '#14100c';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = '#f2c14e';
  ctx.font = 'bold 17px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE GILDED LEDGER', 18, 26);
  ctx.fillStyle = '#c9b896';
  ctx.font = '13px Verdana, sans-serif';
  ctx.fillText(state.level.name, 18, 48);
  ctx.fillText(state.level.hint, 18, 65);

  // The alarm meter: wide, tall, centre stage.
  const alarm = state.alarm;
  const warning = alarm >= ALARM_WARN_AT;
  const flash = warning && Math.sin(time * 10) > 0;
  ctx.font = 'bold 15px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = flash ? '#ff5a5a' : '#ffd97a';
  ctx.fillText(flash ? '⚠ ALARM!' : 'ALARM', 400, 26);
  const fill = alarm > 75 ? '#ff4040' : alarm > 40 ? '#ff9d2e' : '#f2c14e';
  bar(ctx, 400, 32, 340, 22, alarm / 100, fill, '#3a2c1c');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(alarm)}%`, 570, 49);

  // Strikes: three masks; a spent one turns dark.
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px Verdana, sans-serif';
  ctx.fillStyle = '#c9b896';
  ctx.fillText('STRIKES', 770, 24);
  for (let i = 0; i < MAX_STRIKES; i += 1) {
    ctx.font = '20px Verdana, sans-serif';
    ctx.fillStyle = i < state.strikes ? '#ff4040' : '#f2c14e';
    ctx.fillText(i < state.strikes ? '✖' : '◉', 770 + i * 26, 50);
  }

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px Verdana, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SCORE ${state.score}`, VIEW_W - 18, 26);
  ctx.font = '13px Verdana, sans-serif';
  ctx.fillStyle = '#c9b896';
  ctx.fillText(`LOOT ${state.lootTaken}/${state.lootTotal}   TIME ${formatTime(state.elapsed)}`, VIEW_W - 18, 47);
  ctx.fillText(`COINS ${state.player.coins} (click)   SMOKE ${state.player.smoke} (Q)   [M] sound`, VIEW_W - 18, 65);

  // Context prompt above the bottom hint line.
  if (state.prompt) {
    ctx.font = 'bold 16px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1c140c';
    const w = ctx.measureText(state.prompt).width + 28;
    ctx.fillStyle = 'rgba(255,217,122,0.95)';
    ctx.fillRect(VIEW_W / 2 - w / 2, HUD_H + 6, w, 28);
    ctx.fillStyle = '#1c140c';
    ctx.fillText(state.prompt, VIEW_W / 2, HUD_H + 26);
  }

  // Lockpick progress ring over the pedestal.
  if (state.player.lockpicking > 0) {
    const p = state.player;
    ctx.strokeStyle = '#ffd97a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 30, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * state.lockProgress);
    ctx.stroke();
    ctx.font = 'bold 13px Verdana, sans-serif';
    ctx.fillStyle = '#ffd97a';
    ctx.textAlign = 'center';
    ctx.fillText('PICKING LOCK…', p.x, p.y - 56);
  }

  ctx.fillStyle = 'rgba(20,16,12,0.85)';
  ctx.fillRect(0, 694, VIEW_W, 26);
  ctx.fillStyle = '#c9b896';
  ctx.font = '13px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WASD / arrows move · SHIFT run (loud) · C crouch & hide · CLICK throw a coin · E grab / pick locks · Q smoke · R restart', VIEW_W / 2, 711);
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10,8,6,0.72)';
  ctx.fillRect(0, 0, VIEW_W, 720);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, 250);
  ctx.fillStyle = '#f5edd8';
  ctx.font = '18px Verdana, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, 300 + i * 32);
  });
}

export function drawTitleScreen(ctx) {
  overlay(ctx, 'THE GILDED LEDGER', [
    'An Amber Vault Heist — starring Sable, retired locksmith.',
    'Steal the Amber Ledger from three guarded rooms and reach the getaway van.',
    'Read the cones. Crouch behind crates. Spend your coins and smoke wisely.',
    '',
    'Press ENTER or CLICK to begin',
  ], '#f2c14e');
}

export function drawCaughtScreen(ctx, state) {
  overlay(ctx, 'CAUGHT!', [
    `The guards caught Sable — strike ${state.strikes} of ${MAX_STRIKES}.`,
    state.strikes >= MAX_STRIKES ? 'The job is blown. Press R to try the whole heist again.' : 'Press ENTER to slip back to the start of this room.',
  ], '#ff5a5a');
}

export function drawSpottedFlash(ctx) {
  ctx.fillStyle = 'rgba(255,64,64,0.28)';
  ctx.fillRect(0, 0, VIEW_W, 720);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPOTTED!', VIEW_W / 2, 200);
}

export function drawWinScreen(ctx, state) {
  overlay(ctx, 'CLEAN GETAWAY!', [
    `Sable escapes with the Amber Ledger. Final score: ${state.score}.`,
    `Loot taken: ${state.lootTaken} of ${state.lootTotal} · Time: ${formatTime(state.elapsed)} · Strikes: ${state.strikes}.`,
    '',
    'Press R to run the heist again.',
  ], '#7dff9a');
}

export function drawRoomClearScreen(ctx, state) {
  overlay(ctx, 'ROOM CLEARED!', [
    `The Ledger for this room is yours. Score: ${state.score}.`,
    'Press ENTER for the next room.',
  ], '#f2c14e');
}
