---
title: "git diff --two-years"
date: 2026-06-24
categories: []
tags: []
---
June 3, 2026 marked two years since I finished grad school and joined BNSF Railway. Since then, I have been reflecting on the lessons I learned over these two years, and because they still feel fresh, I am making an attempt to put them on paper. The idea is that through essays like this, I can watch how my worldview evolves with time.

## Transition: from academia to industry

I arrived at BNSF carrying the enthusiasm of someone who had just spent years immersed in graduate coursework and research, and who had developed an arsenal of analytical tools that I felt ready to put to use. During grad school, I took eighteen courses, an unusually high number. I touched several areas within Applied Mathematics: from machine learning and reinforcement learning to distributionally robust optimization, to simulation and queuing theory, to discrete optimization. Grad school days were, in many ways, the best of my life: alongside a deep dive into developing modeling and algorithmic frameworks for network resilience decision-making against extreme events, I explored an enormous breadth of adjacent fields. When I finally started my job, I was eager to put all of it to use.

### A wide range of problems

My job responsibilities at BNSF did not disappoint me at all on that front. The railroad offered a wide spectrum of problems to work on, and even though I could not personally touch every one of them, I was fortunate to be surrounded by like-minded operations research and simulation experts who, collectively, covered nearly the entire range. I had the luxury of dropping by their desks, having long conversations about the approaches they were taking and the design choices behind them. I was consistently surprised by the level of detail the simulation models at BNSF captured: a team of three had developed a model that simulated the operations of an entire yard.

### Finding my own problems

What struck me most, though, was how different the process of finding a problem was compared to my previous jobs. In a typical company, there is a strong notion of product: the business decides what to build, product managers translate that decision into epics, features, and stories, and only once a project has been scoped with a detailed product roadmap does engineering or data science begin its work. At BNSF, the process ran in the opposite direction. We were expected, and often encouraged, to network across the company, ask people about the problems weighing on them, and develop our own prototypes before presenting them back. If there was sufficient interest, an idea would take off; otherwise, it might remain a small internal tool, or simply be set aside. We were handed high-level problem definitions at best, and given extreme flexibility to stretch those problems in whatever direction seemed promising. It felt, in many ways, like searching for a dissertation topic all over again. Just as my graduate advisor once introduced me to people when we had only a vague notion of what research direction to pursue, my manager did the same at BNSF, and together we spent hours turning those vague notions into use cases, ultimately exploring several different directions before converging on a few.

### Four early experiments

In my first six months, brainstorming led me down at least four distinct paths. The first one was about developing a quick tool that would tell how much it costs to re-route a train. The tool had real but very moderate usage limited to a small number of people. The second idea I pursue required implmenting an idea from game theory: a Stackelberg game applied to a toll-pricing problem, for which I hand-derived the complementarity constraint equations myself. The model performed as expected, but the underlying computational complexity of the problem made the approach impossible to scale, and the lack of traction eventually meant the project never left the ground. A third effort, a stable matching algorithm meant to decide which trains should be combined into longer trains to save resources, still sits in a repository today. The fourth was a model for assignment and scheduling: it sat untouched for nine months before it caught the attention of senior management, and once it did, it took off in a way none of the others had. That algorithm is now deployed at one of the largest fueling terminals in North America, overseeing more than a billion dollars worth of fuel consumption, and it gave me the opportunity to present the work at academic conferences. The algorithm is now being scaled to serve several hubs and terminals.

### The train-to-track project

That fourth project, the train-to-track assignment problem at BNSF's largest fueling station, was my first real encounter with how operations research is practiced in industry, and it taught me things graduate school never had reason to. In this project, nobody cared much about the optimality gap. What mattered was automation that could replace the inconsistent, judgment-based assignments that humans had been making based on their hunch about what the right thing to do was. The model needed to produce decisions while accounting for a wide range of real-world constraints: the topology of the fueling terminal, the hierarchy of train importance, near-real-time adjustments as train arrival estimates changed, and a full schedule generated for the following day. Most interesting of all, and something I had never encountered in graduate school, was the requirement that every single assignment be perfectly explainable.

### Learning to sell the work

This was the first time I had to navigate a tradeoff in which scientific rigor was not the only guiding principle. I needed to earn early social capital. I needed to deliver something that worked within weeks. And I needed the output to be polished enough to catch the attention of a busy leader with little patience for unfinished work. So I did exactly that: after two months of essentially locking myself in my cubicle, disconnected from the rest of the company, I built a backtracking algorithm that elegantly did what it was supposed to do. I also learnt to lean on others for things I was not good at. Specifically, in this case, I found someone in the company who knew dashboarding well enough to make a Gantt Chart on Power BI for me, which we auto-refreshed with the most up-to-date recommendations. Wherever we wanted to sell our model, instead of explaining anything much, we would just show the dashboard and let them play with it. I learnt an important lesson here: nobody wants to listen, nobody wants to read, but everyone is happy to engage and play with tools. The more interactive the front-end of your model is, the more likely it is to get attention.

### An academic mindset in industry

While I picked up on some of the things that mattered more in industry than in academia, at heart, I approached problems just like an academic. Anything that offered an opportunity to build a cool algorithm from scratch, I would chase. Very soon, as you will read below, I realized how many other things needed to fall into place to get a model to production. I learnt the importance of stakeholder alignment, the importance of effective communication, the importance of building relationships, earning social capital with partners, and advocacy from senior-most leaders. These are factors that decide whether that cool model of mine will make it to production or not. I will soon get to specifics but the short version is this: because I did not account for all these factors, it took ten months after the model was ready for it to catch the attention of a vice president, fourteen months after it was ready to finally make it into production, and fifteen months after it was ready before finance signed off, confirming that the model was making a measurable financial impact.

## Transition: from a mid-level to a senior engineer

Interestingly, right around the mark I ended year 1, a senior colleague of mine left BNSF. As a consequence, I was made the new owner of this project. Because this project had resources involved, I had to put my train to track project on shelf for a while and devote myself entirely to pick this up. Now in this project, the part that excited me the most was solved to some extent. There was enough evidence to prove that from a science perspective, the approach should work. However, the project was an ongoing effort for two years with no adoption at all. The code for a giant model was in really bad shape, barely had any comments and was around 5k lines of core algorithm in one single file. No classes, no modules, it was a piece of mess. However, it worked. What was uncertain was that can we ever get adoption, was the model doing what was supposed to happen on ground. For this project, science was not to-do part, it was done to some extent, the challenge was adoption and showing measurable impact. Business was convinced that if the model can be deployed and can do what needs to be done, we will become leaders in this domain and will probably be the first railroad to achieve this feat.






​    

​    



## Developing a business-first mindset

Over time, I realized 







Two years ago I joined as a data scientist. I had strong technical instincts and a vague sense that good models were the point. I was wrong about that — at least about which part is hardest.

Here is what I actually learned.

---

## Dollar logic comes before code

The single most important shift in how I think: impact is not a story you tell after shipping. It is a precondition for starting.

Before any feature gets prioritized, I want a defensible dollar value attached to it. Not a vague business case, not a narrative about efficiency — an actual number, ideally one finance will stand behind. If I can't construct that logic upfront, I treat that as a signal the feature isn't ready to build yet, not that I need to work harder on selling it.

This changes how you prioritize. You stop building features because they're interesting or because a stakeholder asked for them. You build in order of expected dollar impact per unit of engineering effort, and you're honest about that math.

The corollary: I want to work where, if I work hard, it actually shows in numbers. That's not mercenary — it's the only way to know if you're pointing in the right direction.

---

## Adoption is a process problem, not a persuasion problem

The second big lesson, and the one that took longer to learn.

I spent time in my first year trying to convince people that the model was good. That's the wrong frame. You don't win adoption by arguing for your solution. You win it by building a process where the comparison is unavoidable and measurable.

What that looks like in practice:

**Deploy first, measure second.** Don't wait for the model to be perfect. Ship it, then instrument it. The feedback you get from real usage is worth more than another month of offline evaluation.

**Make rejection actionable.** When a solution gets rejected on the ground, my reflex used to be frustration. Now I treat it as a data collection problem. A criticism with no counter-solution isn't measurable, so I build the process that forces the counter-solution to exist. When a field team can't execute the model's output, they submit their own solution on the same input. That gives you two plans on identical inputs — now you can compare them against the metrics you actually care about.

**Release on a cadence.** Bi-weekly releases with a real change-management process: tool training, feedback workshops, structured rollouts. Technical debt is only taken on when adoption is trending in the right direction.

The deeper principle: you don't compare performance instance-by-instance. You compare distributions. One bad example doesn't disprove the model. The question is whether the distribution of outcomes is shifting.

---

## Alignment is Phase Zero, not an afterthought

A project should not enter engineering until a few things are locked down:

- Business buy-in from the people who will actually use it
- Finance alignment that can vouch for impact — not just "this seems valuable" but "if this metric moves, it hits our books"
- Committed leadership from every team the project's success depends on
- A measurement contract: what you'll track, how each metric ties to a business outcome, which team owns moving which number, and a baseline

Without this, you can ship technically impressive work and have it go nowhere. I know this because I've seen it happen. Two years of model development, zero percent adoption — the technical work was real, but the alignment infrastructure was missing.

Getting alignment right is harder than getting the model right. And it compounds. Every hour you spend in Phase Zero saves multiples downstream.

---

## Feedback is labeled data

This one reframed how I think about post-production.

Raw feedback from users is low signal. It's high volume, it's inconsistent, and it's hard to act on. But if you design your feedback-capture process correctly, every piece of feedback becomes a labeled example for back-testing.

The setup: when the model's solution can't be executed, the human completes the same task on the same input and submits their solution. Now you have a ground-truth label. You can run back-tests on it. You can measure whether, on average across that distribution, you're improving.

This is what separates a model that gets better over time from one that just accumulates complaints.

---

## The proof

These aren't abstractions. Over 24 weeks and 16 deployments, the playbook above moved the numbers I care about:

- **Compliance**: 10% → 87%
- **Adoption**: 0% → 60%
- **Projected value**: ~$10M in 2026

For the SLOT project specifically — which optimizes switch-list generation in freight rail yards — we ran a finance-led study to put a dollar figure on the cost pool. The work came down to two levers: labor (trainmaster time to generate switch lists) and quality (poor switch lists cause rework, extra pinpulls, non-compliant placements). We built a grading framework across experience levels and computed benefit as the cost delta between what a human at a given experience level would produce versus what SLOT produces. That framing — splitting the gain into compliance wins versus genuinely better solutions — matters, because a win that only came from breaking a rule isn't a win.

---

## What I'm still figuring out

I don't have a good cross-functional conflict story yet. The alignment principles exist, but I haven't written down a crisp case where two committed leaders disagreed and I had to navigate it. That's real work and it deserves a real account.

The collaboration story from building our exec dashboard also needs a proper arc. Right now I have the setup and the outcome but not the decision and the tradeoff in between. I'll write that when I've thought it through.

---

The through-line across all of this: optimize for leverage. Not for lines of code, not for model complexity, not for how technically interesting the problem is. For leverage — the decisions and systems that multiply the output of everyone around you. That's what two years in has taught me to care about.

