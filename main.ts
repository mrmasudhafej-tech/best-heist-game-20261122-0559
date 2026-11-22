// The Gilded Ledger — Amber Vault Heist: hand-in program.
//
// Node 22, standard library only. It takes the playable game in
// this repository's game/ folder and the maker's screenshots in
// screenshots/, copies both into the output directory, and writes
// dossier.json there with the vendored make.fun library, so the
// sealed scorer can check the entry and the judge can read it.
//
// Locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output unless the
// MAKEFUN_OUTPUT_DIR environment variable says otherwise.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
if (!existsSync(join(repoRoot, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing beside main.ts; nothing to hand in');
}

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');
const gameTarget = join(outputDir, 'game');
const shotsTarget = join(outputDir, 'screenshots');

mkdirSync(outputDir, { recursive: true });
rmSync(gameTarget, { recursive: true, force: true });
rmSync(shotsTarget, { recursive: true, force: true });
cpSync(gameSource, gameTarget, { recursive: true });
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
