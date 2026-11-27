# Blog Hub Cards + Unified Tag-Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/blog/`'s header+link-list sections with a card grid (big header + 4-6 sentence description per section, whole card clickable), and unify `/learning/`, `/mentoring/`, `/misc/` on a single shared tag-filter + flat-post-list layout.

**Architecture:** Extract the tag-filter-bar + post-list Liquid block (currently only on `/learning/`) into a new `_includes/tag-filtered-posts.html` partial parameterized by `category`; all three section pages call it. Rewrite `blog/index.html` as a `.hub-cards` grid of `.hub-card` links. Update `assets/css/main.scss` to remove the now-dead `.link-group`/`.link-list`/`.hub-title` classes and add `.hub-cards`/`.hub-card` styling. Update CLAUDE.md's taxonomy description to match.

**Tech Stack:** Jekyll (Liquid templates, `_includes` partials), SCSS. No JS changes — existing `assets/js/tag-filter.js` is reused as-is. No test framework — this is a static content site with manual/visual verification only.

## Global Constraints

- Never run `git add` or `git commit` without asking the user first, even mid-plan — this repo's CLAUDE.md overrides the skill's default per-step commit workflow. Each task below ends with a "propose commit" step, not an automatic one.
- No automated test suite exists for this site. "Testing" a task means running `bundle exec jekyll build` and visually inspecting the rendered page.
- The `_includes/tag-filtered-posts.html` partial takes one required parameter, `include.category`, a string exactly matching a post's `categories` value (`learning`, `mentoring`, or `misc`).
- `.hub-cards`/`.hub-card` grid uses `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` so it reflows automatically for 3 cards today or up to 4-6 later, and collapses to one column on narrow/phone widths, with no new media queries.

---

### Task 1: Create shared tag-filter include, convert Learning to use it

**Files:**
- Create: `_includes/tag-filtered-posts.html`
- Modify: `learning/index.html` (full rewrite)

**Interfaces:**
- Produces: `_includes/tag-filtered-posts.html`, called as `{% include tag-filtered-posts.html category="<learning|mentoring|misc>" %}`. Renders a `#tag-filter` pill bar and a `#post-list` of `.post-card[data-tags]` elements — same DOM contract `assets/js/tag-filter.js` already expects. Consumed by Task 2 (Mentoring) and Task 3 (Misc).

- [ ] **Step 1: Create `_includes/tag-filtered-posts.html`**

```html
{% assign filtered_posts = site.categories[include.category] | default: empty | sort: "date" | reverse %}

<div class="tag-filter" id="tag-filter">
  <button class="tag-pill active" data-tag="all" type="button">All</button>
  {% for tag_item in site.tags %}
    {% assign tag_name = tag_item[0] %}
    {% assign tag_posts = tag_item[1] %}
    {% assign show_tag = false %}
    {% for p in tag_posts %}
      {% if p.categories contains include.category %}
        {% assign show_tag = true %}
      {% endif %}
    {% endfor %}
    {% if show_tag %}
      <button class="tag-pill" data-tag="{{ tag_name }}" type="button">{{ tag_name }}</button>
    {% endif %}
  {% endfor %}
</div>

<div class="post-list" id="post-list">
  {% for post in filtered_posts %}
    <article class="post-card" data-tags="{{ post.tags | join: ',' }}">
      <p class="post-date">{{ post.date | date: "%B %-d, %Y" }}</p>
      <h2 class="post-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 160 }}</p>
      <a href="{{ post.url | relative_url }}" class="btn small">Read More</a>
    </article>
  {% endfor %}
</div>
```

- [ ] **Step 2: Rewrite `learning/index.html` to use the include**

Replace the entire file with:

```html
---
layout: default
title: Learning
permalink: /learning/
---

<section class="blog-section">
  <div class="container">
    <p class="section-intro">Notes on what I'm learning — new tools, AI and algorithms, project write-ups, and reflections on management and work.</p>

    {% include tag-filtered-posts.html category="learning" %}
  </div>
</section>

<script src="{{ '/assets/js/tag-filter.js' | relative_url }}"></script>
```

- [ ] **Step 3: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors (confirms the `_includes` partial resolves and the `category` param works).

Run: `bundle exec jekyll serve` and open `http://localhost:4000/learning/`
Expected: page renders identically to before this change — same tag pills, same post cards in the same reverse-chronological order, filter clicks still work.

- [ ] **Step 4: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add _includes/tag-filtered-posts.html learning/index.html
git commit -m "$(cat <<'EOF'
Extract tag-filter + post-list into a shared include

Pulls Learning's tag-filter/post-list Liquid block into
_includes/tag-filtered-posts.html, parameterized by category, so
Mentoring and Misc can reuse it instead of duplicating the markup.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Convert Mentoring to the shared tag-filter layout

**Files:**
- Modify: `mentoring/index.html` (full rewrite)

**Interfaces:**
- Consumes: `_includes/tag-filtered-posts.html` from Task 1.

- [ ] **Step 1: Rewrite `mentoring/index.html`**

Replace the entire file with:

```html
---
layout: default
title: Mentoring
permalink: /mentoring/
---

<section class="blog-section">
  <div class="container">
    <p class="section-intro">A reference library for the boring-but-important stuff — how to write a PPT, run a code review, open a PR, and more. Read the guide once, then just point people here.</p>

    {% include tag-filtered-posts.html category="mentoring" %}
  </div>
</section>

<script src="{{ '/assets/js/tag-filter.js' | relative_url }}"></script>
```

This drops the old per-tag `.link-group`/`.link-list` grouping loop and the "General" untagged-post fallback group entirely — untagged posts (none currently exist in Mentoring) would still appear under "All" in the new layout, just not under any specific tag pill.

- [ ] **Step 2: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/mentoring/`
Expected:
- A tag-filter pill bar showing "All" plus every tag used across Mentoring posts (`communication`, `process`, `engineering`).
- A flat, reverse-chronological list of all 5 Mentoring posts (no more per-tag headings).
- Clicking a tag pill filters the list; clicking "All" restores it.

- [ ] **Step 3: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add mentoring/index.html
git commit -m "$(cat <<'EOF'
Switch Mentoring to shared tag-filter + flat post list

Replaces the grouped-by-tag layout with the same tag-filter pattern
Learning uses, via the shared tag-filtered-posts.html include.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Convert Misc to the shared tag-filter layout

**Files:**
- Modify: `misc/index.html` (full rewrite)

**Interfaces:**
- Consumes: `_includes/tag-filtered-posts.html` from Task 1.

- [ ] **Step 1: Rewrite `misc/index.html`**

Replace the entire file with:

```html
---
layout: default
title: Misc
permalink: /misc/
---

<section class="blog-section">
  <div class="container">
    <p class="section-intro">Everything else — nerdy personal-data projects and one-off write-ups that didn't fit anywhere above.</p>

    {% if site.data.misc_pages and site.data.misc_pages.size > 0 %}
      <div class="misc-pages">
        {% for p in site.data.misc_pages %}
          <a class="misc-page-card" href="{{ p.url | relative_url }}">
            <h3>{{ p.title }}</h3>
            <p>{{ p.description }}</p>
          </a>
        {% endfor %}
      </div>
    {% endif %}

    {% include tag-filtered-posts.html category="misc" %}
  </div>
</section>

<script src="{{ '/assets/js/tag-filter.js' | relative_url }}"></script>
```

- [ ] **Step 2: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/misc/`
Expected:
- The existing living-pages card area still renders above the post list (empty today since `_data/misc_pages.yml` is empty — no visible change).
- A tag-filter bar showing "All" plus whatever tags Misc posts use today (`personal`, `career`, `operations-research`, `industry-lessons`, `leadership`).
- A flat, reverse-chronological list of all 4 Misc posts.
- Clicking a tag pill filters the list; clicking "All" restores it.

- [ ] **Step 3: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add misc/index.html
git commit -m "$(cat <<'EOF'
Add shared tag-filter to Misc section

Misc now uses the same tag-filtered-posts.html include as Learning
and Mentoring, gaining a working tag filter for the first time.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Rewrite `/blog/` as a card grid, update CSS

**Files:**
- Modify: `blog/index.html` (full rewrite)
- Modify: `assets/css/main.scss:627-657`

**Interfaces:**
- Produces: `.hub-cards` / `.hub-card` CSS classes, consumed only by `blog/index.html` in this task.
- Removes: `.link-group`, `.link-group-title` (incl. `.hub-title`), `.link-list`, `.link-list li` — verified unused after Tasks 1-3 stopped referencing them.

- [ ] **Step 1: Rewrite `blog/index.html`**

Replace the entire file with:

```html
---
layout: default
title: Blog
permalink: /blog/
---

<section class="blog-section">
  <div class="container">
    <div class="hub-cards">
      <a class="hub-card" href="{{ '/learning/' | relative_url }}">
        <h2>Learning</h2>
        <p>Notes on what I'm learning — new tools, algorithms, and ideas from applied AI and operations research. Expect project write-ups where I dig into a technique I used at work or on the side, plus shorter posts when I stumble onto a pattern or trick worth remembering. Some entries are technical deep-dives; others are reflections on management, mentorship, and how I think about growing as an engineer. Nothing here is polished teaching material — it's closer to a lab notebook, written to sharpen my own understanding as much as to share it.</p>
      </a>
      <a class="hub-card" href="{{ '/mentoring/' | relative_url }}">
        <h2>Mentoring</h2>
        <p>A reference library for the boring-but-important stuff I end up repeating to every new intern and early-career engineer I mentor — how to structure a PPT, ramp up on GitHub, organize a project, prepare for a meeting, and communicate clearly with a manager. Each guide is written to be general and portable, not tied to any one company's tools or templates. The goal isn't to be exhaustive; it's to save both of us the time of re-explaining the same fundamentals in a 1:1. Read the guide once, then just point people here next time it comes up.</p>
      </a>
      <a class="hub-card" href="{{ '/misc/' | relative_url }}">
        <h2>Misc</h2>
        <p>Everything else that doesn't fit neatly under Learning or Mentoring — nerdy personal-data projects, running stats, and one-off essays I wanted to write down somewhere. Some posts are dated write-ups, like a reflection on two years in industry; others are living pages I keep updated over time, like a running list of books or TV shows. There's no unifying theme here beyond "things I wanted to track or think through in public." If Learning is my lab notebook and Mentoring is my reference shelf, this is the junk drawer — in the best sense.</p>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Replace the dead CSS block in `main.scss`**

Replace lines 627-657 (from the `/* Shared header+list pattern */` comment through the `.link-list li` rule, i.e. everything up to but not including the `/* Misc living pages */` comment) — currently:

```scss
/* Shared header+list pattern (Mentoring page, Blog hub) */
.link-group {
  max-width: 90%;
  margin: 0 auto 2.5rem;
}

.link-group-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

/* Blog hub section headers (Learning/Mentoring/Misc) — bigger/bolder than the mentoring page's tag-group headers */
.link-group-title.hub-title {
  font-size: 2.25rem;
  font-weight: 800;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}
```

with:

```scss
/* Blog hub cards */
.hub-cards {
  max-width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.hub-card {
  display: block;
  padding: 2.5rem 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-color) !important;
  text-decoration: none !important;
  transition: transform 0.3s ease;
}

.hub-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-color);
}

.hub-card h2 {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.hub-card p {
  color: var(--light-text);
  line-height: 1.6;
}
```

- [ ] **Step 3: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/blog/`
Expected:
- Three cards in a row (on a wide/laptop window), each a full-height bordered box with a big bold header and a multi-sentence paragraph.
- The entire card is clickable and navigates to `/learning/`, `/mentoring/`, or `/misc/` respectively.
- Hovering a card lifts it slightly and highlights the border (existing `.hub-card:hover` behavior).
- Resize the browser window narrower (or use dev tools device emulation for a phone width): cards stack to one full-width column with no horizontal scrolling or overflow.

Run: `grep -rn "link-group\|link-list\|hub-title" --include="*.html" --include="*.scss" .`
Expected: no matches anywhere in the repo.

- [ ] **Step 4: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add blog/index.html assets/css/main.scss
git commit -m "$(cat <<'EOF'
Replace blog hub link-lists with a card grid

Reverts /blog/ to a card-based layout — bigger headers, 4-6 sentence
descriptions, whole card clickable — sized to show 3-4 cards on a
laptop screen and stack to one column on mobile. Removes the now-dead
link-group/link-list/hub-title CSS from the previous link-list design.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Update CLAUDE.md taxonomy description

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** None (documentation only).

- [ ] **Step 1: Update the "Content files" bullet list**

In the "Content files" section, after the line:

```
- `_data/misc_pages.yml` — list of standalone "living pages" (e.g. a future running-stats page) shown as cards on `/misc/`; empty until one is added.
```

add a new bullet:

```
- `_includes/tag-filtered-posts.html` — shared tag-filter bar + post-list partial, included by `learning/index.html`, `mentoring/index.html`, and `misc/index.html`, parameterized by `category`.
```

- [ ] **Step 2: Update the "Blog taxonomy" section**

Replace:

```
- **Learning** (`/learning/`) — reverse-chronological, with a client-side tag filter (`assets/js/tag-filter.js`) driven by whatever tags appear on Learning posts.
- **Mentoring** (`/mentoring/`) — not chronological; grouped by tag as a scannable reference list. Untagged Mentoring posts fall into a "General" group so nothing is dropped.
- **Misc** (`/misc/`) — reverse-chronological dated posts, plus an optional card area for standalone "living pages" listed in `_data/misc_pages.yml` (empty by default).

No pagination is used on any of these pages.
```

with:

```
- **Learning** (`/learning/`) — reverse-chronological, with a client-side tag filter (`assets/js/tag-filter.js`) driven by whatever tags appear on Learning posts.
- **Mentoring** (`/mentoring/`) — reverse-chronological, with the same tag-filter pattern as Learning.
- **Misc** (`/misc/`) — reverse-chronological dated posts, with the same tag-filter pattern as Learning, plus an optional card area for standalone "living pages" listed in `_data/misc_pages.yml` (empty by default).

All three section pages share their tag-filter + post-list markup via `_includes/tag-filtered-posts.html` (parameterized by `category`). `/blog/` itself is a static card grid (`.hub-cards`/`.hub-card`) linking to each section — not a post feed.

No pagination is used on any of these pages.
```

- [ ] **Step 3: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Update CLAUDE.md for unified tag-filter taxonomy

Documents the shared tag-filtered-posts.html include and Mentoring's
switch from grouped-by-tag to reverse-chronological + tag-filter.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Full end-to-end verification

**Files:** None (verification only).

**Interfaces:**
- Consumes: everything produced by Tasks 1-5.

- [ ] **Step 1: Full clean build**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors or warnings about missing layouts/includes/permalinks.

- [ ] **Step 2: Visual pass over all four pages**

Run: `bundle exec jekyll serve` and open each of:
- `http://localhost:4000/blog/` — three-card grid, each fully clickable, big header + multi-sentence description, reflows to one column at phone width.
- `http://localhost:4000/learning/` — tag-filter bar + flat post list, unchanged from before this plan.
- `http://localhost:4000/mentoring/` — tag-filter bar + flat post list (no more tag-grouped headings).
- `http://localhost:4000/misc/` — living-pages area (if any) + tag-filter bar + flat post list.

For each of the three section pages, click through at least one tag pill and confirm the list filters, then click "All" and confirm it restores.

- [ ] **Step 3: Confirm no dangling references**

Run: `grep -rn "link-group\|link-list\|hub-title" --include="*.html" --include="*.scss" .`
Expected: no matches.

- [ ] **Step 4: Confirm every section page includes the shared partial**

Run: `grep -rn "tag-filtered-posts" learning/index.html mentoring/index.html misc/index.html`
Expected: one match per file, each with a different `category` value (`learning`, `mentoring`, `misc`).

No commit for this task — it's pure verification of the work already committed in Tasks 1-5.
