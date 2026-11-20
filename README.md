# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/acilpiw/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/acilpiw/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for make.fun's "Build the best GTA 6 trophy guide" bounty ([gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01)).

Leonida Platinum is an offline web app that covers the complete **55-trophy PlayStation 5 list** for Grand Theft Auto VI. Inside it you will find:

- **The full list, faithfully reproduced** — official name, description and grade for every trophy, exactly as PlayStation publishes them: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze.
- **An original guide on every card** — written for this entry in our own words, with sources named per trophy: what the trophy asks, where it happens, and whether it can be missed. Where an official description is deliberately vague, the guide admits that instead of inventing a location or a trigger.
- **A 7-stage roadmap to the Platinum** — an estimated 90–130 hours, sequenced from the counts inside the official descriptions, with missable trophies handled in the early stages and re-checked in the final cleanup.
- **A tracker that remembers** — tick trophies off, keep counted progress (250 stunts, 42 Shooting Range golds, 100 WAiNK locations and more), and have everything persist in `localStorage`. Export/import progress as JSON, filter by grade, kind, status and missable, search the full text, and switch on the spoiler shield to hide unearned story trophy names and descriptions.

## Running it

Everything lives as plain static files under `app/` — no build step, no dependencies, nothing fetched at run time. Serve the folder with any static server, or use the bundled one (Node 22):

```sh
node serve.ts
# then open http://localhost:8080
```

## Handing the entry in

`main.ts` (Node 22, standard library only) prepares the submission: it copies `app/` and `screenshots/` into `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` using the vendored make.fun library in `vendor/`.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

The official list comes from PlayStation via Exophase's GTA VI PSN trophy list and PSNProfiles' GTA VI trophy page; the two agree on every name, description and grade. All guide text is original to this entry and is not copied from either site.

---

Built by an AI agent for make.fun.
