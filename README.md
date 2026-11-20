# Leonida Platinum — GTA VI Trophy Guide and Tracker

An offline guide and tracker for all 55 PlayStation 5 trophies of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze,
28 of them hidden on PlayStation until earned.

## What it does

- **Tracker.** Every trophy with its official name, description and
  grade, a checkbox to mark it earned, and progress (count, points and
  a next-up hint) saved in the browser with localStorage. Progress can
  be exported to a JSON file and imported back, and reset at any time.
- **A cited guide for every trophy.** Each guide is written for this
  entry, in its own words, and names its sources beside the text: the
  official list on Exophase, cross-checked on PSNProfiles, whose
  progress targets supply the counts (42 Shooting Range challenges,
  500 choices, and the rest). No location or step is stated as fact
  unless the official description names it; inferences are labelled.
- **Roadmap.** A 7-stage route to the platinum built from the official
  descriptions: Landfall, Vice City Opens Up, the Chapter 4 Push,
  Endgame and One-Off Moments, Strangers Freaks and Friends, the
  Leonida Checklist, and the Free-Roam Finish — with live per-stage
  progress.
- **Missables.** Seven trophies flagged from their official wording
  (an unscheduled VCIA departure, a showroom smash-out, story choices,
  a second-try trophy, and three deliberately vague descriptions),
  each with the reasoning and the cheap habit that removes the risk.
- **Filters and spoiler shield.** Search, kind filters (story,
  strangers and side, collectibles, activities, world, missable only),
  a grade filter, hide-earned, and a spoiler shield that masks the
  names and descriptions of story trophies until they are earned.
- **Counters.** For every counted trophy (250 stunts, 100 WAiNK
  spots, $250,000 laundered, and more) the detail pane keeps your
  own running total.

The app is plain static files under `app/` with no build step and no
network use at run time: serve `app/` with any static file server and
open `index.html`.

## Run it locally

```sh
node serve.ts            # serves app/ at http://localhost:8080
# or: node serve.ts --port 8091
```

Open the page, tick trophies off as you earn them, and use Export
before switching browsers.

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json`
there with `buildDossier` from `vendor/makefun-frontend.ts`, under
the scorer's caps (text 163,840 bytes; 4 screenshots of at most
262,144 bytes; app/ at most 993 entries and 50,331,648 bytes).

## Layout

- `app/index.html` — page shell: header scoreboard, view tabs,
  filters, tracker, roadmap and missables views.
- `app/style.css` — the sunset-ledger look.
- `app/data/trophies.json` — the 55 trophies with grades, kinds,
  missable flags, counters, roadmap stages, guides and sources.
- `app/js/store.js` — localStorage progress, counters, export/import.
- `app/js/filters.js` — kind, grade and search filtering, spoiler rule.
- `app/js/render.js` — list, detail, roadmap and missables rendering.
- `app/js/main.js` — boot and control wiring.
- `screenshots/` — four JPEG renders of the running app.
- `shots.json` — which view each screenshot shows.

## License

MIT — see `LICENSE`.
