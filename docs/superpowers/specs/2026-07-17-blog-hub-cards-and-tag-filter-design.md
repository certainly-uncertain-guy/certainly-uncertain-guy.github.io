# Blog Hub Cards + Unified Tag-Filter Design

Date: 2026-07-17
Status: Draft — pending review

## Context

`/blog/` currently shows three header+link-list sections (Learning/Mentoring/Misc), each a heading linking to the section page followed by a flat list of that section's post titles (see [2026-07-16-blog-hub-link-list-design.md](2026-07-16-blog-hub-link-list-design.md)). The owner wants to move back toward a card-based hub, but bigger and more descriptive than the original `.hub-card` grid it replaced: three (eventually up to 4-6) large clickable cards, each with a big bold section header and a 4-6 sentence description of what lives in that section. Clicking a card goes to the section's own page.

Separately, the three section pages (`/learning/`, `/mentoring/`, `/misc/`) currently have inconsistent layouts: Learning has a flat reverse-chronological post list with a tag-filter pill bar; Mentoring groups posts under a heading per tag with no filter; Misc has a flat reverse-chronological post list with no filter at all. The owner wants all three unified on the Learning-style flat-list-plus-tag-filter pattern, since every post already carries multiple tags and filtering scales better than fixed tag groupings as the number of posts and tags grows.

## Goals

- `/blog/` shows a responsive grid of large cards, one per category (Learning/Mentoring/Misc today; the grid must accommodate up to 4-6 cards later without a redesign).
  - Each card: big bold header (bigger than the current hub header style) + a 4-6 sentence description, whole card is a link to the section's page.
  - Sized so ~3-4 cards fill the width of a 16-inch laptop browser window; collapses to a single full-width column on phones.
- All three section pages (`/learning/`, `/mentoring/`, `/misc/`) use the same layout: a tag-filter pill bar (built from tags actually used in that category) above a flat, reverse-chronological list of post cards. Selecting a tag filters the list client-side (existing `tag-filter.js` behavior, unchanged).
- Extract the tag-filter-bar + post-list Liquid block into a shared, category-parameterized include so the same ~25 lines aren't duplicated three times.
- Remove now-unused CSS (`.link-group`, `.link-group-title`/`.hub-title`, `.link-list`) and restore/extend `.hub-cards`/`.hub-card` styling for the new card sizing.
- Update CLAUDE.md's "Blog taxonomy" section, which currently documents Mentoring as "not chronological; grouped by tag," to reflect the new unified behavior.

## Non-goals

- No change to `tag-filter.js` itself — its DOM-based filtering logic (`#tag-filter` / `#post-list` / `.post-card[data-tags]`) already works for any page that provides that markup; no new pages/behaviors are needed there.
- No change to permalink structure, front-matter schema, or the one-category-per-post taxonomy rule.
- Not adding new tags to existing Misc posts beyond what they already have (`personal`, `career`, etc.) — the filter bar will just be thin on Misc until more varied posts are added.
- Not adding new top-level nav items.
- Not deleting the superseded `2026-07-16-blog-hub-link-list-design.md` / its companion plan file — left as historical record.

## Architecture

### `blog/index.html`

Front matter unchanged (`layout: default`, `title: Blog`, `permalink: /blog/`). Body replaces the three `.link-group` blocks with a `.hub-cards` grid of three `.hub-card` links:

```html
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

(Description copy above is a draft the owner can edit post-implementation; not a hard requirement of this spec.)

### Shared include: `_includes/tag-filtered-posts.html`

New file (this is the site's first `_includes` partial). Takes one required parameter, `category` (a string: `learning`, `mentoring`, or `misc`), and renders the tag-filter bar + post list for that category, generalizing the block that exists today in `learning/index.html`:

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

Each section page becomes:

```html
---
layout: default
title: <Learning|Mentoring|Misc>
permalink: /<learning|mentoring|misc>/
---

<section class="blog-section">
  <div class="container">
    <p class="section-intro">...(unchanged per-page intro text)...</p>

    {% include tag-filtered-posts.html category="learning" %}
  </div>
</section>

<script src="{{ '/assets/js/tag-filter.js' | relative_url }}"></script>
```

`misc/index.html` keeps its existing `.misc-pages` living-pages block (from `_data/misc_pages.yml`) positioned above the `{% include %}` call, unchanged.

`mentoring/index.html` loses its entire tag-grouping Liquid loop (the current lines building `.link-group`/`.link-list` per tag plus the "General" fallback group) in favor of the single include call — the "General" untagged-post fallback goes away since the flat-list-plus-filter pattern doesn't need it (an untagged post simply won't appear under any tag pill but will still show under "All").

### CSS (`assets/css/main.scss`)

- Remove `.link-group`, `.link-group-title` (including the `.hub-title` modifier), and `.link-list` + `.link-list li` — fully unused after the above changes.
- Add/restore `.hub-cards` (grid: `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;` inside the existing `.container`, max-width 1400px) and `.hub-card` (bordered, padded card, block-level link, hover lift like the old version) with:
  - A header style bigger/bolder than the previous hub-title (e.g. `2.25rem`/`800` weight retained or increased slightly — final number tuned visually during implementation).
  - Comfortable padding (~2-2.5rem) to accommodate the longer 4-6 sentence paragraph without feeling cramped.
- No new media queries: `auto-fit`/`minmax` already collapses to one column on narrow (phone) widths; existing `768px`/`480px` breakpoints are untouched.
- `.tag-filter`/`.tag-pill` CSS is unchanged and now shared by all three section pages (already generic, no rename needed).

### CLAUDE.md

Update the "Blog taxonomy" bullet describing Mentoring (currently: "not chronological; grouped by tag as a scannable reference list") to describe the new unified reverse-chronological + tag-filter behavior shared with Learning and Misc.

## Error handling / edge cases

- A category with zero posts renders an empty `.post-list` under a functioning (but tag-less beyond "All") filter bar — Liquid loops degrade safely to nothing.
- An untagged post still appears under "All" but under no specific tag pill — acceptable since Mentoring's current "General" fallback group is being retired in favor of this simpler model.
- The include's `category` parameter is a plain string compared via `contains`, matching the existing `p.categories contains "learning"` pattern already used elsewhere in the codebase — no risk of partial-string false matches since categories are constrained to exactly `learning`/`mentoring`/`misc`.

## Testing / verification plan

Manual, per existing site convention (no test suite):

1. `bundle exec jekyll build` and confirm it builds clean.
2. Visit `/blog/`: confirm three (or however many exist) large cards render in a grid, each with a header and multi-sentence description, each fully clickable to its section page. Resize the browser window to confirm the grid reflows from ~3-4 columns down to one column on a narrow/phone-width viewport.
3. Visit `/learning/`, `/mentoring/`, `/misc/`: confirm each shows a tag-filter bar followed by a flat reverse-chronological post list; confirm clicking a tag pill filters the visible posts and clicking "All" restores them; confirm Mentoring's guides (previously grouped) now appear as a flat list; confirm Misc now has a (thin) working filter bar.
4. Confirm no remaining references to `.hub-cards`/`.hub-card`-adjacent old classes (`.link-group`, `.link-group-title`, `.hub-title`, `.link-list`) anywhere in the codebase after removal:
   `grep -rn "link-group\|link-list\|hub-title" --include="*.html" --include="*.scss" .`
5. Spot-check that clicking a post title/card on any section page navigates to a working post page.
