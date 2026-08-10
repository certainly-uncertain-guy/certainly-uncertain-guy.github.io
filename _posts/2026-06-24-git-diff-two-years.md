---
title: "git diff --two-years"
date: 2026-06-24
categories: [learning]
tags: [career, operations-research, industry-lessons, leadership]
excerpt: "Two years after leaving grad school for BNSF Railway — what I got wrong about which part of the job is hardest, and what actually moves a model from a repo to production."
---
June 3, 2026 marked two years since I finished grad school and joined BNSF Railway. Since then, I have been reflecting on the lessons I learnt over these two years, and because they still feel fresh, I am making an attempt to put them on paper. The idea is that through essays like this, I can see how my worldview evolves with time.

## <span style="color: var(--note-color);">Transition: from academia to industry</span>

I arrived at BNSF carrying the enthusiasm of someone who has spent years immersed in graduate coursework and research, and who has developed an arsenal of analytical tools that he feels ready to put to use. During grad school, I took eighteen courses, an unusually high number. I touched several areas within Applied Mathematics: from machine learning and reinforcement learning to distributionally robust optimization, to simulation and queuing theory, to discrete optimization. Grad school days were, in many ways, the best of my life: alongside a deep dive into developing modeling and algorithmic frameworks for network resilience decision-making against extreme events, I explored an enormous breadth of adjacent fields. When I finally started my job, I was eager to put all of it to use.

### A wide range of problems

My job responsibilities at BNSF did not disappoint me at all on that front. The railroad offered a wide spectrum of problems to work on, and even though I could not personally touch every one of them, I was fortunate to be surrounded by like-minded operations research and simulation experts who, collectively, covered nearly the entire range. I had the luxury of dropping by their desks, having long conversations about the approaches they were taking and the design choices behind them. I was consistently surprised by the level of detail the simulation models at BNSF captured: a team of three had developed a model that simulated the operations of an entire yard.

### Finding my own problems

What struck me most, though, was how different the process of finding a problem was compared to my previous jobs. In a typical company, there is a strong notion of product: the business decides what to build, product managers translate that decision into epics, features, and stories, and only once a project has been scoped with a detailed product roadmap does engineering or data science begin its work. At BNSF, the process ran in the opposite direction. We were expected, and often encouraged, to network across the company, ask people about the problems weighing on them, and develop our own prototypes before presenting them back. If there was sufficient interest, an idea would take off; otherwise, it might remain a small internal tool, or simply be set aside. We were handed high-level problem definitions at best, and given extreme flexibility to stretch those problems in whatever direction seemed promising. It felt, in many ways, like searching for a dissertation topic all over again. Just as my graduate advisor once introduced me to people when we had only a vague notion of what research direction to pursue, my manager did the same at BNSF, and together we spent hours turning those vague notions into use cases, ultimately exploring several different directions before converging on a few.

### Four early experiments

In my first six months, brainstorming led me down at least four distinct paths. The first one was about developing a quick tool that would tell how much it costs to re-route a train. The tool had real but very moderate usage limited to a small number of people. The second idea I pursued required implementing an idea from game theory: a Stackelberg game applied to a toll-pricing problem, for which I hand-derived the complementarity constraint equations myself. The model performed as expected, but the underlying computational complexity of the problem made the approach impossible to scale, and the lack of traction eventually meant the project never left the ground. A third effort, a stable matching algorithm meant to decide which trains should be combined into longer trains to save resources, still sits in a repository today. The fourth was a model for assignment and scheduling: it sat untouched for nine months before it caught the attention of senior management, and once it did, it took off in a way none of the others had. That algorithm is now deployed at one of the largest fueling terminals in North America, overseeing more than a billion dollars worth of fuel consumption, and it gave me the opportunity to present the work at academic conferences. The algorithm is now being scaled to serve several hubs and terminals.

### The train-to-track project

That fourth project, the train-to-track assignment problem at BNSF's largest fueling station, was my first real encounter with how operations research is practiced in industry, and it taught me things graduate school never had reason to. In this project, nobody cared much about the optimality gap. What mattered was automation that could replace the inconsistent, judgment-based assignments that humans had been making based on their hunch about what the right thing to do was. The model needed to produce decisions while accounting for a wide range of real-world constraints: the topology of the fueling terminal, the hierarchy of train importance, near-real-time adjustments as train arrival estimates changed, and a full schedule generated for the following day. Most interesting of all, and something I had never encountered in graduate school, was the requirement that every single assignment be perfectly explainable.

### Learning to sell the work

This was the first time I had to navigate a tradeoff in which scientific rigor was not the only guiding principle. I needed to earn early social capital. I needed to deliver something that worked within weeks. And I needed the output to be polished enough to catch the attention of a busy leader with little patience for unfinished work. So I did exactly that: after two months of essentially locking myself in my cubicle, disconnected from the rest of the company, I built a backtracking algorithm that elegantly did what it was supposed to do. I also learnt to lean on others for things I was not good at. Specifically, in this case, I found someone in the company who knew dashboarding well enough to make a Gantt Chart on Power BI for me, which we auto-refreshed with the most up-to-date recommendations. Wherever we wanted to sell our model, instead of explaining anything much, we would just show the dashboard and let them play with it. I learnt an important lesson here: nobody wants to listen, nobody wants to read, but everyone is happy to engage and play with tools. The more interactive the front-end of your model is, the more likely it is to get attention.

### An academic mindset in industry

While I picked up on some of the things that mattered more in industry than in academia, at heart, I approached problems just like an academic. Anything that offered an opportunity to build a cool algorithm from scratch, I would chase. Very soon, as you will read below, I realized how many other things needed to fall into place to get a model to production. I learnt the importance of stakeholder alignment, the importance of effective communication, the importance of building relationships, earning social capital with partners, and advocacy from senior-most leaders. These are factors that decide whether that cool model of mine will make it to production or not. I will soon get to specifics, but the short version is this: because I did not account for all these factors, it took ten months after the model was ready for it to catch the attention of a vice president, fourteen months after it was ready to finally make it into production, and fifteen months after it was ready before finance signed off, confirming that the model was making a measurable financial impact.

## <span style="color: var(--note-color);">Transition: from a mid-level to a senior engineer</span>

Interestingly, right around the mark where I ended year 1, a senior colleague of mine left BNSF. As a consequence, I was made the new owner of a project related to flat yard switching. In essence, this is a ginormous combinatorial optimization problem which cannot be thrown at any solver. Because this project had resources from other teams involved, I had to put my own project on the shelf for a while and devote myself entirely to picking this up. Now in this project, the part that excited me the most was already solved to some extent. There was enough evidence to prove that from a science perspective, the approach should work. However, the project was an ongoing effort for two years with no adoption at all. The code for a giant model was in really bad shape, barely had any comments, and was around 5k lines of core algorithm in one single file. No classes, no modules — it was a mess. However, it worked. What was uncertain was whether we could ever get adoption, and whether the model was doing what it was supposed to do on the ground. For this project, science was not the to-do part; it was done to some extent. The challenge was adoption and showing measurable impact. Business was convinced that if the model could be deployed and could do what needed to be done, we would become leaders in this domain and would probably be the first railroad to achieve this feat.

### Developing a business-first mindset

Soon after I became an L5, I was assigned to a new manager who helped me break several of my notions about what matters. Up until this point, I was quite obsessed with science and unknowingly assumed that I was speaking to fellow scientists. I would hedge everything with only if, given that, assuming that, as far as something holds true. What I learnt was that adding such nuances may work in academia, but in industry, it is more about the impression that gets created by what you are saying rather than what you are actually saying.

I learnt that the way I spoke gave the impression that things were more ready than they actually were. For me, having the science part of the problem cracked meant the problem was solved. For leaders, a solved problem means that the product is so ready and mature that it can immediately start delivering business value. I also learnt how big a journey it is from having just science cracked to having a mature product. A mature product requires having a lot of engineering around it. Are we triggering the right exceptions and sending back the right status codes? Do we have a sound logging infrastructure in place? Do we have proper data contracts established between APIs? Do we have a systematic regression testing pipeline in place, among many other things, like the UI being ready and doing what it should? Even beyond this are things like: do users have adequate tool training to start using the tool? Do we have a change management process in place? How will we measure adoption? How will we systematically track the business value being delivered? How do we put a process in place that identifies what is blocking adoption and which team should own the problem? Do we have a mechanism that systematically highlights tool usage, generates weekly reports for senior executives, and produces release notes for other development teams?

Below are additional things I keep an eye out for, in addition to the scientific aspects of the problem. Every single thing is what my managers taught me in a span of just 1-3 months.

#### 1. Dollar logic comes before code

The single most important shift in how I think: impact is not a story you tell after shipping. It is a precondition for starting. Before any feature gets prioritized, I seek a defensible dollar value attached to it. Not a vague business case, not a narrative about efficiency — an actual number, ideally one finance will stand behind. If I can't construct that logic upfront, I treat that as a signal the feature isn't ready to build yet, not that I need to work harder on selling it.

This changes how you prioritize. You stop building features because they're interesting or because a stakeholder asked for them. You build in order of expected dollar impact per unit of engineering effort, and you're honest about math.

#### 2. Adoption is a process problem, not a persuasion problem

The second big lesson, and the one that took longer to learn. I spent time in my first year trying to convince people that the model was good. That's the wrong frame. You don't win adoption by arguing for your solution. You win it by building a process where the comparison is unavoidable and measurable.

What that looks like in practice:

**Deploy first, measure second**: Don't wait for the model to be perfect. Ship it, then instrument it. The feedback you get from real usage is worth more than another month of offline evaluation.

**Make rejection actionable:** When a solution gets rejected on the ground, my reflex used to be frustration. Now I treat it as a data collection problem. A criticism with no counter-solution isn't measurable, so I build the process that forces the counter-solution to exist. When a field team can't execute the model's output, they submit their own solution on the same input. That gives you two plans on identical inputs — now you can compare them against the metrics you actually care about.

**Release on a cadence.** Bi-weekly releases with a real change-management process: tool training, feedback workshops, structured rollouts. Technical debt is only taken on when adoption is trending in the right direction.

The deeper principle: you don't compare performance instance-by-instance. You compare distributions. One bad example doesn't disprove the model. The question is whether the distribution of outcomes is shifting.

#### 3. Alignment is Phase Zero, not an afterthought

A project should not enter engineering until a few things are locked down:

- Business buy-in from the people who will actually use it
- Finance alignment that can vouch for impact and not "this seems valuable" but "if this metric moves, it hits our books"
- Committed leadership from every team the project's success depends on
- A measurement contract: what you'll track, how each metric ties to a business outcome, which team owns moving which number, and a baseline

Without this, you can ship technically impressive work and have it go nowhere. I know this because I have seen it happen. Two years of model development, zero percent adoption — the technical work was real, but the alignment infrastructure was missing.

Getting alignment right is harder than getting the model right. And it compounds. Every hour you spend in Phase Zero saves multiples downstream.

#### 4. Feedback is labeled data

This one reframed how I think about post-production.

Raw feedback from users is low signal. It's high volume, it's inconsistent, and it's hard to act on. But if you design your feedback-capture process correctly, every piece of feedback becomes a labeled example for back-testing.

The setup: when the model's solution can't be executed, the human completes the same task on the same input and submits their solution. Now you have a ground-truth label. You can run back-tests on it. You can measure whether, on average across that distribution, you're improving.

This is what separates a model that gets better over time from one that just accumulates complaints.

## <span style="color: var(--note-color);">If I have to summarize, my two years' worth of learning</span>

The through-line across all of this: optimize for leverage. Not for lines of code, not for model complexity, not for how technically interesting the problem is. For leverage — the decisions and systems that multiply the output of everyone around you. That's what two years in has taught me to care about.

