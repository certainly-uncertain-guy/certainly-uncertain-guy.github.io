# Blog Hub: Cards → Link Lists, Plus Onboarding/Learning Stub Posts

Date: 2026-07-16
Status: Draft — pending review

## Context

The site's `/blog/` hub page (built per [2026-07-16-blog-taxonomy-design.md](2026-07-16-blog-taxonomy-design.md)) currently shows three clickable cards — Learning, Mentoring, Misc — each with a one-line description, linking out to the section's own landing page. The owner wants `/blog/` itself to act as a scannable table of contents: a header per section with the actual post titles listed as hyperlinks underneath, not just a card that requires an extra click to see what's there.

Separately, the owner (a Senior Applied Scientist L5) mentors incoming interns and L3 engineers and wants a set of stub posts to seed both the Mentoring and Learning sections, plus a few Misc topics.

## Goals

- `/blog/` shows, for each of Learning/Mentoring/Misc, a header (still linking to the full section page) followed by a list of direct links to that section's individual posts.
- Reuse the existing header+list visual pattern already used on `/mentoring/` (`.mentoring-group` / `.mentoring-group-title` / `.mentoring-guide-list`) rather than inventing new styles — rename these classes to generic, non-section-specific names (`.link-group` / `.link-group-title` / `.link-list`) since they'll now serve both `/blog/` and `/mentoring/`.
- Remove the now-unused `.hub-cards` / `.hub-card` CSS.
- Seed content:
  - **Mentoring** (general, portable professional skills — not company-specific): Making a PPT, Ramping Up on GitHub, Project Organization, Preparing for Meetings, Communication.
  - **Learning** (personal technical learning notes): Design Patterns, Decorators, Testing ML Pipelines, Prompt Engineering for Agents.
  - **Misc**: keep the existing "git diff --two-years" post; add TV Shows, Books, Running.
- All new posts are empty stubs (front matter + placeholder section headers with HTML-comment prompts), matching the style of the existing stub `2026-06-30-registry-pattern.md`.

## Non-goals

- No change to `/learning/`, `/mentoring/`, or `/misc/` page content/behavior beyond the CSS class rename (they keep their existing excerpt lists, tag filter, and tag-grouping respectively).
- No change to permalink structure, front-matter schema, or the taxonomy rules established in the prior design doc.
- Not writing the actual content of the new stub posts — only scaffolding them for the owner to fill in later.
- Not adding new top-level nav items.

## Architecture

### `blog/index.html`

Replaces the `.hub-cards` grid of three `<a>` cards with three `.link-group` blocks, one per category:

- Each block's `.link-group-title` is an `<h2><a href=".../">Section Name</a></h2>` linking to the full section page.
- Each block's `.link-list` (`<ul>`) lists that category's posts as `<li><a href="{{ post.url }}">{{ post.title }}</a></li>`.
- **Learning** and **Misc** lists: `site.categories.<name> | sort: "date" | reverse` (reverse-chronological, matching their section pages).
- **Mentoring** list: `site.categories.mentoring | sort: "title"` (flat alphabetical — matches Mentoring's non-chronological nature; no tag sub-grouping on the hub page itself, since that level of detail lives on `/mentoring/`).
- No pagination; all posts in a category render in one list (consistent with the rest of the site).

### CSS (`assets/css/main.scss`)

- Rename `.mentoring-group` → `.link-group`, `.mentoring-group-title` → `.link-group-title`, `.mentoring-guide-list` → `.link-list`. Same rules, just generalized names since two pages use them now. Update `mentoring/index.html`'s markup to match the renamed classes.
- Delete the `.hub-cards` and `.hub-card` (+ `:hover`) rules — no longer referenced anywhere after `blog/index.html` changes.

### New stub posts (`_posts/`)

All dated `2026-07-16`, filename per Jekyll convention `2026-07-16-<slug>.md`, front matter `title`, `date`, `categories: [mentoring]` or `[learning]` or `[misc]`, a plausible `tags` list, and a one-line `excerpt`. Body: 2-3 placeholder `##` section headers with an HTML-comment prompt under each, mirroring `_posts/2026-06-30-registry-pattern.md`'s existing stub style (`## The problem I ran into`, `## Discovering the pattern`, etc., adapted per topic — e.g. Mentoring guides use headers like `## Why this matters` / `## The guide` instead of "problem/pattern" framing, since they're how-tos, not learning narratives).

Files to create:

| Category | Filename | Title |
|---|---|---|
| mentoring | `2026-07-16-making-a-ppt.md` | Making a PPT |
| mentoring | `2026-07-16-ramping-up-on-github.md` | Ramping Up on GitHub |
| mentoring | `2026-07-16-project-organization.md` | Project Organization |
| mentoring | `2026-07-16-preparing-for-meetings.md` | Preparing for Meetings |
| mentoring | `2026-07-16-communication.md` | Communication |
| learning | `2026-07-16-design-patterns.md` | Design Patterns |
| learning | `2026-07-16-decorators.md` | Decorators |
| learning | `2026-07-16-testing-ml-pipelines.md` | Testing ML Pipelines |
| learning | `2026-07-16-prompt-engineering-for-agents.md` | Prompt Engineering for Agents |
| misc | `2026-07-16-tv-shows.md` | TV Shows |
| misc | `2026-07-16-books.md` | Books |
| misc | `2026-07-16-running.md` | Running |

(The existing `2026-06-24-git-diff-two-years.md` is untouched.)

## Error handling / edge cases

- A category with zero posts would render an empty `<ul>` under its header on `/blog/` — not currently possible since every category will have at least the stub posts above, but the Liquid `for` loop degrades safely to nothing (no broken markup) if it ever happens.
- Mentoring's alphabetical sort on `/blog/` is by `title`, so stub posts with placeholder titles will interleave with real ones exactly as expected — no special-casing needed for "draft" vs "finished" posts.

## Testing / verification plan

Manual, per existing site convention (no test suite):

1. `bundle exec jekyll build` (or `serve`) and confirm it builds clean.
2. Visit `/blog/`: confirm three headers (Learning, Mentoring, Misc), each linking to its section page, each followed by a list of post-title links that resolve correctly.
3. Visit `/mentoring/`: confirm it still renders correctly after the CSS class rename (grouped-by-tag layout unchanged visually).
4. Spot-check 2-3 of the new stub posts render without errors (correct category page inclusion, correct permalink).
5. Confirm no remaining references to `.hub-cards` / `.hub-card` in the codebase after removal.
