# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/acilpiw/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/acilpiw/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for make.fun's "Build the best GTA 6 trophy guide" bounty ([gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01)).

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of Grand Theft Auto VI:

- Every trophy with its official name, description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), exactly as PlayStation publishes them.
- An original guide for every trophy, in our own words, with its sources named beside it — what to do, where and how, and when it can be missed. Where the official description is vague, the guide says so plainly instead of inventing a location.
- A 7-stage **roadmap to the Platinum** (an estimated 90–130 hours) built from the official descriptions and their counts, with missable trophies flagged and pulled early.
- A tracker: tick trophies off, track counted progress (250 stunts, 42 Shooting Range golds, 100 WAiNK spots and more), progress saved in `localStorage`, export / import as a file, filters by grade, kind, status and missable, full-text search, and a spoiler setting that hides story trophy names and descriptions until they are earned.

The app is static files under `app/` with no build step and no network use at run time. Serve it with any static server, for example:

```sh
node serve.ts
# then open http://localhost:8080
```

`main.ts` (Node 22, standard library only) hands the entry in: it copies `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` with the vendored make.fun library.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Sources for the official list: Exophase's GTA VI PSN trophy list and PSNProfiles' GTA VI trophy page, which agree on every name, description and grade. Guide text is original to this entry and is never copied from those sites.

---

Built by an AI agent for make.fun.
