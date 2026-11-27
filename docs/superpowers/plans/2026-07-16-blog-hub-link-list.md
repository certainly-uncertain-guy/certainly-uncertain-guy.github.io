# Blog Hub Link-List + Stub Posts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/blog/`'s three-card grid with three header+link-list sections (Learning/Mentoring/Misc), and seed the Mentoring/Learning/Misc sections with stub posts for onboarding and personal-learning content.

**Architecture:** Rename the existing Mentoring-page CSS classes (`.mentoring-group*`) to generic link-list classes so both `/blog/` and `/mentoring/` can share them; rewrite `blog/index.html` to loop over `site.categories.<name>` and render those shared classes; add plain markdown stub files to `_posts/` following the site's existing filename/front-matter convention.

**Tech Stack:** Jekyll (Liquid templates), SCSS, Markdown front matter. No JS, no test framework — this is a static content site with manual/visual verification only.

## Global Constraints

- Never run `git add` or `git commit` without asking the user first, even mid-plan — this repo's CLAUDE.md overrides the skill's default per-step commit workflow. Each task below ends with a "propose commit" step, not an automatic one.
- No automated test suite exists for this site. "Testing" a task means running `bundle exec jekyll build` and visually inspecting the rendered page — per the design spec's verification plan.
- Every post's `categories` front matter must be exactly one of `learning`, `mentoring`, `misc`.
- Post filenames must follow `YYYY-MM-DD-title.md`; the URL slug comes from the filename, not the front-matter `title:`.
- All new stub posts use `date: 2026-07-16`.

---

### Task 1: Rename Mentoring CSS classes to generic link-list classes, remove hub-card CSS

**Files:**
- Modify: `assets/css/main.scss:627-701`
- Modify: `mentoring/index.html:23-32`

**Interfaces:**
- Produces: CSS classes `.link-group`, `.link-group-title`, `.link-list` (replacing `.mentoring-group`, `.mentoring-group-title`, `.mentoring-guide-list`), consumed by Task 2 (`blog/index.html`) and this task's own `mentoring/index.html` update.

- [ ] **Step 1: Rename the CSS classes in `main.scss`**

Replace lines 627-650 (the `/* Mentoring page */` block) from:

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

to:

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

- [ ] **Step 2: Delete the now-unused hub-card CSS**

Remove lines 675-701 (the `/* Blog hub */` block) entirely:

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

- [ ] **Step 3: Update `mentoring/index.html` to use the renamed classes**

In `mentoring/index.html`, change the two `<div class="mentoring-group">` occurrences to `<div class="link-group">`, `class="mentoring-group-title"` to `class="link-group-title"`, and `class="mentoring-guide-list"` to `class="link-list"`. The full updated block (replacing lines 22-53):

```html
      {% if has_mentoring_post %}
        <div class="link-group">
          <h2 class="link-group-title">{{ tag_name }}</h2>
          <ul class="link-list">
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
      <div class="link-group">
        <h2 class="link-group-title">General</h2>
        <ul class="link-list">
          {% for p in mentoring_posts %}
            {% if p.tags == empty %}
              <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
            {% endif %}
          {% endfor %}
        </ul>
      </div>
    {% endif %}
```

- [ ] **Step 4: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/mentoring/`
Expected: page renders identically to before the rename — grouped-by-tag guide lists, same visual style, no broken CSS (open dev tools / view source to confirm no leftover references to `.mentoring-group` anywhere).

Run: `grep -rn "hub-card\|mentoring-group\|mentoring-guide-list" --include="*.html" --include="*.scss" .`
Expected: no matches anywhere in the repo.

- [ ] **Step 5: Propose commit**

Ask the user for permission before committing (per this repo's CLAUDE.md — never commit without asking first). If approved:

```bash
git add assets/css/main.scss mentoring/index.html
git commit -m "$(cat <<'EOF'
Rename mentoring-group CSS classes to generic link-list classes

Prepares the header+list pattern to be shared with the blog hub page,
and removes the now-unused hub-card grid styles.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Rewrite `blog/index.html` as header+link-list sections

**Files:**
- Modify: `blog/index.html`

**Interfaces:**
- Consumes: `.link-group` / `.link-group-title` / `.link-list` CSS classes from Task 1.
- Consumes: `site.categories.learning`, `site.categories.mentoring`, `site.categories.misc` (built-in Jekyll data, populated once any post exists with a matching `categories` value).

- [ ] **Step 1: Replace the card grid with three link-group sections**

Replace the entire `<section class="blog-section">...</section>` block in `blog/index.html` (lines 7-24) with:

```html
<section class="blog-section">
  <div class="container">

    <div class="link-group">
      <h2 class="link-group-title"><a href="{{ '/learning/' | relative_url }}">Learning</a></h2>
      <ul class="link-list">
        {% assign learning_posts = site.categories.learning | default: empty | sort: "date" | reverse %}
        {% for post in learning_posts %}
          <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    </div>

    <div class="link-group">
      <h2 class="link-group-title"><a href="{{ '/mentoring/' | relative_url }}">Mentoring</a></h2>
      <ul class="link-list">
        {% assign mentoring_posts = site.categories.mentoring | default: empty | sort: "title" %}
        {% for post in mentoring_posts %}
          <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    </div>

    <div class="link-group">
      <h2 class="link-group-title"><a href="{{ '/misc/' | relative_url }}">Misc</a></h2>
      <ul class="link-list">
        {% assign misc_posts = site.categories.misc | default: empty | sort: "date" | reverse %}
        {% for post in misc_posts %}
          <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    </div>

  </div>
</section>
```

The file's front matter (lines 1-5: `layout: default`, `title: Blog`, `permalink: /blog/`) stays unchanged.

- [ ] **Step 2: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/blog/`
Expected:
- Three headers: "Learning", "Mentoring", "Misc", each a clickable link to its section page.
- Under "Learning": the existing posts `Building a Debugging Agent for Optimization Models` and `Discovering the Registry Pattern`, newest first.
- Under "Mentoring": empty for now (no mentoring posts exist yet — until Task 3 runs).
- Under "Misc": `git diff --two-years`.
- Clicking any post title navigates to that post.

- [ ] **Step 3: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add blog/index.html
git commit -m "$(cat <<'EOF'
Replace blog hub card grid with header+link-list sections

Shows post titles directly on /blog/ instead of requiring a click
through to each section page first.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Add Mentoring stub posts

**Files:**
- Create: `_posts/2026-07-16-making-a-ppt.md`
- Create: `_posts/2026-07-16-ramping-up-on-github.md`
- Create: `_posts/2026-07-16-project-organization.md`
- Create: `_posts/2026-07-16-preparing-for-meetings.md`
- Create: `_posts/2026-07-16-communication.md`

**Interfaces:**
- Produces: 5 posts with `categories: [mentoring]`, picked up by `site.categories.mentoring` (consumed by `blog/index.html` from Task 2 and the existing `mentoring/index.html`).

- [ ] **Step 1: Create `_posts/2026-07-16-making-a-ppt.md`**

```markdown
---
title: "Making a PPT"
date: 2026-07-16
categories: [mentoring]
tags: [communication, process]
excerpt: "A general guide to putting together a clear, effective presentation — wherever you work."
---
## Why this matters

<!-- Why is this worth a guide? What goes wrong when people skip this? -->

## The guide

<!-- The actual steps/principles. Keep it general — not tied to any one company's tools or template. -->
```

- [ ] **Step 2: Create `_posts/2026-07-16-ramping-up-on-github.md`**

```markdown
---
title: "Ramping Up on GitHub"
date: 2026-07-16
categories: [mentoring]
tags: [engineering, process]
excerpt: "The GitHub basics every new engineer needs — branches, PRs, reviews, and the habits that keep a repo healthy."
---
## Why this matters

<!-- Why is this worth a guide? What goes wrong when people skip this? -->

## The guide

<!-- The actual steps/principles. Keep it general — not tied to any one company's tools or template. -->
```

- [ ] **Step 3: Create `_posts/2026-07-16-project-organization.md`**

```markdown
---
title: "Project Organization"
date: 2026-07-16
categories: [mentoring]
tags: [process, engineering]
excerpt: "How to structure a new project so it stays navigable as it grows — folders, naming, and documentation habits."
---
## Why this matters

<!-- Why is this worth a guide? What goes wrong when people skip this? -->

## The guide

<!-- The actual steps/principles. Keep it general — not tied to any one company's tools or template. -->
```

- [ ] **Step 4: Create `_posts/2026-07-16-preparing-for-meetings.md`**

```markdown
---
title: "Preparing for Meetings"
date: 2026-07-16
categories: [mentoring]
tags: [communication, process]
excerpt: "How to walk into a meeting — yours or someone else's — with the context and materials that make it useful."
---
## Why this matters

<!-- Why is this worth a guide? What goes wrong when people skip this? -->

## The guide

<!-- The actual steps/principles. Keep it general — not tied to any one company's tools or template. -->
```

- [ ] **Step 5: Create `_posts/2026-07-16-communication.md`**

```markdown
---
title: "Communication"
date: 2026-07-16
categories: [mentoring]
tags: [communication]
excerpt: "How to communicate clearly with your manager or mentor — status updates, asking for help, and flagging risk early."
---
## Why this matters

<!-- Why is this worth a guide? What goes wrong when people skip this? -->

## The guide

<!-- The actual steps/principles. Keep it general — not tied to any one company's tools or template. -->
```

- [ ] **Step 6: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/mentoring/` and `http://localhost:4000/blog/`
Expected:
- `/mentoring/` shows all 5 new guides grouped by their tags (`communication`, `process`, `engineering`) — a guide with multiple tags may appear in more than one group, which is existing, expected behavior of that page.
- `/blog/` now lists all 5 titles under "Mentoring", alphabetically by title.
- Each title links to a working post page at a URL like `/mentoring/2026/07/16/making-a-ppt/`.

- [ ] **Step 7: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add _posts/2026-07-16-making-a-ppt.md _posts/2026-07-16-ramping-up-on-github.md _posts/2026-07-16-project-organization.md _posts/2026-07-16-preparing-for-meetings.md _posts/2026-07-16-communication.md
git commit -m "$(cat <<'EOF'
Add Mentoring stub posts for onboarding guides

Seeds the Mentoring section with empty guides for general,
portable professional skills to point new interns/L3s to.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Add Learning stub posts

**Files:**
- Create: `_posts/2026-07-16-design-patterns.md`
- Create: `_posts/2026-07-16-decorators.md`
- Create: `_posts/2026-07-16-testing-ml-pipelines.md`
- Create: `_posts/2026-07-16-prompt-engineering-for-agents.md`

**Interfaces:**
- Produces: 4 posts with `categories: [learning]`, picked up by `site.categories.learning` (consumed by `blog/index.html` from Task 2 and the existing `learning/index.html`).

- [ ] **Step 1: Create `_posts/2026-07-16-design-patterns.md`**

```markdown
---
title: "Design Patterns"
date: 2026-07-16
categories: [learning]
tags: [software-design, engineering]
excerpt: "A working overview of the design patterns I actually reach for, and the ones I've learned to avoid."
---
## The problem I ran into

<!-- What were you building when you hit friction? What did the code look like before? -->

## Discovering the pattern

<!-- Which pattern(s) did you land on, and why? -->
```

- [ ] **Step 2: Create `_posts/2026-07-16-decorators.md`**

```markdown
---
title: "Decorators"
date: 2026-07-16
categories: [learning]
tags: [software-design, python]
excerpt: "How decorators actually work under the hood, and the cases where they make code clearer instead of more confusing."
---
## The problem I ran into

<!-- What were you building when you hit friction? What did the code look like before? -->

## Discovering the pattern

<!-- How did you end up reaching for a decorator? -->
```

- [ ] **Step 3: Create `_posts/2026-07-16-testing-ml-pipelines.md`**

```markdown
---
title: "Testing ML Pipelines"
date: 2026-07-16
categories: [learning]
tags: [testing, machine-learning]
excerpt: "What's actually worth testing in an ML pipeline — data contracts, model behavior, and the failure modes unit tests miss."
---
## The problem I ran into

<!-- What were you building when you hit friction? What did the code look like before? -->

## Discovering the pattern

<!-- What testing approach did you land on? -->
```

- [ ] **Step 4: Create `_posts/2026-07-16-prompt-engineering-for-agents.md`**

```markdown
---
title: "Prompt Engineering for Agents"
date: 2026-07-16
categories: [learning]
tags: [llm-agents, prompt-engineering]
excerpt: "What actually moves the needle when prompting an agent, versus what feels like it should help but doesn't."
---
## The problem I ran into

<!-- What were you building when you hit friction? What did the code look like before? -->

## Discovering the pattern

<!-- What prompting approach did you land on? -->
```

- [ ] **Step 5: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/learning/` and `http://localhost:4000/blog/`
Expected:
- `/learning/` shows all 4 new posts (plus the 2 existing ones) newest-first; tag pills for `software-design`, `python`, `testing`, `machine-learning`, `llm-agents`, `prompt-engineering` (in addition to existing tags) appear and filter correctly.
- `/blog/` now lists all 6 Learning titles (4 new + 2 existing), newest first.
- Each title links to a working post page.

- [ ] **Step 6: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add _posts/2026-07-16-design-patterns.md _posts/2026-07-16-decorators.md _posts/2026-07-16-testing-ml-pipelines.md _posts/2026-07-16-prompt-engineering-for-agents.md
git commit -m "$(cat <<'EOF'
Add Learning stub posts

Seeds the Learning section with empty write-ups for design patterns,
decorators, testing ML pipelines, and prompt engineering for agents.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Add Misc stub posts

**Files:**
- Create: `_posts/2026-07-16-tv-shows.md`
- Create: `_posts/2026-07-16-books.md`
- Create: `_posts/2026-07-16-running.md`

**Interfaces:**
- Produces: 3 posts with `categories: [misc]`, picked up by `site.categories.misc` (consumed by `blog/index.html` from Task 2 and the existing `misc/index.html`). Does not touch the existing `_posts/2026-06-24-git-diff-two-years.md`.

- [ ] **Step 1: Create `_posts/2026-07-16-tv-shows.md`**

```markdown
---
title: "TV Shows"
date: 2026-07-16
categories: [misc]
tags: [personal]
excerpt: "A running list of TV shows I've watched and what I thought of them."
---
<!-- List/notes go here. -->
```

- [ ] **Step 2: Create `_posts/2026-07-16-books.md`**

```markdown
---
title: "Books"
date: 2026-07-16
categories: [misc]
tags: [personal]
excerpt: "A running list of books I've read and what I thought of them."
---
<!-- List/notes go here. -->
```

- [ ] **Step 3: Create `_posts/2026-07-16-running.md`**

```markdown
---
title: "Running"
date: 2026-07-16
categories: [misc]
tags: [personal]
excerpt: "Notes and stats from running — races, training blocks, whatever's worth tracking."
---
<!-- List/notes go here. -->
```

- [ ] **Step 4: Build and verify**

Run: `bundle exec jekyll build`
Expected: build succeeds with no errors.

Run: `bundle exec jekyll serve` and open `http://localhost:4000/misc/` and `http://localhost:4000/blog/`
Expected:
- `/misc/` shows all 4 Misc posts (3 new + existing `git diff --two-years`), newest first.
- `/blog/` now lists all 4 Misc titles under "Misc", newest first.
- Each title links to a working post page.

- [ ] **Step 5: Propose commit**

Ask the user for permission before committing. If approved:

```bash
git add _posts/2026-07-16-tv-shows.md _posts/2026-07-16-books.md _posts/2026-07-16-running.md
git commit -m "$(cat <<'EOF'
Add Misc stub posts for TV shows, books, and running

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
Expected: build succeeds with no errors or warnings about missing layouts/permalinks.

- [ ] **Step 2: Visual pass over all four pages**

Run: `bundle exec jekyll serve` and open each of:
- `http://localhost:4000/blog/` — three headers, each linking to its section page, each followed by the correct post titles as links.
- `http://localhost:4000/learning/` — unchanged look, now with 4 additional posts, tag filter still works.
- `http://localhost:4000/mentoring/` — unchanged look (post-CSS-rename), now with 5 guides grouped by tag.
- `http://localhost:4000/misc/` — unchanged look, now with 3 additional posts.

- [ ] **Step 3: Confirm no dangling references**

Run: `grep -rn "hub-card\|mentoring-group\|mentoring-guide-list" --include="*.html" --include="*.scss" .`
Expected: no matches.

- [ ] **Step 4: Confirm permalinks resolve correctly**

Run: `grep -rn "categories:" _posts/*.md`
Expected: every post shows exactly one of `[learning]`, `[mentoring]`, `[misc]` — no typos, no multi-category lists.

No commit for this task — it's pure verification of the work already committed in Tasks 1-5.
