# Design: Data-driven "Running" post with interactive charts

## Context

`_posts/2026-07-16-running.md` is currently a placeholder (`misc` category, no content). The user has a Garmin export (`/Users/ashutosh/Downloads/Activities-2.csv`, 335 activities, 5/26/21–7/26/26) they want turned into a stats-driven blog post: where they've run, how HR/cadence/pace have evolved, and the story of their first marathon (San Francisco, 7/26/26, 42.53 km, 5:14:05, avg HR 175, avg cadence 152) as the culminating event.

## 1. Data pipeline

- One-off Python script (run locally, not committed) parses the CSV: normalizes dates, converts `Avg Pace`/`Best Pace` (`M:SS` per km) to seconds, strips `--`/`'-28` placeholder values, and derives a `city` field from each `Title` (prefix before `" - "`, or strip trailing `" Running"`; `Activity Type == "Treadmill Running"` → `city: null`).
- A hand-built lookup maps the ~30 distinct city strings (incl. "Malta" → Malta, NY, not the country) to approximate `[lat, lng]`.
- Output: `assets/data/running.json` — one array of per-run records (date, city, lat/lng, distance_km, moving_time_s, avg_hr, max_hr, avg_cadence, avg_pace_s_per_km, elevation_gain_m) covering all 335 runs. Committed to the repo (user confirmed personal data exposure is fine).

## 2. Chart rendering

- Chart.js loaded via CDN `<script>` tag in the post (or in `_layouts/post.html` if reused later — for now, scoped to this post only to avoid loading it site-wide).
- New `assets/js/running-charts.js`: fetches `running.json`, renders each chart into a `<canvas>` embedded in the post body. Colors read from the page's CSS custom properties (`getComputedStyle`) so charts match the current `data-theme` (light/dark) and update on toggle.
- No server-side/build-time chart generation — everything renders client-side at page load.

## 3. Post structure (`_posts/2026-07-16-running.md`)

1. **Hero stat row** — marathon headline numbers (time, distance, avg HR, avg cadence) as styled stat tiles, short intro prose.
2. **US bubble map** — all cities (all US, including Malta NY), bubble radius by total distance in that city. Rendered on a simple US albers-projection SVG/canvas, not an external map-tile service (keeps it dependency-free and matches the site's static-first approach).
3. **The marathon build-up** — weekly mileage ramp + long-run distance progression over the structured training block (RL/RF/RT/RFR/RA-prefixed workouts) preceding race day.
4. **5-year evolution** — monthly mileage bar chart (2021–2026), average pace over time, average HR over time.
5. **Cadence trend** — smaller supporting line chart, average cadence over time.
6. **Closing reflection** — short prose, written by the user (not fabricated), wrap-up/what's-next.

Narrative order is marathon-first: open with the race result, then walk backward through the training block and 5-year arc.

## Files touched/created

- `assets/data/running.json` — new, generated from the CSV
- `assets/js/running-charts.js` — new
- `_posts/2026-07-16-running.md` — full rewrite (front matter mostly unchanged; category stays `misc`)
- Chart.js: CDN script tag, no new Gemfile/npm dependency

## Out of scope

- GPS-track-level detail (splits, route maps) — the CSV has none.
- Historical prose/narrative content about *why* each training phase happened — that's for the user to add/edit; generated prose will be minimal scaffolding around the data.
- Reusing these charts/components on other posts — scoped to this one post for now.
