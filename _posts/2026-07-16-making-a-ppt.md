---
title: "On making presentations"
date: 2026-04-13
categories: [mentoring]
tags: [communication, process]
excerpt: "A general guide to putting together a clear, effective presentation — wherever you work."
---

A presentation means presenting an idea, finding, recommendation, or a take on something. Making a presentation should therefore never default to assuming that a PowerPoint presentation is required. Notice that the name is PowerPoint, which implies it is a tool for powering points that already exist. This only makes sense when there are points to make in the first place.

A common pattern that I see among several people is that they jump straight to making a PowerPoint presentation without first making sure that they have a point to make. In my experience, it is surprisingly hard to first ponder, then organize, ideas, data, and analysis, and only then convert all of that into a series of points that build toward a final recommendation or stance on something.

It is difficult to overstate how important it is to spend enough time on this exercise: asking what it is you want to say, then checking whether there is data to support the claim. If there is enough data and enough claims, do those claims actually tie together to form a solid argument?

Often, individual points or claims make sense on their own, yet stitching them together can still be logically flawed. Every claim should therefore be correct on its own terms, and it should also connect with the rest to form a coherent key message.

Before making any presentation, this exercise should already be complete, with hand written answers to the questions above as evidence.

## Choosing a mode of presentation

Never assume that a PowerPoint presentation is the best way to present findings. More often than not, a word document turns out to be more effective than a PowerPoint presentation. A word document allows for more detail, relevant sections, hyperlinking, and referring to ideas or concepts introduced earlier in the prose, among other things. It also gives the reader the flexibility to consume information at their own pace, since some passages may need to be read more than once before they are fully grasped.

How to write a good report, article, or manuscript is an entire discussion of its own. The way I see it, there are some general guidelines on how to write well, but no rules that are set in stone. To me, this makes writing more of an art, though being an art doesn't mean it can't be learned. In fact, one gets better at it by reading and mimicking good writers, then practicing deliberately. For me, Paul Graham has been a source of inspiration; his essays are worth reading for anyone curious about what good writing looks like. The Sense of Style by Steven Pinker is also worth reading for those who want to go deeper. Without expanding more on this, I will get back to our discussion on making PowerPoint or Beamer style presentations.

Once the points you want to make are settled and the logic and reasoning behind what you want to say seems airtight, the next step is to make a reasoned case for which mode of communication to choose. Some options are:

1. Word document
2. LaTeX document
3. Markdown file
4. Email
5. Meeting in person
6. Whiteboard session
7. PowerPoint presentation
8.  Beamer

If the answer is a word document, LaTeX document, or Markdown file, see [this post](/mentoring/2026/07/16/running-a-research-project/) for guidance on writing; further questions can always be discussed directly. If the answer is email, consider reading about smart brevity, and consider asking Claude to rewrite the message in that style. If the answer is a meeting in person or a whiteboard session, reach out directly to plan it. If the answer is a PowerPoint presentation or Beamer, continue reading below. 

## Pointers for making a PowerPoint/Beamer presentation

As much as possible, stick to a white background and black text. This works well even when your presentation is projected on a large screen in a room which has too much of sun light. Always plan for this case; and things will, on average, work well in all settings. 


Avoid using additional colors. When not used properly, they often cause distraction. Every time you decide to use an additional color, be prepared to justify why you need it. Furthermore, each color should indicate the same thing throughout the presentation. For example, if a blue box means database and a red box means API, that convention should hold everywhere. The same goes for shapes: if a kite indicates a decision point, it should be the same kite everywhere. There should also be clear reasoning behind every color choice. For example, red should not be used to indicate water in the same presentation where blue indicates fire. Another example: people commonly associate red with something wrong, a warning, or stop, and green with something good or safe to proceed. Such color associations should be kept in mind. It also helps to stick to a color-blind-friendly palette so all readers can easily follow along.

Each slide title should be four or five words describing the point of that slide. The slide itself should contain only the tables, figures, equations, or flow charts needed to explain that point, and each slide should make only one point. The order of the slides should reflect the sequence in which the argument is being built. [This](https://x.com/polak_jasper/status/1550816018158833667?s=21&t=HCCU5Lw4ivwBQo8PoxE9KA) is a good tweet how to think about organizing slides. There is no single rule to this. Just make sure you have given some thought to the organizational principle.

If a logo needs to be included, keep it small and place it in the top right corner. A YouTube video on editing the slide master is worth watching, since it allows an image to be pasted onto the master slide so the logo replicates across every slide automatically.

When PowerPoint first opens, it shows a default placeholder that says something like click here to add title. These placeholders should not be moved; write directly into them so titles stay aligned. Wherever possible, duplicate slides so formatting stays consistent and only the core text changes.

When it becomes unavoidable to put a large amount of information on a single slide, such as an entire mathematical model, use a transparent curtain style template. For reference, see slides 19-22 through twenty two in [this sample talk](/assets/pdf/sample_talk.pdf). This approach lets the curtain drop down across the slide so the audience sees only a small amount of additional content at a time, and that content can be tied back to the rest of the context. By the end, when the audience has seen 10-20 equations on the slide, they understand exactly how everything connects and how it is thematically organized.

That talk can also serve as a reference to build on and improve further; it is from graduate school days :) If your presentation does a better job of explaining these principles, I will swap mine for yours.
