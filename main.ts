// Leonida Platinum — hand-in program for the gta6-trophy-guide-01 entry.
// Node 22, standard library only. Copies the static guide (app/) and its
// screenshots (screenshots/) into the output directory and writes
// dossier.json there with the vendored make.fun builder, so the dossier
// the scorer rebuilds matches this one byte for byte.
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Local serve:  node serve.ts  (then open the printed localhost address)

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

const shotsSource = join(repoRoot, "screenshots");
const shotsTarget = join(outputDir, "screenshots");
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// Caps are the scorer's own (see RULES.txt, gate limits): the dossier text
// is capped at 160 KiB, screenshots at 4 files of 256 KiB each, and app/
// at 993 entries and 48 MiB.
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossierBytes);

// Post-build sanity check: re-read the dossier from disk and re-parse it.
// A hand-in that cannot be read back is worse than a loud failure here,
// because the scorer would refuse it later and silently score nothing.
const reparsed = JSON.parse(readFileSync(join(outputDir, "dossier.json"), "utf8")) as {
  schema?: string;
  text?: string;
  images?: unknown[];
};
if (reparsed.schema !== "makefun/dossier/v1") {
  throw new Error(`dossier sanity check failed: unexpected schema ${String(reparsed.schema)}`);
}
if (typeof reparsed.text !== "string" || reparsed.text.length === 0) {
  throw new Error("dossier sanity check failed: dossier text is missing");
}
if (!Array.isArray(reparsed.images) || reparsed.images.length < 3) {
  throw new Error("dossier sanity check failed: expected at least 3 screenshots in the dossier");
}
console.log(
  `Leonida Platinum handed in: dossier.json (${dossierBytes.length} bytes, ${reparsed.images.length} screenshots, sanity check passed) in ${outputDir}`,
);
