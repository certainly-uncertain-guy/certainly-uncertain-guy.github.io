# Running a Research Project — Post + Asset Convention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the placeholder post `_posts/2026-07-16-project-organization.md` into a full guide ("Running a Research Project") based on `/Users/ashutosh/Desktop/Project-Template/0_main.pdf`, and establish + document a per-post asset folder convention (`assets/img/posts/<slug>/`).

**Architecture:** Two independent, sequential changes to a Jekyll static site: (1) a one-bullet addition to CLAUDE.md documenting the new asset-folder convention, (2) a full front-matter + body rewrite of one existing post file, plus creation of its (currently empty) asset folder. No app code, no test suite — "testable" here means the Jekyll build succeeds and produces the expected output HTML at the expected permalink.

**Tech Stack:** Jekyll (Ruby), Markdown, front-matter YAML.

## Global Constraints

- **Never run `git add` or `git commit`, at any step, without first asking the user and getting explicit permission for that specific commit.** This is a standing project rule (CLAUDE.md → "Git" section), not a one-off — it applies to every task below, even though the template step "Commit" appears in the writing-plans format. Where a step would normally commit, instead: stop and ask the user whether to commit, and only run `git add`/`git commit` if they say yes.
- `_site/` is generated output — never edit it directly; only read it to verify build output.
- Post filename `_posts/2026-07-16-project-organization.md` and its date stay unchanged — only front matter and body change. The permalink is `/:categories/:year/:month/:day/:title/`, so the slug is `project-organization`.
- `categories: [mentoring]` stays unchanged (already correct per CLAUDE.md's blog taxonomy).

---

### Task 1: Document the per-post asset folder convention in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md:42` (end of the `_posts/` bullet in the "Content files" section)

**Interfaces:**
- Produces: the convention `assets/img/posts/<slug>/` that Task 2 relies on when creating the post's asset folder and referencing the placeholder image.

- [ ] **Step 1: Add the new bullet to CLAUDE.md**

In `CLAUDE.md`, find this line (currently line 42):

```
- `_posts/` — blog posts; filename must follow Jekyll convention `YYYY-MM-DD-title.md`, front matter needs `layout: post` (set by default in `_config.yml`). Every post's `:title` permalink segment comes from the **filename**, not the front-matter `title:`.
```

Immediately after it, insert a new bullet in the same list:

```
- `assets/img/posts/<slug>/` — per-post images and animations, one folder per post, named after the post's `:title` slug (the filename minus the `YYYY-MM-DD-` prefix and `.md` extension — the same string used in the permalink). Referenced from post markdown/HTML with absolute paths like `/assets/img/posts/<slug>/name.png`.
```

- [ ] **Step 2: Verify the edit**

Run: `grep -A1 "_posts/.*Jekyll convention" CLAUDE.md`
Expected: the `_posts/` bullet followed immediately by the new `assets/img/posts/<slug>/` bullet, with no other lines changed.

- [ ] **Step 3: Ask before committing**

Per Global Constraints, stop here and ask the user whether to commit this change. Do not run `git add` or `git commit` unless they explicitly say yes.

---

### Task 2: Create the post's asset folder and rewrite the post

**Files:**
- Create: `assets/img/posts/project-organization/` (empty directory — the user will drop `abstract-guidelines.png` into it later)
- Modify: `_posts/2026-07-16-project-organization.md` (full front-matter + body rewrite)

**Interfaces:**
- Consumes: the convention from Task 1 (`assets/img/posts/<slug>/`, slug = `project-organization`)

- [ ] **Step 1: Create the asset folder**

Run: `mkdir -p assets/img/posts/project-organization`

- [ ] **Step 2: Rewrite the post**

Replace the entire contents of `_posts/2026-07-16-project-organization.md` with:

```markdown
---
title: "Running a Research Project"
date: 2026-07-16
categories: [mentoring]
tags: [research, writing, process]
excerpt: "A practical guide to running a research project end to end — from setting up the repo, to picking a problem worth working on, to drafting and revising the paper."
---
## Setting up a project

Start every research project as a LaTeX project, even before you know exactly where it's headed. Give it a preamble, and a running notebook file — a log of time-stamped entries describing what you did and why. It's cheap to keep and invaluable when you need to reconstruct how a result came about.

Alongside the notebook, create a manuscript file with the skeleton you'll eventually fill in: abstract, introduction, methods, results, discussion and conclusion, acknowledgements, appendix. Having the shape of the paper in front of you from day one makes it easier to see where a new result belongs.

Add a beamer file too, even if no talk is scheduled yet — it's the natural place to keep the slides you'll use for project updates, and starting it early means you're not assembling a talk from scratch under time pressure.

Finally, start a GitHub repo for the code. Write commit titles and messages that actually describe what changed, not just `wip`. Open issues for things you notice but don't have time to fix. Write a README — future you (and any collaborator) will need it.

## Choosing a problem

Before committing to a research problem, answer the Heilmeier Catechism — a set of questions originally used by DARPA to vet proposals, but they work just as well as a personal gut-check:

1. What are you trying to do? State your objective with no jargon.
2. How is it done today, and what are the limits of current practice?
3. What's new in your approach, and why do you think it'll work?
4. Who cares? If you succeed, what difference does it make?
5. What are the risks?
6. How much will it cost?
7. How long will it take?
8. What are the mid-term and final checkpoints for success?

If you can't answer these cleanly, that's a sign the problem needs more shaping before you commit real time to it.

## The writing process

Before drafting anything, write a detailed outline — not just section headings, but the sub-headings, leading sentences, and bullets that capture the key idea in each sub-section. Place the key equations, figures, and tables at this stage too, and if you have co-authors, this is when to get everyone aligned on what the findings are and how they should be ordered. The order you use in the outline should be the same order you use when writing.

When you actually draft, don't write top to bottom. Write in this order: **results, methods, discussion and conclusion, introduction, abstract.** Results and methods are the parts you actually know cold — write those first. The introduction and abstract are easiest to write last, once you know exactly what the paper says.

Once a full draft exists:
- Edit critically — reread for logic, not just typos.
- Read it out loud — your ear catches awkward phrasing your eyes skip past.
- Get a friend or colleague to proofread and critique it — a fresh reader finds gaps you can't see anymore.

## Section-by-section notes

**Title.** Be specific — the title should convey exactly what the paper achieved. Choose words with SEO in mind, so the paper surfaces when your target audience searches. Keep the title's wording distinct from your keywords list, so together they cover more ground.

**Abstract.** A good abstract follows a fairly rigid shape: one or two sentences of basic background, two or three sentences of more detailed background, one sentence stating the general problem, one sentence stating the main result ("here we show..."), two or three sentences on how that result compares to prior belief, one or two sentences putting it in general context, and optionally a closing broader-perspective note.

<!-- TODO: paste the abstract-writing guidelines snapshot here -->
<img src="/assets/img/posts/project-organization/abstract-guidelines.png" alt="Guidelines for writing a paper abstract, annotated by sentence" />

**Introduction.** The job of the introduction is to earn the reader's attention. Cover background and motivation (why does this topic matter), the research gap (what's known, what isn't), and your contributions (what does this paper actually add — aim for two per conference paper, four per journal paper). Lean on statistics from reports, news, policy briefs, and executive orders to make the stakes concrete.

**Literature review.** Once you've motivated the problem, organize prior work around an actual organizing principle — not just a list of papers in publication order. For each group of related work, cover what was done, what it taught us, what's still unknown, and how your paper addresses that gap.

**Methods.** Document enough detail that a reader could reproduce the work, and include a schematic figure. Use plenty of sub-headings — the goal isn't just to be read, it's to be studied, and sub-headings let a reader jump straight to the part they need. For quantitative/optimization-style work, a useful default is: overview, notation, assumptions, mathematical model, model discussion, solution methodology.

**Results.** List every finding, equation, figure, and table first, then order them — by importance if there's no natural logical order. Give each finding its own paragraph, with the most notable point as the first sentence. Keep this section objective: state what you found, not what it means — interpretation belongs in the discussion. Prefer active voice when referring to figures: "Figure 1 reveals a linear relationship between A and B," not "A and B were found to be linearly related in Figure 1."

**Discussion and conclusion.** This is where interpretation happens — the introduction argues why the topic matters, this section argues why your findings matter. Restate the significance of the work, interpret and discuss the implications of what you found, compare against related work, be honest about the limitations, and close with a summary and directions for future work.
```

- [ ] **Step 3: Build the site**

Run: `bundle exec jekyll build`
Expected: build completes with no errors.

- [ ] **Step 4: Verify the post renders at the expected permalink**

Run: `test -f _site/mentoring/2026/07/16/project-organization/index.html && echo FOUND`
Expected: `FOUND`

- [ ] **Step 5: Verify the placeholder image tag is present in the output**

Run: `grep -o '/assets/img/posts/project-organization/abstract-guidelines.png' _site/mentoring/2026/07/16/project-organization/index.html`
Expected: the path is printed (confirms the `<img>` tag survived the build; the image file itself doesn't need to exist yet).

- [ ] **Step 6: Ask before committing**

Per Global Constraints, stop here and ask the user whether to commit this change. Do not run `git add` or `git commit` unless they explicitly say yes.

---

## Self-Review Notes

- **Spec coverage:** Task 1 covers spec section 1 (convention + CLAUDE.md doc). Task 2 covers spec sections 2–3 (post rewrite, asset folder, placeholder image). All spec "Files touched" are covered.
- **Placeholders:** The only `TODO` in the plan is the intentional, spec-required HTML comment inside the post body itself (marking where the user will paste their own image) — not a plan placeholder.
- **Commit steps:** Adapted from the default writing-plans template to respect this repo's CLAUDE.md override — every task ends by asking the user, never by auto-committing.
