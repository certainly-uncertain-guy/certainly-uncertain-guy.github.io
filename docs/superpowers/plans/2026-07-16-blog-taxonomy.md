# Blog Taxonomy (Learning/Mentoring/Misc) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single flat, paginated `/blog/` feed with a `/blog/` hub linking to three sections — `/learning/`, `/mentoring/`, `/misc/` — driven by two new front-matter fields (`categories`, `tags`) on posts that stay in the existing flat `_posts/` directory.

**Architecture:** One `_posts/` collection, unchanged. Every post gets exactly one `categories` value (`learning`/`mentoring`/`misc`) and zero-or-more freeform `tags`. Three new Jekyll pages (`learning/index.html`, `mentoring/index.html`, `misc/index.html`) each render a Liquid-filtered view of `site.categories.<name>`: Learning is reverse-chronological with a client-side tag filter, Mentoring is grouped by tag (reference-style, no dates), Misc is a dated list plus an empty, ready-to-fill "living pages" data file. `blog/index.html` becomes three static link cards. Permalinks move from `/blog/:year/:month/:day/:title/` to `/:categories/:year/:month/:day/:title/`.

**Tech Stack:** Jekyll 3.10.0 (via the `github-pages` gem — GitHub Pages plugin whitelist only, confirmed: `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-paginate`), Liquid 4.0.4, vanilla JS (no framework, no build step), SCSS (Minima base + custom properties in `assets/css/main.scss`).

**Adaptation note — testing on a static site:** This repo has no test framework. "Tests" in this plan are `bundle exec jekyll build` (one-shot, non-interactive) followed by `test -f` / `grep` assertions against the generated `_site/` output — the closest equivalent to red/green for a Jekyll site. Every task still follows verify-before / verify-after.

**Liquid filter constraint (verified against the installed Liquid 4.0.4):** the `push` filter does **not** exist in this environment (confirmed empirically — it silently no-ops rather than raising) and must not be used. `uniq`, `join`, `sort`, `contains`, `size` are all confirmed available and are used below instead. Tag groupings are built by iterating `site.tags` (already deduplicated, since it's a hash keyed by tag name) and checking category membership per tag, not by manually accumulating arrays.

**Jekyll permalink mechanics (verified):** the `:title` permalink placeholder is derived from the **post's filename** (the part after the date, before the extension), not from the front-matter `title:` field. Seed post filenames below are chosen so the resulting URLs are exactly predictable for the verification commands.

## Global Constraints

- Deploys via the plain `github-pages` gem (no custom Actions workflow) — only the GitHub Pages plugin whitelist is available. Do not add new plugins.
- Every post's `categories` front matter must be exactly one of `learning`, `mentoring`, `misc`.
- Header nav stays `Home | Blog` — no new top-level nav items.
- No pagination on `/learning/`, `/mentoring/`, or `/misc/` (full filtered list renders on one page).
- No "living pages" (e.g. running stats) are built in this plan — `_data/misc_pages.yml` stays an empty list; this plan only wires up the empty slot.
- **Per this repo's `CLAUDE.md`: never run `git add` or `git commit` without first asking the user for explicit permission — every "Commit" step below is a proposed commit point, not something to execute automatically.** Whoever executes this plan (subagent or main session) must pause and ask before each one.

---

### Task 1: Seed posts (test fixtures for every later task)

**Files:**
- Create: `_posts/2026-07-16-learning-seed-prometheus-grafana.md`
- Create: `_posts/2026-07-16-mentoring-seed-pr-description.md`
- Create: `_posts/2026-07-16-misc-seed-running-log.md`

**Interfaces:**
- Produces: three posts with `categories`/`tags` front matter that Tasks 2–8 build and verify against. Filenames are fixed inputs to the `test -f` assertions in every later task — do not rename them without updating those tasks.

- [ ] **Step 1: Write the three seed posts**

`_posts/2026-07-16-learning-seed-prometheus-grafana.md`:
```markdown
---
title: "Getting Started with Prometheus and Grafana"
categories: [learning]
tags: [prometheus, grafana, observability]
excerpt: "Notes from setting up my first Prometheus + Grafana monitoring stack."
---

This is a placeholder Learning post used to verify the Learning section renders correctly, including tag filtering. Replace or remove once real content exists.
```

`_posts/2026-07-16-mentoring-seed-pr-description.md`:
```markdown
---
title: "How to Write a Good PR Description"
categories: [mentoring]
tags: [engineering, code-review]
excerpt: "A short guide on what makes a pull request description useful."
---

This is a placeholder Mentoring post used to verify the Mentoring section groups guides by tag correctly. Replace or remove once real content exists.
```

`_posts/2026-07-16-misc-seed-running-log.md`:
```markdown
---
title: "Why I Started Tracking My Runs"
categories: [misc]
tags: [running, personal]
excerpt: "A nerdy aside about why I decided to start logging running data."
---

This is a placeholder Misc post used to verify the Misc section renders dated posts alongside the (currently empty) living-pages area. Replace or remove once real content exists.
```

- [ ] **Step 2: Build and verify all three posts are generated**

Run:
```bash
bundle exec jekyll build
test -f _site/blog/2026/07/16/learning-seed-prometheus-grafana/index.html && echo "learning OK"
test -f _site/blog/2026/07/16/mentoring-seed-pr-description/index.html && echo "mentoring OK"
test -f _site/blog/2026/07/16/misc-seed-running-log/index.html && echo "misc OK"
```
Expected: all three `echo` lines print (paths still under `/blog/...` at this point — the permalink change happens in Task 2).

- [ ] **Step 3: Commit**

Ask the user for explicit permission first (per Global Constraints). If granted:
```bash
git add _posts/2026-07-16-learning-seed-prometheus-grafana.md _posts/2026-07-16-mentoring-seed-pr-description.md _posts/2026-07-16-misc-seed-running-log.md
git commit -m "Add seed posts for blog taxonomy verification"
```

---

### Task 2: Category-aware permalinks

**Files:**
- Modify: `_config.yml`

**Interfaces:**
- Consumes: the three seed posts from Task 1 (their `categories` front matter).
- Produces: the permalink pattern `/:categories/:year/:month/:day/:title/` that every later task's URLs depend on (e.g. `{{ post.url | relative_url }}` links generated in Tasks 3–6).

- [ ] **Step 1: Verify old permalink pattern still applies (pre-change)**

Run:
```bash
bundle exec jekyll build
test -f _site/blog/2026/07/16/learning-seed-prometheus-grafana/index.html && echo "OLD PATTERN STILL ACTIVE"
```
Expected: `OLD PATTERN STILL ACTIVE` prints, confirming the change in Step 2 is what moves the URL.

- [ ] **Step 2: Update the posts permalink default**

In `_config.yml`, change:
```yaml
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
      permalink: /blog/:year/:month/:day/:title/
```
to:
```yaml
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
      permalink: /:categories/:year/:month/:day/:title/
```
(The `type: "pages"` scope below it is unchanged.)

- [ ] **Step 3: Build and verify the new category-prefixed URLs**

Run:
```bash
bundle exec jekyll build
test -f _site/learning/2026/07/16/learning-seed-prometheus-grafana/index.html && echo "learning URL OK"
test -f _site/mentoring/2026/07/16/mentoring-seed-pr-description/index.html && echo "mentoring URL OK"
test -f _site/misc/2026/07/16/misc-seed-running-log/index.html && echo "misc URL OK"
test ! -f _site/blog/2026/07/16/learning-seed-prometheus-grafana/index.html && echo "old URL gone"
```
Expected: all four lines print.

- [ ] **Step 4: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add _config.yml
git commit -m "Move post permalinks under their category (/learning|mentoring|misc/...)"
```

---

### Task 3: Learning page with tag filter

**Files:**
- Create: `learning/index.html`
- Create: `assets/js/tag-filter.js`
- Modify: `assets/css/main.scss` (append new rules)

**Interfaces:**
- Consumes: `site.categories.learning` (built by Jekyll from Task 1/2's front matter); CSS classes `.post-list`, `.post-card`, `.post-title`, `.post-excerpt`, `.post-date`, `.btn.small` already defined in `assets/css/main.scss` (reused, not redefined).
- Produces: `/learning/` page; new CSS classes `.section-intro`, `.tag-filter`, `.tag-pill`, `.tag-pill.active` for Tasks 4–6 to reuse where applicable; `assets/js/tag-filter.js` (self-contained, only loaded on this page).

- [ ] **Step 1: Verify the page doesn't exist yet**

Run:
```bash
bundle exec jekyll build
test ! -f _site/learning/index.html && echo "not built yet, as expected"
```
Expected: prints `not built yet, as expected`.

- [ ] **Step 2: Create `learning/index.html`**

```html
---
layout: default
title: Learning
permalink: /learning/
---

<section class="blog-section">
  <div class="container">
    <p class="section-intro">Notes on what I'm learning — new tools, AI and algorithms, project write-ups, and reflections on management and work.</p>

    {% assign learning_posts = site.categories.learning | sort: "date" | reverse %}

    <div class="tag-filter" id="tag-filter">
      <button class="tag-pill active" data-tag="all" type="button">All</button>
      {% for tag_item in site.tags %}
        {% assign tag_name = tag_item[0] %}
        {% assign tag_posts = tag_item[1] %}
        {% assign show_tag = false %}
        {% for p in tag_posts %}
          {% if p.categories contains "learning" %}
            {% assign show_tag = true %}
          {% endif %}
        {% endfor %}
        {% if show_tag %}
          <button class="tag-pill" data-tag="{{ tag_name }}" type="button">{{ tag_name }}</button>
        {% endif %}
      {% endfor %}
    </div>

    <div class="post-list" id="post-list">
      {% for post in learning_posts %}
        <article class="post-card" data-tags="{{ post.tags | join: ',' }}">
          <p class="post-date">{{ post.date | date: "%B %-d, %Y" }}</p>
          <h2 class="post-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 160 }}</p>
          <a href="{{ post.url | relative_url }}" class="btn small">Read More</a>
        </article>
      {% endfor %}
    </div>
  </div>
</section>

<script src="{{ '/assets/js/tag-filter.js' | relative_url }}"></script>
```

- [ ] **Step 3: Create `assets/js/tag-filter.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  var filterBar = document.getElementById('tag-filter');
  var postList = document.getElementById('post-list');

  if (!filterBar || !postList) {
    return;
  }

  var pills = filterBar.querySelectorAll('.tag-pill');
  var cards = postList.querySelectorAll('.post-card');

  filterBar.addEventListener('click', function (event) {
    var pill = event.target.closest('.tag-pill');
    if (!pill) {
      return;
    }

    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.remove('active');
    }
    pill.classList.add('active');

    var selectedTag = pill.getAttribute('data-tag');

    for (var j = 0; j < cards.length; j++) {
      var card = cards[j];
      if (selectedTag === 'all') {
        card.style.display = '';
        continue;
      }
      var tags = (card.getAttribute('data-tags') || '').split(',');
      card.style.display = tags.indexOf(selectedTag) !== -1 ? '' : 'none';
    }
  });
});
```

(Degrades gracefully: every post card is present in the HTML regardless of JS — if the script fails to load, the pills are inert `<button>` elements and the full unfiltered list stays visible.)

- [ ] **Step 4: Append tag-filter CSS to `assets/css/main.scss`**

Append at the end of the file:
```scss
/* Section intro (Learning/Mentoring/Misc) */
.section-intro {
  max-width: 90%;
  margin: 0 auto 2.5rem;
  font-size: 1.125rem;
  color: var(--light-text);
}

/* Tag filter (Learning page) */
.tag-filter {
  max-width: 90%;
  margin: 0 auto 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-color);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-pill:hover {
  border-color: var(--primary-color);
}

.tag-pill.active {
  background-color: var(--primary-color);
  color: var(--background) !important;
  border-color: var(--primary-color);
}
```

- [ ] **Step 5: Build and verify**

Run:
```bash
bundle exec jekyll build
test -f _site/learning/index.html && echo "page built"
grep -q "Getting Started with Prometheus and Grafana" _site/learning/index.html && echo "seed post listed"
grep -q 'data-tag="prometheus"' _site/learning/index.html && echo "tag pill rendered"
grep -q 'data-tags="prometheus,grafana,observability"' _site/learning/index.html && echo "post card tags rendered"
test -f _site/assets/js/tag-filter.js && echo "JS asset built"
```
Expected: all five lines print.

- [ ] **Step 6: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add learning/index.html assets/js/tag-filter.js assets/css/main.scss
git commit -m "Add Learning page with client-side tag filter"
```

---

### Task 4: Mentoring page (grouped reference list)

**Files:**
- Create: `mentoring/index.html`
- Modify: `assets/css/main.scss` (append new rules)

**Interfaces:**
- Consumes: `site.categories.mentoring`, `site.tags` (same mechanism as Task 3, different rendering); reuses `.section-intro` from Task 3.
- Produces: `/mentoring/` page; new CSS classes `.mentoring-group`, `.mentoring-group-title`, `.mentoring-guide-list`.

- [ ] **Step 1: Verify the page doesn't exist yet**

Run:
```bash
bundle exec jekyll build
test ! -f _site/mentoring/index.html && echo "not built yet, as expected"
```
Expected: prints `not built yet, as expected`.

- [ ] **Step 2: Create `mentoring/index.html`**

Groups tagged posts by tag, and adds a "General" group as a catch-all for any mentoring post with no tags (so an untagged guide is never silently dropped from the page — see spec's error-handling note that untagged posts must still be visible somewhere).

```html
---
layout: default
title: Mentoring
permalink: /mentoring/
---

<section class="blog-section">
  <div class="container">
    <p class="section-intro">A reference library for the boring-but-important stuff — how to write a PPT, run a code review, open a PR, and more. Read the guide once, then just point people here.</p>

    {% assign mentoring_posts = site.categories.mentoring %}

    {% for tag_item in site.tags %}
      {% assign tag_name = tag_item[0] %}
      {% assign tag_posts = tag_item[1] %}
      {% assign has_mentoring_post = false %}
      {% for p in tag_posts %}
        {% if p.categories contains "mentoring" %}
          {% assign has_mentoring_post = true %}
        {% endif %}
      {% endfor %}
      {% if has_mentoring_post %}
        <div class="mentoring-group">
          <h2 class="mentoring-group-title">{{ tag_name }}</h2>
          <ul class="mentoring-guide-list">
            {% for p in tag_posts %}
              {% if p.categories contains "mentoring" %}
                <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
              {% endif %}
            {% endfor %}
          </ul>
        </div>
      {% endif %}
    {% endfor %}

    {% assign has_untagged = false %}
    {% for p in mentoring_posts %}
      {% if p.tags == empty %}
        {% assign has_untagged = true %}
      {% endif %}
    {% endfor %}
    {% if has_untagged %}
      <div class="mentoring-group">
        <h2 class="mentoring-group-title">General</h2>
        <ul class="mentoring-guide-list">
          {% for p in mentoring_posts %}
            {% if p.tags == empty %}
              <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
            {% endif %}
          {% endfor %}
        </ul>
      </div>
    {% endif %}
  </div>
</section>
```

- [ ] **Step 3: Append mentoring-group CSS to `assets/css/main.scss`**

Append at the end of the file:
```scss
/* Mentoring page */
.mentoring-group {
  max-width: 90%;
  margin: 0 auto 2.5rem;
}

.mentoring-group-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.mentoring-guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mentoring-guide-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
bundle exec jekyll build
test -f _site/mentoring/index.html && echo "page built"
grep -q ">engineering<" _site/mentoring/index.html && echo "tag group rendered"
grep -q "How to Write a Good PR Description" _site/mentoring/index.html && echo "seed post listed"
grep -q 'class="post-date"' _site/mentoring/index.html || echo "no chronological dates shown, as intended"
```
Expected: all four lines print (the fourth is a negative check — the grep must find nothing, so the `||` branch runs).

- [ ] **Step 5: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add mentoring/index.html assets/css/main.scss
git commit -m "Add Mentoring page grouped by tag"
```

---

### Task 5: Misc page (dated posts + empty living-pages slot)

**Files:**
- Create: `misc/index.html`
- Create: `_data/misc_pages.yml`
- Modify: `assets/css/main.scss` (append new rules)

**Interfaces:**
- Consumes: `site.categories.misc`; `site.data.misc_pages` (a list of `{title, url, description}` objects — currently empty, this is the schema future living pages must follow to appear on `/misc/` without further template changes).
- Produces: `/misc/` page; new CSS classes `.misc-pages`, `.misc-page-card`.

- [ ] **Step 1: Verify the page doesn't exist yet**

Run:
```bash
bundle exec jekyll build
test ! -f _site/misc/index.html && echo "not built yet, as expected"
```
Expected: prints `not built yet, as expected`.

- [ ] **Step 2: Create `_data/misc_pages.yml`**

```yaml
[]
```

- [ ] **Step 3: Create `misc/index.html`**

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

    {% assign misc_posts = site.categories.misc | sort: "date" | reverse %}
    <div class="post-list">
      {% for post in misc_posts %}
        <article class="post-card">
          <p class="post-date">{{ post.date | date: "%B %-d, %Y" }}</p>
          <h2 class="post-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 160 }}</p>
          <a href="{{ post.url | relative_url }}" class="btn small">Read More</a>
        </article>
      {% endfor %}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Append misc-pages CSS to `assets/css/main.scss`**

Append at the end of the file:
```scss
/* Misc living pages */
.misc-pages {
  max-width: 90%;
  margin: 0 auto 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.misc-page-card {
  display: block;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-color) !important;
  text-decoration: none !important;
  transition: transform 0.3s ease;
}

.misc-page-card:hover {
  transform: translateY(-5px);
}
```

- [ ] **Step 5: Build and verify**

Run:
```bash
bundle exec jekyll build
test -f _site/misc/index.html && echo "page built"
grep -q "Why I Started Tracking My Runs" _site/misc/index.html && echo "seed post listed"
grep -qv 'class="misc-pages"' _site/misc/index.html && echo "empty living-pages area correctly omitted"
```
Expected: all three lines print (empty `_data/misc_pages.yml` means the `{% if %}` block never renders, so `.misc-pages` shouldn't appear in the output at all).

- [ ] **Step 6: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add misc/index.html _data/misc_pages.yml assets/css/main.scss
git commit -m "Add Misc page with dated posts and an empty living-pages slot"
```

---

### Task 6: Blog hub page + remove dead pagination config

**Files:**
- Modify: `blog/index.html` (full rewrite)
- Modify: `_config.yml` (remove now-unused `paginate`/`paginate_path`)
- Modify: `assets/css/main.scss` (append new rules)

**Interfaces:**
- Consumes: links to `/learning/`, `/mentoring/`, `/misc/` from Tasks 3–5.
- Produces: `/blog/` as a static hub with no paginated feed; `paginator.posts` is no longer used anywhere in the site after this task.

- [ ] **Step 1: Verify current paginated behavior (pre-change)**

Run:
```bash
bundle exec jekyll build
grep -q "post-list" _site/blog/index.html && echo "old paginated feed still present"
```
Expected: prints `old paginated feed still present`.

- [ ] **Step 2: Rewrite `blog/index.html`**

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
        <p>Notes on new tools, AI, algorithms, project write-ups, and reflections on management and work.</p>
      </a>
      <a class="hub-card" href="{{ '/mentoring/' | relative_url }}">
        <h2>Mentoring</h2>
        <p>A reference library for routine how-tos — PPTs, reports, code reviews, PRs, and more.</p>
      </a>
      <a class="hub-card" href="{{ '/misc/' | relative_url }}">
        <h2>Misc</h2>
        <p>Nerdy personal-data projects and one-off write-ups that don't fit anywhere else.</p>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Remove dead pagination config from `_config.yml`**

Delete these two lines (and the now-empty `# Pagination for blog` comment above them):
```yaml
# Pagination for blog
paginate: 5
paginate_path: "/blog/page:num/"
```
(`jekyll-paginate` stays listed under `plugins:` — it remains a harmless, whitelisted dependency in case a section needs pagination later; only the active config is removed.)

- [ ] **Step 4: Append hub-card CSS to `assets/css/main.scss`**

Append at the end of the file:
```scss
/* Blog hub */
.hub-cards {
  max-width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
  margin-bottom: 0.75rem;
}
```

- [ ] **Step 5: Build and verify**

Run:
```bash
bundle exec jekyll build
test -f _site/blog/index.html && echo "hub page built"
grep -q "hub-card" _site/blog/index.html && echo "hub cards rendered"
grep -qv "post-list" _site/blog/index.html && echo "old paginated feed removed"
test ! -d _site/blog/page2 && echo "pagination output gone"
```
Expected: all four lines print.

- [ ] **Step 6: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add blog/index.html _config.yml assets/css/main.scss
git commit -m "Turn /blog/ into a static hub linking to Learning/Mentoring/Misc"
```

---

### Task 7: Document the taxonomy in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the final shape of all pages/config from Tasks 1–6.
- Produces: durable documentation so future work (by Claude Code or the site owner) doesn't have to re-derive the taxonomy rules from the spec.

- [ ] **Step 1: Update the "Content files" bullet list**

In `CLAUDE.md`, replace:
```markdown
**Content files:**
- `index.markdown` — homepage bio, uses the `default` layout directly (not `page`).
- `blog/index.html` — blog listing page, uses `jekyll-paginate` (`paginator.posts`).
- `_posts/` — blog posts; filename must follow Jekyll convention `YYYY-MM-DD-title.md`, front matter needs `layout: post` (set by default in `_config.yml`).
```
with:
```markdown
**Content files:**
- `index.markdown` — homepage bio, uses the `default` layout directly (not `page`).
- `blog/index.html` — static hub page linking to the three sections below. No longer a post feed.
- `learning/index.html`, `mentoring/index.html`, `misc/index.html` — the three blog sections (see "Blog taxonomy" below).
- `_data/misc_pages.yml` — list of standalone "living pages" (e.g. a future running-stats page) shown as cards on `/misc/`; empty until one is added.
- `_posts/` — blog posts; filename must follow Jekyll convention `YYYY-MM-DD-title.md`, front matter needs `layout: post` (set by default in `_config.yml`). Every post's `:title` permalink segment comes from the **filename**, not the front-matter `title:`.
```

- [ ] **Step 2: Replace the "Blog pagination" section with a "Blog taxonomy" section**

Replace:
```markdown
**Blog pagination:** Set to 5 posts per page in `_config.yml` (`paginate: 5`). Posts live at `/blog/:year/:month/:day/:title/` by permalink default.
```
with:
```markdown
**Blog taxonomy:** Every post must set `categories` to exactly one of `learning`, `mentoring`, or `misc` — this determines both which section page it appears on and its permalink prefix (`permalink: /:categories/:year/:month/:day/:title/` in `_config.yml`). `tags` are freeform and optional:
- **Learning** (`/learning/`) — reverse-chronological, with a client-side tag filter (`assets/js/tag-filter.js`) driven by whatever tags appear on Learning posts.
- **Mentoring** (`/mentoring/`) — not chronological; grouped by tag as a scannable reference list. Untagged Mentoring posts fall into a "General" group so nothing is dropped.
- **Misc** (`/misc/`) — reverse-chronological dated posts, plus an optional card area for standalone "living pages" listed in `_data/misc_pages.yml` (empty by default).

No pagination is used on any of these pages (`jekyll-paginate` stays installed but unconfigured).
```

- [ ] **Step 3: Verify the doc renders sensibly**

Run:
```bash
grep -q "Blog taxonomy" CLAUDE.md && echo "section present"
grep -q "living pages" CLAUDE.md && echo "misc_pages documented"
```
Expected: both lines print.

- [ ] **Step 4: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add CLAUDE.md
git commit -m "Document the blog taxonomy in CLAUDE.md"
```

---

### Task 8: Remove seed posts and do a final clean-slate build

**Files:**
- Delete: `_posts/2026-07-16-learning-seed-prometheus-grafana.md`
- Delete: `_posts/2026-07-16-mentoring-seed-pr-description.md`
- Delete: `_posts/2026-07-16-misc-seed-running-log.md`

**Interfaces:**
- Consumes: nothing new — this is cleanup once Tasks 1–7 have been verified against the seed fixtures.
- Produces: a repo state with zero real posts, proving the three section pages and the hub don't break when a category has no posts yet (the state real users will see before the owner publishes anything).

- [ ] **Step 1: Delete the seed posts**

Run:
```bash
rm _posts/2026-07-16-learning-seed-prometheus-grafana.md \
   _posts/2026-07-16-mentoring-seed-pr-description.md \
   _posts/2026-07-16-misc-seed-running-log.md
```

- [ ] **Step 2: Build with zero posts and verify nothing breaks**

Run:
```bash
bundle exec jekyll build
test -f _site/blog/index.html && echo "hub still builds"
test -f _site/learning/index.html && echo "learning still builds"
test -f _site/mentoring/index.html && echo "mentoring still builds"
test -f _site/misc/index.html && echo "misc still builds"
grep -qv "post-card" _site/learning/index.html && echo "learning empty-state OK (no stray cards)"
```
Expected: all five lines print — an empty `site.categories.learning` (etc.) simply produces an empty `{% for %}` loop, not an error.

- [ ] **Step 3: Confirm RSS and sitemap still build (unaffected by category changes)**

Run:
```bash
test -f _site/feed.xml && echo "feed.xml OK"
test -f _site/sitemap.xml && echo "sitemap.xml OK"
```
Expected: both lines print.

- [ ] **Step 4: Commit**

Ask the user for explicit permission first. If granted:
```bash
git add -u _posts
git commit -m "Remove seed posts used to verify the blog taxonomy"
```
