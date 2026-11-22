// Boot: size the canvas, build the game, stage a screenshot scene
// when ?shot= is present, then run the frame loop. Exposes the
// game on window for headless play-testing.
import { VIEW_W, VIEW_H } from './config.js';
import { createAudio } from './audio.js';
import { createGame, updateGame, gameSnapshot } from './game.js';
import { createInput } from './input.js';
import { drawWorld } from './render.js';
import { drawHud, drawTitleScreen, drawCaughtScreen, drawSpottedFlash, drawWinScreen, drawRoomClearScreen } from './hud.js';
import { applyShot, shotNameFromUrl } from './shots.js';
import { pickSeedFromUrl } from './random.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

const seed = pickSeedFromUrl(window.location.search);
const game = createGame(seed);
const input = createInput(canvas);
const audio = createAudio();
window.__heistGame = game;
window.__heistSnapshot = () => gameSnapshot(game);
// Play-test hook: any uncaught error is recorded here instead of
// disappearing into the console.
window.__heistErrors = [];
window.addEventListener('error', (event) => {
  window.__heistErrors.push(String(event.message));
});
window.addEventListener('unhandledrejection', (event) => {
  window.__heistErrors.push(String(event.reason));
});

const shot = shotNameFromUrl(window.location.search);
if (shot) applyShot(game, shot);

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateGame(game, dt, input, audio);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawWorld(ctx, game, game.time);
  drawHud(ctx, game, game.time);
  if (game.phase === 'title') drawTitleScreen(ctx);
  if (game.phase === 'spotted') drawSpottedFlash(ctx);
  if (game.phase === 'caught') drawCaughtScreen(ctx, game);
  if (game.phase === 'roomClear') drawRoomClearScreen(ctx, game);
  if (game.phase === 'won') drawWinScreen(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
