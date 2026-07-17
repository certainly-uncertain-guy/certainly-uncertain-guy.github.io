# Blog Taxonomy & Site Structure Design

Date: 2026-07-16
Status: Draft — pending review

## Context

The site currently has a minimal structure: a homepage (`index.markdown`) and a single flat, paginated blog feed (`blog/index.html`) with no posts yet and no categorization. The owner wants to organize future blog writing into three purpose-driven areas:

- **Learning** — documentation of things being learned: new tech tools (Prometheus, Grafana, logging, etc.), AI, algorithms, project write-ups (which may link out to a project's own page), management/operating-philosophy notes, and personal reflections.
- **Mentoring** — a reference library of routine how-tos (how to write a PPT, a report, code, a code review, a PR, figures, a project report, etc.) that the owner can point new reports to instead of re-explaining things each time.
- **Misc** — everything else, notably "nerdy" personal-data write-ups (e.g. running stats, places visited in the US) that skew toward being living, occasionally-updated pages rather than one-off dated posts.

This document specifies the resulting information architecture and the minimal Jekyll mechanics needed to support it, scoped to what the owner described — no speculative extra features.

## Goals

- Three clearly separated sections (Learning, Mentoring, Misc) reachable from the blog.
- Learning: freeform, evolving subtopics (not a fixed list decided today).
- Mentoring: browsable as a reference/table-of-contents, not a reverse-chronological feed.
- Misc: supports both dated posts and a small number of hand-maintained "living" pages, without forcing the living-page mechanism to be fully built now.
- Stay within what GitHub Pages' vanilla Jekyll build supports (no custom plugins beyond the existing whitelist-safe set).

## Non-goals

- Building the actual running-stats or places-visited pages (explicitly not urgent — this spec only reserves a slot for them).
- A fixed, closed list of Learning subtopics — tags are freeform by design and will grow organically.
- Full-text search, RSS-per-category, or comment systems — not requested.
- Changing the top-level header nav (Home/Blog) — confirmed to stay as-is.

## Deployment constraint (verified)

The `Gemfile` uses the plain `github-pages` gem with no custom GitHub Actions workflow (`.github/workflows/` doesn't exist), meaning the site builds through GitHub Pages' own restricted Jekyll pipeline — only its plugin whitelist is available (currently: `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-paginate`). This rules out plugins like `jekyll-archives` for auto-generated tag pages. Tag filtering must therefore be done with Liquid (`site.tags`, `site.categories`) plus optional vanilla JS, not a new plugin.

## Architecture

### Navigation (unchanged)

Header nav stays `Home | Blog`. No new top-level nav items.

### Blog hub (`/blog/`)

`blog/index.html` changes from a paginated post feed to a static hub page with three cards — Learning, Mentoring, Misc — each showing a short description and linking to its section landing page (`/learning/`, `/mentoring/`, `/misc/`). It no longer uses `paginator.posts`.

### Content model — single `_posts` collection, two front-matter fields

All posts continue to live in one flat `_posts/` directory using the existing Jekyll filename convention (`YYYY-MM-DD-title.md`). Two front-matter fields carry the taxonomy:

- `categories: [learning]` — exactly one value, chosen from the fixed vocabulary `{learning, mentoring, misc}`. This is the section a post belongs to.
- `tags: [grafana, observability]` — zero or more freeform values. These are the subtopic labels within a section (e.g. `ai`, `algorithms`, `projects`, `management`, `reflections` under Learning; theme labels like `communication`, `engineering`, `process` under Mentoring).

Rationale for one collection instead of three (`_learning`, `_mentoring`, `_misc`): keeping everything in `_posts` means `jekyll-feed`, `jekyll-sitemap`, and the existing `paginate` config keep working without modification, and a single Liquid `categories contains "X"` filter is enough to build each section page. Splitting into collections would require re-wiring pagination and feeds for no material benefit at this scale.

### Permalinks

`_config.yml`'s current single `defaults` scope for `type: "posts"` (which hardcodes `permalink: /blog/:year/:month/:day/:title/`) is replaced with a single permalink template driven by Jekyll's built-in `:categories` placeholder:

```
permalink: /:categories/:year/:month/:day/:title/
```

Since every post's `categories` front matter is constrained to exactly one of `learning`/`mentoring`/`misc` (see Authoring rule below), this alone produces `/learning/2026/07/16/title/`, `/mentoring/...`, `/misc/...` without needing three separate `defaults` scopes. The implementation plan should verify this against the site's actual Jekyll version and adjust to per-category `defaults` scopes only if the shared placeholder proves insufficient.

### Learning page (`/learning/`)

- Reverse-chronological list of posts where `categories contains "learning"`, reusing the existing post-card markup/CSS from the current `blog/index.html`.
- A row of tag pills above the list, generated from the set of tags actually used on Learning posts (derived from `site.tags`, filtered to posts in this category).
- Clicking a tag pill filters the visible list client-side via vanilla JS (toggle visibility by a `data-tags` attribute on each post card) — no page reload, no new plugin, no static per-tag page generation.
- A "projects" post is an ordinary Learning post that may contain a markdown link out to the project's own page/repo — no special handling required.
- No pagination initially; full filtered list renders on one page (revisit only if the list grows unwieldy).

### Mentoring page (`/mentoring/`)

- Same underlying data model as Learning (`categories contains "mentoring"` + freeform `tags`), but a different rendering: grouped by tag/theme rather than reverse-chronological, so the page reads as a scannable table of contents (e.g. "Communication", "Engineering", "Process" as tag-derived groups, each listing its guides alphabetically or by tag order).
- No dates shown prominently in the list (dates remain in front matter/on the post page itself, just de-emphasized here).
- No pagination; this section is meant to stay small and scannable.

### Misc page (`/misc/`)

Two content types on one landing page:

1. **Dated posts** — `categories: [misc]`, rendered as the same reverse-chronological post-card list used elsewhere.
2. **Living pages** — a small, manually maintained set of standalone Jekyll pages (using the existing `page` layout, `type: "pages"` default — not `_posts`), e.g. `/misc/running/`, `/misc/places/`. These are edited in place as new data arrives (charts/stats updated on the same URL) rather than published as new dated entries. Shown as a short list of cards above the dated-post list on `/misc/`.
3. Per the owner's explicit note, **no living pages are built as part of this work** — this design only reserves the slot (a card area on `/misc/`) so they can be added later without restructuring the page.

## Data flow / build-time behavior

1. Author writes a post in `_posts/` with `categories: [learning|mentoring|misc]` and optional `tags: [...]`.
2. Jekyll's build assigns the post a permalink under its category prefix and adds it to `site.posts`, `site.categories`, and `site.tags` automatically (no plugin needed — these are built-in Jekyll data structures).
3. `/learning/` and `/misc/` iterate `site.posts` filtered by category, newest first.
4. `/mentoring/` iterates `site.posts` filtered by category, grouped by tag.
5. `/blog/` no longer iterates posts at all — it's three static cards.
6. `jekyll-feed` and `jekyll-sitemap` continue to operate over all posts unchanged (they aren't category-aware and don't need to be — full-site RSS/sitemap is still desired).

## Error handling / edge cases

- **Post missing `categories`:** Won't appear on any of the three section pages (only reachable via direct URL, sitemap, or RSS). This is a content-authoring mistake, not something worth build-time validation for at this scale — documented as the one authoring rule below.
- **Post with `categories` set to something other than the three known values:** Same failure mode as above — silently orphaned from section pages. No automated enforcement; low risk given the owner is the sole author.
- **Post with no `tags`:** Still appears in its section's chronological list; simply won't be surfaced under any tag pill (Learning) or theme group (Mentoring). Acceptable — tags are supplementary, not required for a post to be visible.
- **Tag filter JS on `/learning/`:** Must degrade gracefully — if JS fails to load, the full unfiltered list should still be visible (tag pills become inert rather than breaking the page).

## Authoring rule (documentation, not code)

Every post must set exactly one `categories` value from `{learning, mentoring, misc}`. This should be noted in `CLAUDE.md` or a short `_posts/README` once implemented, so future-you (or Claude Code) doesn't forget it when drafting new posts.

## Testing / verification plan

This is a static content site with no test suite; verification is manual:

1. Add 2–3 seed/dummy posts spanning all three categories and a few overlapping tags.
2. `bundle exec jekyll serve` and visually check:
   - `/blog/` renders three cards, no post listing, links work.
   - `/learning/` lists only `learning` posts, newest first; tag pills appear and filtering works (and degrades sanely with JS disabled).
   - `/mentoring/` lists only `mentoring` posts, grouped by tag, no prominent dates.
   - `/misc/` lists only `misc` posts; the (currently empty) living-pages card area doesn't break the layout.
   - Permalinks match the new per-category pattern (e.g. `/learning/2026/07/16/example/`).
3. Confirm `jekyll-feed` RSS and `jekyll-sitemap` still include all posts regardless of category.
4. Remove seed posts (or mark clearly as drafts) before real content goes in, per implementation plan.

## Open items for implementation plan

- Confirm the `:categories` permalink placeholder behaves as expected against the site's installed Jekyll version; fall back to three per-category `defaults` scopes if not.
- Exact markup/CSS reuse plan for post-cards across three new pages vs. the one that exists today in `blog/index.html`.
- Where the tag-filter JS lives (inline in `_layouts/default.html` vs. a new `assets/js/` file).
