---
title: "Starting a research project"
date: 2026-07-16
categories: [mentoring]
tags: [research, writing, process]
excerpt: "A practical guide to running a research project end to end"
---
During my PhD, I converged to a process that I now follow to run a research project. Below is a high-level overview of the same.

## Setting up a project

Start every research/project as a LaTeX/Markdown project folder, even before you know exactly where it is headed. Give it a preamble, and a running notebook file that will have a log of time-stamped entries describing what you did and why. It's cheap to keep and invaluable when you need to reconstruct how a result came about.

Alongside the notebook, create a manuscript/markdown file with the skeleton that you will eventually fill in: abstract, introduction, methods, results, discussion and conclusion, acknowledgements, appendix. Having the shape of the paper/final report in front of you from day one makes it easier to see where a new result belongs.

Add a Beamer/PowerPoint file too, even if no talk is scheduled yet. It should be the natural place to keep the slides you'll use for project updates, and starting it early means you're not assembling a talk from scratch under time pressure.

Finally, start a GitHub repo for the code. Write commit titles and messages that actually describe what changed, not just `wip`. Setup a GitHub project for your repository. Open issues for things you notice but don't have time to fix. Write a README — future you (and any collaborator) will need it.

## Choosing a problem

Before committing to a research problem, answer the Heilmeier Catechism. These are a set of questions originally used by DARPA to vet proposals, but they work just as well as a personal gut-check:

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

Before drafting anything, write a detailed outline; not just section headings, but the sub-headings, leading sentences, and bullets that capture the key idea in each sub-section. Place the key equations, figures, and tables at this stage too, and if you have co-authors, this is when to get everyone aligned on what the findings are and how they should be ordered. The order you use in the outline should be the same order you use when writing.

When you actually draft, don't write top to bottom. Write in this order: **results, methods, discussion and conclusion, introduction, abstract.** Results and methods are the parts you actually know; write those first. The introduction and abstract are easiest to write last, once you know exactly what the paper says.

Once a full draft exists:
- Edit critically: reread for logic, not just typos.
- Read it out loud: your ear catches awkward phrasing your eyes skip past.
- Get a friend or colleague to proofread and critique it. Fresh readers find gaps you can't see anymore.

## Guidelines to write each section

### **Title**

Be specific; the title should convey exactly what the paper achieved. Choose words with SEO in mind, so the paper surfaces when your target audience searches. Keep the title's wording distinct from your keywords list, so together they cover more ground.

### **Abstract**

A good abstract follows a fairly rigid shape: one or two sentences of basic background, two or three sentences of more detailed background, one sentence stating the general problem, one sentence stating the main result ("here we show..."), two or three sentences on how that result compares to prior belief, one or two sentences putting it in general context, and optionally a closing broader-perspective note. (This structure follows Nature's own guidelines for writing summary paragraphs.)

<!-- TODO: paste the abstract-writing guidelines snapshot here, then uncomment:
<img src="/assets/img/posts/starting-a-research-project/abstract-guidelines.png" alt="Guidelines for writing a paper abstract, annotated by sentence" />
-->
<img src="/assets/img/posts/starting-a-research-project/abstract-guidelines.png" alt="Guidelines for writing a paper abstract, annotated by sentence" />

### **Introduction**

The job of the introduction is to earn the reader's attention. Cover background and motivation (why does this topic matter), the research gap (what's known, what isn't), and your contributions (what does this paper actually add — aim for two per conference paper, four per journal paper). Lean on statistics from reports, news, policy briefs, and executive orders to make the stakes concrete.

### **Literature review**

Once you've motivated the problem, organize prior work around an actual organizing principle and not just a list of papers in publication order. For each group of related work, cover what was done, what it taught us, what's still unknown, and how your paper addresses that gap.

### **Methods**

Document enough detail that a reader could reproduce the work, and include a schematic figure. Use plenty of sub-headings — the goal isn't just to be read, it's to be studied, and sub-headings let a reader jump straight to the part they need. For quantitative/optimization-style work, a useful default is: overview, notation, assumptions, mathematical model, model discussion, solution methodology.

### **Results**

List every finding, equation, figure, and table first, then order them by importance if there's no natural logical order. Give each finding its own paragraph, with the most notable point as the first sentence. Keep this section objective: state what you found, not what it means. The interpretation part belongs in the discussion. Prefer active voice when referring to figures: "Figure 1 reveals a linear relationship between A and B," not "A and B were found to be linearly related in Figure 1."

### **Discussion and conclusion**

This is where interpretation happens. The introduction argues why the topic matters, this section argues why your findings matter. Restate the significance of the work, interpret and discuss the implications of what you found, compare against related work, be honest about the limitations, and close with a summary and directions for future work.
