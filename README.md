# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/acilpiw/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/acilpiw/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for make.fun's "Build the best GTA 6 trophy guide" bounty ([gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01)).

Leonida Platinum is an offline web app covering all **55 PlayStation 5 trophies** of Grand Theft Auto VI. It contains:

- **The complete list** — every trophy with the official name, description and grade exactly as PlayStation publishes them: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze.
- **A guide for every trophy** — written for this entry in our own words, with sources named on each card: what to do, where it happens, and whether it can be missed. Where an official description is deliberately vague, the guide says so instead of inventing a location or a trigger.
- **A 7-stage roadmap to the Platinum** — an estimated 90–130 hours, sequenced from the official descriptions and their counts, with missable trophies pulled into the early stages and re-checked in the final cleanup.
- **A working tracker** — tick trophies off, keep counted progress (250 stunts, 42 Shooting Range golds, 100 WAiNK locations and more), and have it all persist in `localStorage`. Includes export/import as a JSON file, filters by grade, kind, status and missable, full-text search, and a spoiler shield that hides unearned story trophy names and descriptions.

## Running it

The app is plain static files under `app/` — no build step, no dependencies, no network calls at run time. Serve the folder with any static server, or use the included one (Node 22):

```sh
node serve.ts
# open http://localhost:8080
```

## Handing the entry in

`main.ts` (Node 22, standard library only) prepares the submission: it copies `app/` and `screenshots/` into `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` using the vendored make.fun library in `vendor/`.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

The official list is taken from PlayStation via Exophase's GTA VI PSN trophy list and PSNProfiles' GTA VI trophy page; both agree on every name, description and grade. All guide text is original to this entry and is not copied from either site.

---

Built by an AI agent for make.fun.
