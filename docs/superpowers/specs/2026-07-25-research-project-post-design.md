# Design: Per-post asset folders + "Running a Research Project" post

## Context

The blog currently has no convention for where a post's images/animations live. The first post to need one is a rewrite of the placeholder `_posts/2026-07-16-project-organization.md`, based on the user's personal research-writing guide (`/Users/ashutosh/Desktop/Project-Template/0_main.pdf`), which covers more ground than the placeholder's original narrow scope ("project organization" only).

## 1. Per-post asset folder convention

- **Location:** `assets/img/posts/<slug>/`, one subfolder per post.
- **`<slug>`:** the post filename's title segment — the same string Jekyll uses for the `:title` permalink component (filename minus the `YYYY-MM-DD-` prefix and `.md` extension). Example: `_posts/2026-07-16-project-organization.md` → `assets/img/posts/project-organization/`.
- **Rationale:** keeps `_posts/` as pure markdown, groups all media predictably under `assets/`, and the slug ties each folder unambiguously to one post without needing the date prefix.
- **Documentation:** add this convention to CLAUDE.md's "Content files" section so future posts follow it without re-deriving it.

## 2. Post rewrite: `_posts/2026-07-16-project-organization.md`

Filename and date stay as-is (already correct, already determines the permalink). Front matter changes:

- `title`: "Project Organization" → **"Running a Research Project"**
- `excerpt`: rewritten to cover the full scope — setup, problem selection, writing process
- `tags`: `[process, engineering]` → `[research, writing, process]`
- `categories`: unchanged (`[mentoring]`)

Body structure (adapted into blog prose from the PDF's guide, not copied verbatim):

1. **Setting up a project** — LaTeX/repo skeleton, a running notebook log, the manuscript skeleton (abstract/intro/methods/results/discussion/conclusion/acknowledgements/appendix), a beamer file for updates, GitHub hygiene (commit messages, issues, README).
2. **Choosing a problem** — the Heilmeier Catechism as a checklist, presented as questions to answer before committing to a problem.
3. **The writing process** — outline everything down to sub-headings and key figures/equations before drafting; draft in the order results → methods → discussion/conclusion → introduction → abstract; then edit critically, read aloud, get a peer review.
4. **Section-by-section notes** — title (specific, SEO-aware, distinct from keywords), abstract (with the placeholder guideline image described below), introduction (background/motivation, research gap, contributions), literature review (organize by principle, per-group: what/learned/unknown/gap addressed), methods (reproducibility, sub-headings, schematic figure), results (order by importance, one finding per paragraph, active voice, no interpretation), discussion/conclusion (significance, implications, comparison, limitations, future work).

## 3. Abstract image placeholder

In the "Section-by-section notes" abstract section, insert:

```html
<!-- TODO: paste the abstract-writing guidelines snapshot here -->
<img src="/assets/img/posts/project-organization/abstract-guidelines.png" alt="Guidelines for writing a paper abstract, annotated by sentence" />
```

The user will separately snapshot the annotated abstract figure from the PDF (page 3) and save it to that path — no markup changes needed on their end.

## Files touched

- `CLAUDE.md` — document the per-post asset folder convention
- `_posts/2026-07-16-project-organization.md` — full rewrite
- `assets/img/posts/project-organization/` — new empty folder (image dropped in later by user)

## Out of scope

- Extracting/generating the abstract image myself — user is handling that.
- Retrofitting the convention onto other existing placeholder posts (none currently have images).
