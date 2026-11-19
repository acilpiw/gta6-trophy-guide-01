// Leonida Platinum — entry program for make.fun gta6-trophy-guide-01 (Node 22, standard library only).
// The guide itself lives in app/ as plain static files: index.html, its ES modules and stylesheet, and
// app/data/trophies.json holding all 55 official trophies with an original, source-cited guide for each.
// This program hands that guide in. It copies app/ and screenshots/ from beside this file into the output
// directory and writes dossier.json there with buildDossier from vendor/makefun-frontend.ts, which must
// stay byte-for-byte the kit's copy because the scorer rebuilds the dossier with its own copy and compares.
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and the output directory is /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the whole guide exactly as the browser will serve it: no build step, no transformation.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// Screenshots are the judge's window into the guide, so they travel with it (3 or 4, first by name is cover).
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate so a local run refuses what the scorer would refuse anyway.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
