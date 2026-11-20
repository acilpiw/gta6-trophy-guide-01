// main.ts — submission entry point for the make.fun bounty gta6-trophy-guide-01.
//
// What this program does, and all it does:
//   1. copies the finished guide (everything under app/) into the output folder,
//   2. copies the screenshots folder alongside it, and
//   3. writes dossier.json into that folder using buildDossier from
//      vendor/makefun-frontend.ts.
//
// The vendored file is the kit's own copy and stays untouched on purpose: the
// scorer regenerates the dossier with its own copy of the same library and
// compares the two, so editing the vendor file would break the entry.
//
// The guide needs no build step — app/ is plain HTML, CSS, ES modules and one
// JSON data file — so the copy above is verbatim by design.
//
// Local run (Node 22, standard library only):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Under the grader MAKEFUN_OUTPUT_DIR is unset and output goes to /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });

// The app itself, exactly as a browser will receive it.
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });

// Screenshots travel with the entry; the scorer shows up to four of them and
// treats the first file by name as the cover image.
const shotsDir = join(outDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), shotsDir, { recursive: true });
}

// Limits mirror the scorer's gates, so a local run fails on the same inputs
// the scorer would reject instead of failing later and elsewhere.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
