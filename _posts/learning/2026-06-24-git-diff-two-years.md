---
title: "git diff --two-years"
date: 2026-06-24
categories: [learning]
tags: [career, operations-research, industry-lessons, leadership]
excerpt: "Two years after leaving grad school for BNSF Railway: what I got wrong about which part of the job is hardest, and what actually moves a model from a repo to production."
---
June 3, 2026 marked two years since I finished grad school and joined BNSF Railway. Since then, I have been reflecting on the lessons I learnt over these two years, and while they still feel fresh, I am making an attempt to put them on paper. The idea is that through essays like this one, I can look back and see how my worldview evolves with time.

## <span style="color: var(--note-color);">From academia to industry</span>

I arrived at BNSF with the enthusiasm of someone who had spent years immersed in graduate coursework and research, and who had built an arsenal of analytical tools he felt ready to put to use. During grad school, I took eighteen courses, an unusually high number, spanning several areas of Applied Mathematics: machine learning and reinforcement learning, distributionally robust optimization, simulation and queuing theory, and discrete optimization. Grad school days were, in many ways, the best of my life: alongside a deep dive into developing modeling and algorithmic frameworks for network resilience decision making against extreme events, I explored an enormous breadth of adjacent fields. When I finally started my job, I was eager to put all of it to use.

### A wide range of problems

On that front, my work at BNSF did not disappoint me at all. The railroad offered a wide spectrum of problems, and even though I could not personally touch every one of them, I was fortunate to be surrounded by operations research and simulation experts who shared my interests and who, collectively, covered nearly the entire range. I had the luxury of dropping by their desks for long conversations about the approaches they were taking and the design choices behind them. I was consistently surprised by the level of detail the simulation models at BNSF captured: one team of three had developed a model that simulated the operations of an entire yard.

### Finding my own problems

What struck me most, though, was how different the process of finding a problem was compared to my previous jobs. In a typical company, there is a strong notion of product: the business decides what to build, product managers translate that decision into epics, features, and stories, and only once a project has been scoped with a detailed product roadmap does engineering or data science begin its work. At BNSF, the process ran in the opposite direction. We were expected, and often encouraged, to network across the company, ask people about the problems weighing on them, and develop our own prototypes before presenting them back. If there was sufficient interest, an idea would take off; otherwise, it might remain a small internal tool, or simply be set aside. We were handed high level problem definitions at best, and given extreme flexibility to stretch those problems in whatever direction seemed promising.

In many ways, it felt like searching for a dissertation topic all over again. Just as my graduate advisor once introduced me to people when we had only a vague notion of what research direction to pursue, my manager did the same at BNSF. Together, we spent hours turning those vague notions into use cases, exploring several different directions before converging on a few.

### Four early experiments

In my first six months, brainstorming led me down at least four distinct paths.

The first was a quick tool to estimate how much it costs to reroute a train. It saw real but very modest usage, limited to a small number of people.

The second applied an idea from game theory: a Stackelberg game for a toll pricing problem, for which I derived the complementarity constraint equations by hand. The model performed as expected, but the computational complexity of the underlying problem made the approach impossible to scale, and without traction, the project never got off the ground.

The third, a stable matching algorithm meant to decide which trains should be combined into longer trains to save resources, still sits in a repository today.

The fourth was a model for assignment and scheduling. It sat untouched for nine months before it caught the attention of senior management, and once it did, it took off in a way none of the others had. That algorithm is now deployed at one of the largest fueling terminals in North America, overseeing more than a billion dollars' worth of fuel consumption, and it gave me the opportunity to present the work at academic conferences. It is now being scaled to serve several hubs and terminals.

### What the train to track project taught me

That fourth project, the train to track assignment problem at BNSF's largest fueling station, was my first real encounter with how operations research is practiced in industry, and it taught me things graduate school never had reason to. In this project, nobody cared much about the optimality gap. What mattered was automation that could replace the inconsistent assignments humans had been making, based on judgment and their hunch about what the right thing to do was. The model needed to produce decisions while accounting for a wide range of real world constraints: the topology of the fueling terminal, the hierarchy of train importance, near real time adjustments as train arrival estimates changed, and a full schedule generated for the following day. Most interesting of all, and something I had never encountered in graduate school, was the requirement that every single assignment be perfectly explainable.

### Learning to sell the work

This was the first time I had to navigate a tradeoff in which scientific rigor was not the only guiding principle. I needed to earn social capital early. I needed to deliver something that worked within weeks. And I needed the output to be polished enough to catch the attention of a busy leader with little patience for unfinished work. So I did exactly that. After two months of essentially locking myself in my cubicle, disconnected from the rest of the company, I built a backtracking algorithm that elegantly did what it was supposed to do.

I also learnt to lean on others for things I was not good at. In this case, I found someone in the company who knew dashboarding well enough to build me a Gantt chart in Power BI, which we refreshed automatically with the most up to date recommendations. Wherever we wanted to sell the model, instead of explaining much, we would simply show the dashboard and let people play with it. This taught me an important lesson: nobody wants to listen, nobody wants to read, but everyone is happy to engage and play with tools. The more interactive the front end of your model, the more likely it is to get attention.

### Still an academic at heart

While I picked up on some of the things that mattered more in industry than in academia, at heart I still approached problems like an academic. Anything that offered an opportunity to build a cool algorithm from scratch, I would chase. Very soon, as you will read below, I realized how many other things needed to fall into place to get a model to production. I learnt the importance of stakeholder alignment, effective communication, building relationships, earning social capital with partners, and advocacy from the most senior leaders. These are the factors that decide whether that cool model of mine makes it to production or not.

I will get to specifics shortly, but the short version is this: because I did not account for all these factors, it took ten months after the model was ready for it to catch the attention of a vice president, fourteen months for it to finally make it into production, and fifteen months before finance signed off, confirming that the model was making a measurable financial impact.

## <span style="color: var(--note-color);">From mid level to senior engineer</span>

Interestingly, right around the end of my first year, a senior colleague of mine left BNSF, and I was made the new owner of a project related to flat yard switching. In essence, this is a ginormous combinatorial optimization problem that cannot simply be thrown at a solver. Because the project involved resources from other teams, I had to put my own project on the shelf for a while and devote myself entirely to picking this one up.

### Science solved, adoption missing

The part of this project that excited me most had already been solved to some extent. There was enough evidence to show that, from a science perspective, the approach should work. However, the project had been an ongoing effort for two years with no adoption at all. The code was in really bad shape: around 5,000 lines of core algorithm in one single file, barely commented, with no classes and no modules. It was a mess. But it worked.

What remained uncertain was whether we could ever get adoption, and whether the model was doing what it was supposed to do on the ground. For this project, the science was not the open item; it was largely done. The challenge was adoption and showing measurable impact. The business was convinced that if the model could be deployed and do what needed to be done, we would become leaders in this domain and would probably be the first railroad to achieve this feat.

### Learning to think business first

Soon after I became an L5, I was assigned to a new manager who helped me break several of my notions about what matters. Up until this point, I was quite obsessed with science and had unknowingly assumed that I was speaking to fellow scientists. I would hedge everything with "only if," "given that," "assuming that," and "as far as this holds true." What I learnt was that adding such nuances may work in academia, but in industry, it is more about the impression that gets created by what you are saying rather than what you are actually saying.

I learnt that the way I spoke gave the impression that things were more ready than they actually were. For me, cracking the science part of the problem meant the problem was solved. For leaders, a solved problem means the product is so ready and mature that it can immediately start delivering business value. I also learnt how long the journey is from cracked science to a mature product, and how much engineering a mature product needs around it.

On the engineering side:

- Are we triggering the right exceptions and sending back the right status codes?
- Do we have sound logging infrastructure in place?
- Do we have proper data contracts established between APIs?
- Do we have a systematic regression testing pipeline in place?
- Is the UI ready and doing what it should?

And even beyond engineering:

- Do users have adequate training to start using the tool?
- Do we have a change management process in place?
- How will we measure adoption?
- How will we systematically track the business value being delivered?
- What process identifies what is blocking adoption, and which team should own each problem?
- Do we have a mechanism that systematically highlights tool usage, generates weekly reports for senior executives, and produces release notes for other development teams?

### Four lessons my managers taught me

Below are the things I keep an eye out for, in addition to the scientific aspects of the problem. Every single one of them is something my managers taught me in a span of just one to three months.

#### 1. Dollar logic comes before code

The single most important shift in how I think is this: impact is not a story you tell after shipping. It is a precondition for starting. Before any feature gets prioritized, I look for a defensible dollar value attached to it. Not a vague business case, not a narrative about efficiency, but an actual number, ideally one finance will stand behind. If I cannot construct that logic upfront, I treat it as a signal that the feature is not ready to be built yet, not as a sign that I need to work harder on selling it.

This changes how you prioritize. You stop building features because they are interesting or because a stakeholder asked for them. You build in order of expected dollar impact per unit of engineering effort, and you are honest about the math.

#### 2. Adoption is a process problem, not a persuasion problem

This was the second big lesson, and the one that took longer to learn. In my first year, I spent time trying to convince people that the model was good. That is the wrong frame. You do not win adoption by arguing for your solution. You win it by building a process in which the comparison is unavoidable and measurable.

In practice, that looks like this:

- **Deploy first, measure second.** Do not wait for the model to be perfect. Ship it, then instrument it. The feedback you get from real usage is worth more than another month of offline evaluation.
- **Make rejection actionable.** When a solution gets rejected on the ground, my reflex used to be frustration. Now I treat it as a data collection problem. A criticism with no counter solution is not measurable, so I build the process that forces the counter solution to exist. When a field team cannot execute the model's output, they submit their own solution on the same input. That gives you two plans on identical inputs, and now you can compare them against the metrics you actually care about.
- **Release on a cadence.** Biweekly releases backed by a real change management process: tool training, feedback workshops, and structured rollouts. Technical debt is taken on only when adoption is trending in the right direction.

The deeper principle: you do not compare performance instance by instance. You compare distributions. One bad example does not disprove the model. The question is whether the distribution of outcomes is shifting.

#### 3. Alignment is phase zero, not an afterthought

A project should not enter engineering until a few things are locked down:

- Business buy in from the people who will actually use it.
- Finance alignment that can vouch for impact, not with "this seems valuable" but with "if this metric moves, it hits our books."
- Committed leadership from every team the project's success depends on.
- A measurement contract: what you will track, how each metric ties to a business outcome, which team owns moving which number, and a baseline.

Without this, you can ship technically impressive work and watch it go nowhere. I know this because I have seen it happen with the flat yard switching project I inherited: two years of model development, zero percent adoption. The technical work was real, but the alignment infrastructure was missing.

Getting alignment right is harder than getting the model right, and it compounds. Every hour you spend in phase zero saves multiples downstream.

#### 4. Feedback is labeled data

This one reframed how I think about what happens after a model reaches production.

Raw feedback from users is low signal: it is high volume, inconsistent, and hard to act on. But if you design your feedback capture process correctly, every piece of feedback becomes a labeled example for backtesting.

The setup: when the model's solution cannot be executed, the human completes the same task on the same input and submits their solution. Now you have a ground truth label. You can run backtests on it, and you can measure whether, on average across that distribution, you are improving.

This is what separates a model that gets better over time from one that just accumulates complaints.

## <span style="color: var(--note-color);">Two years, summarized</span>

The common thread across all of this: optimize for leverage. Not for lines of code, not for model complexity, not for how technically interesting the problem is, but for leverage: the decisions and systems that multiply the output of everyone around you. That is what two years in has taught me to care about.
