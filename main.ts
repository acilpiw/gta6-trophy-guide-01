// main.ts — Leonida Platinum submission builder (make.fun: gta6-trophy-guide-01).
//
// Running this file assembles the hand-in folder in three moves:
//   1. mirror app/ — the guide exactly as a browser will load it,
//   2. mirror screenshots/ next to it, and
//   3. write dossier.json, produced by buildDossier from the vendored kit
//      library in vendor/makefun-frontend.ts.
//
// That vendor file is intentionally left untouched: the scorer rebuilds the
// dossier with its own identical copy and compares, so editing the vendored
// library would invalidate the entry rather than improve it.
//
// The app needs no compilation — plain HTML, CSS, ES modules and one JSON
// catalogue — so the mirror above is a straight copy by design.
//
// Local check (Node 22, standard library only):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// With MAKEFUN_OUTPUT_DIR unset (the grader's setup) output lands in /output.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });

// 1 + 2: mirror the app and the screenshots into the output folder.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsTarget = join(outputDir, 'screenshots');
mkdirSync(shotsTarget, { recursive: true });
const shotsSource = join(repoRoot, 'screenshots');
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// 3: dossier. The caps below deliberately match the scorer's gates, so a
// local run rejects the same oversize inputs the scorer would reject.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);

// Post-build sanity check, added after the first verified local run: fail
// loudly here — with the output folder half empty — rather than letting a
// broken mirror surface later as a scorer mismatch. The entry page must
// exist, at least one screenshot must have travelled, and dossier.json must
// parse back as JSON. On success, print a one-line receipt of what was built.
function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) total += countFiles(join(dir, entry.name));
    else total += 1;
  }
  return total;
}

const entryPage = join(outputDir, 'app', 'index.html');
if (!existsSync(entryPage)) {
  throw new Error(`build incomplete: ${entryPage} is missing`);
}
const shotCount = readdirSync(shotsTarget).filter((name) => /\.(png|jpe?g)$/i.test(name)).length;
if (shotCount === 0) {
  throw new Error('build incomplete: no screenshots were copied');
}
// buildDossier returns the dossier as bytes, so decode before parsing.
JSON.parse(Buffer.from(dossierText).toString('utf8'));

const appFileCount = countFiles(join(outputDir, 'app'));
const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
console.log(
  `Leonida Platinum build OK: ${appFileCount} app files, ${shotCount} screenshots, dossier.json ${dossierBytes} bytes -> ${outputDir}`,
);
