---
title: "Modeling shared laundry systems"
date: 2026-10-15
categories: [misc]
tags: [queueing-theory, simulation, operations-research]
excerpt: "Why does laundry take 3+ hours in a shared laundry room? A queueing model of my apartment's washers and dryers, and what capacity and pricing changes would actually help."
---

I hate doing laundry. Not the washing itself (the machines do that), but everything around it: lugging a basket downstairs to find every washer taken, trudging back up, trying again an hour later, and then discovering someone's finished load has been sitting in a washer for half the afternoon while the rest of us wait. For a long time, I was convinced my apartment simply didn't have enough washers and dryers. Eventually I got annoyed enough to check.

In this post, I model a shared laundry room as a queueing system: a two-station tandem network of washers and dryers, with multiple machines at each station. Using my own apartment complex as a case study, I show how to evaluate the performance of any such system, and how the same model can guide better design, both by choosing the right number of machines and by using pricing to make better use of the machines already there.

## Introduction

Laundry is an unavoidable part of life. More than 80 percent of the people I surveyed do it weekly or every two weeks, and the rest do it monthly. Some homes, especially single-family houses, have in-unit laundry, but a sizable share of people live in places where laundry is shared: college dorms, graduate housing, and many apartment complexes, particularly in big cities where space is tight. These places usually have a shared laundry room with several washers and dryers, which residents pay for per use with coins, a credit card, or a mobile app.

In communities made up mostly of students and working professionals, most residents prefer to do laundry on weekends because of the time it takes. With a free washer and dryer, a single load takes about 1 hour 15 minutes (30 minutes washing, 45 minutes drying). In a shared laundry room, though, the total time typically stretches to 2-5 hours, depending on how busy the room is and how it is configured. Most people do other chores in the meantime, but they still lose a 3-5 hour window they could have used otherwise. Your whole Saturday gets planned around a 45-minute dryer cycle. Some avoid this by staying up late or waking up early to dodge the weekend rush, which is a ridiculous thing for a grown adult to have to do just to get clean socks.

I see four reasons behind these delays:

1. **Frequent machine breakdowns**, which reduce capacity.
2. **Uneven demand**, with far more traffic on weekends than on weekdays.
3. **No real-time availability information.** Without an app showing which machines are free, people have to walk over and check repeatedly.
4. **No penalty for leaving clothes in the washer.** Forgotten loads block the washers for everyone else, and the bottleneck then spills over to the dryers. (If you are one of the people who starts a wash and then disappears for four hours: this one's for you.)

Together, these add up. A community of 100 people spends around 330 hours a week on laundry, and nearly 200 of those hours could be saved with adequate resources. Two hundred hours. Every week. That's five full-time jobs' worth of people standing around a laundry room, collectively, for no good reason.

A detailed optimization model of the real-world problem is hard to build. A simulation model, however, can still show roughly how much we stand to gain by addressing each of these issues, and that is what I set out to do.

## How are these systems designed today?

I could not find any research on this topic, so I asked a few practicing architects how these systems are typically sized. Their answer: standard design guidelines, such as this one from the Multi-Housing Laundry Association.

<img src="/assets/img/posts/modeling-shared-laundry-systems/guidelines.png" alt="Design guidelines by the Multi-Housing Laundry Association for the number of washers and dryers per number of apartment units" />

My argument is that following such guidelines without accounting for residents' laundry habits and machine failure rates can leave a laundry room badly over- or under-provisioned. Design decisions should instead account for the sources of uncertainty that, together, drive how well the system performs.

## The model

A shared laundry room can be modeled as a network of queues: specifically, two stations in tandem, washers followed by dryers, each with multiple machines.

- **Service times.** Washing and drying each take a fixed amount of time. For simplicity, I assume the machines run on a single setting.
- **Arrivals.** People arrive according to a non-homogeneous Poisson process, which captures the fact that students and working professionals tend to do laundry on weekends rather than weekdays.
- **Batches.** People can arrive with multiple loads and use multiple washers. The number of loads per person follows a discrete probability distribution.

Even though washing itself takes a fixed time, I model the washer's service time as random. The reason is that a finished load keeps occupying the washer until its owner comes back for it, whenever that is convenient. I treat this pickup delay as a random variable over a fixed set of values, with most of the probability in the first hour: more than 80 percent of the time, the owner empties the washer within an hour of the wash finishing.

Once the clothes come out of the washer, the load joins the drying queue. Dryers display their remaining time, so the person who just joined the queue can see both that time and how many loads are ahead of them. Since everyone wants to finish as soon as possible, I assume people behave rationally: they work out exactly when their turn will come and show up right then, so nobody behind them can jump the queue. This means the drying station behaves like a standard G/G/n₂ queue.

<img src="/assets/img/posts/modeling-shared-laundry-systems/schematic.png" alt="Schematic of the laundry system: non-homogeneous Poisson arrivals feed a washing station with n1 machines, which feeds a drying station with n2 machines" />

I look at two cases: one with unlimited waiting space in front of both stations, and one where that space is limited. With limited space, only so many loads can queue at each station. If the dryer queue is full, washed clothes stay in the washer and block it until the dryer queue clears.

The case study below shows how this model can answer questions like:

- How well does a given laundry system perform?
- Which configuration minimizes total laundry time?
- For a given configuration and queue capacity, how many people on average are turned away because the queue is full?
- Which pricing mechanisms can reduce average total laundry time for a given configuration?

## Case study: my apartment complex

I focus on minimizing the **average total laundry time**: the time from when a job arrives in the laundry room until its last load comes out of the dryer. The extreme solution would be a washer-dryer unit for every resident, but I assume that is not feasible.

### Performance of the system in place

My apartment complex has 3 working washers and 2 working dryers for roughly 100 residents. There are technically more machines, but the rest have been out of order for as long as I can remember, so they might as well be decorative. Queue capacity is limited: at most 3 washing loads can wait at once. If people see 3 loads already waiting, I assume they leave and come back another time (they *baulk*). The dryer queue, on the other hand, has no limit, because once clothes are washed, people would rather wait however long it takes than carry wet clothes back to their apartment.

The simulation setup:

- **Service times.** Washing takes 30 minutes and drying takes 45, both fixed.
- **Owner pickup time.** After the wash finishes, the owner has to come back, move the load to the dryer queue, and work out when their turn will come. This delay takes values in {0.25, 0.5, 1, 2, 4, 8, 16, 24} hours with probabilities {0.2, 0.4, 0.2, 0.1, 0.05, 0.025, 0.0125, 0.0125}, so more than 80 percent of loads are moved within an hour.
- **Population.** About 100 residents, mostly graduate students and working professionals, each doing laundry about once a week.
- **Week structure.** Since most UT classes run Monday to Thursday, the week has 4 weekdays and 3 weekend days (Friday to Sunday). 20 percent of residents do laundry on weekdays and 80 percent on weekends.
- **Arrival rates.** Within any day, arrivals are Poisson with a constant rate. With 20 people over 4 weekdays, λ₁ = 20 / (4 × 24) = 0.208 jobs/hour. With 80 people over 3 weekend days, λ₂ = 80 / (3 × 24) = 1.11 jobs/hour.
- **Batches.** 90 percent of people bring one load and 10 percent bring two (the occasional week with bed sheets, pillow covers, blankets, and so on).

With this setup, I want two distributions: the average total laundry time, and the average number of people who leave because the washer queue is full. I ran the simulation 100 times with different seeds, each run covering 52 weeks. We don't know the true distributions of total laundry time or baulking, but by the central limit theorem, the average of each over many jobs within a run is approximately normal. The histograms below show these averages across the 100 runs.

<div class="img-row">
<img src="/assets/img/posts/modeling-shared-laundry-systems/avg-total-time-histogram.png" alt="Histogram of average total laundry time across 100 simulation runs, centered around 3.3 hours" />
<img src="/assets/img/posts/modeling-shared-laundry-systems/avg-baulking-histogram.png" alt="Histogram of the average number of baulking jobs per week at the washer queue across 100 simulation runs" />
</div>

Both look normally distributed. Average total laundry time has a mean of **3.31 hours** and a sample standard deviation of **0.07**, which together with a confidence level α give interval estimates. The average number of baulking jobs has a mean of **9.05** per week and a standard deviation of **0.98**.

In other words, people spend **more than twice** the 1.25 hours their clothes actually need in the machines. And of the roughly 100 people doing laundry each week, about **10 percent** have to reschedule because the washer queue is full. So it wasn't just me being impatient: the numbers back up the grumbling.

### Optimizing the system

There are two main levers for reducing laundry time and baulking. One is adding capacity: more washers and dryers. The other is using existing capacity better through demand management, for example by charging more at peak times to shift some jobs to quieter periods, or by penalizing people who leave clothes in the washer too long. I look at each in turn.

#### Adding capacity

Let's start with a lower bound. Imagine every resident has two dedicated washer-dryer units. Nobody's laundry is then affected by anyone else, and the only remaining uncertainty is how long each person takes to move clothes from washer to dryer. There are no queue limits, since each unit has a single user, and the 10 percent of people with two loads can wash them in parallel (hence two units per person). The average total laundry time is then 1.25 + 1.55 = **2.80 hours**: 1.25 hours in the machines plus an average of 1.55 hours before the clothes are moved to the dryer. No amount of extra capacity in a shared system can beat this.

Next, I compared this bound against every combination of 1-10 washers and 1-10 dryers, keeping everything else in the simulation the same.

**Mean of the average total laundry time (hours).** Rows are washers, columns are dryers.

| W \ D | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | 9.13 | 9.18 | 9.23 | 9.20 | 9.18 | 9.09 | 9.08 | 9.26 | 9.18 | 9.16 |
| **2** | 4.90 | 4.48 | 4.44 | 4.47 | 4.46 | 4.49 | 4.40 | 4.44 | 4.48 | 4.44 |
| **3** | 4.22 | 3.31 | 3.25 | 3.32 | 3.28 | 3.25 | 3.29 | 3.24 | 3.31 | 3.27 |
| **4** | 4.16 | 2.97 | 2.93 | 2.92 | 2.92 | 2.91 | 2.94 | 2.96 | 2.95 | 2.91 |
| **5** | 4.38 | 2.89 | **2.83** | 2.82 | 2.83 | 2.82 | 2.79 | 2.85 | 2.82 | 2.83 |
| **6** | 4.34 | 2.87 | 2.81 | 2.81 | 2.78 | 2.80 | 2.78 | 2.81 | 2.80 | 2.81 |
| **7** | 4.34 | 2.87 | 2.83 | 2.82 | 2.81 | 2.80 | 2.81 | 2.78 | 2.80 | 2.80 |
| **8** | 4.32 | 2.87 | 2.82 | 2.80 | 2.81 | 2.81 | 2.77 | 2.81 | 2.80 | 2.79 |
| **9** | 4.33 | 2.90 | 2.81 | 2.81 | 2.79 | 2.81 | 2.81 | 2.81 | 2.83 | 2.80 |
| **10** | 4.35 | 2.85 | 2.80 | 2.80 | 2.81 | 2.78 | 2.81 | 2.81 | 2.79 | 2.81 |

**Mean of the average number of baulking jobs per week.** Rows are washers, columns are dryers.

| W \ D | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | 48.14 | 47.42 | 47.24 | 48.01 | 48.47 | 47.01 | 48.21 | 48.76 | 48.37 | 48.30 |
| **2** | 21.00 | 21.52 | 20.43 | 20.72 | 21.20 | 21.72 | 19.77 | 20.76 | 21.72 | 20.48 |
| **3** | 8.83 | 9.24 | 8.94 | 9.03 | 8.93 | 8.68 | 9.06 | 8.58 | 9.18 | 8.75 |
| **4** | 4.57 | 4.69 | 4.61 | 4.65 | 4.66 | 4.32 | 4.67 | 4.91 | 4.62 | 4.51 |
| **5** | 3.36 | 3.19 | **3.15** | 3.29 | 3.47 | 3.37 | 3.10 | 3.34 | 3.11 | 3.39 |
| **6** | 2.96 | 2.97 | 2.97 | 3.05 | 2.82 | 2.87 | 2.74 | 2.88 | 2.88 | 2.80 |
| **7** | 2.97 | 2.99 | 3.08 | 2.89 | 2.82 | 2.69 | 3.22 | 2.71 | 3.06 | 3.01 |
| **8** | 3.00 | 2.92 | 2.95 | 2.91 | 3.08 | 2.82 | 2.99 | 2.93 | 2.74 | 2.87 |
| **9** | 2.92 | 3.04 | 3.05 | 3.07 | 3.14 | 2.85 | 2.94 | 2.79 | 3.03 | 3.02 |
| **10** | 2.98 | 2.83 | 3.02 | 2.73 | 3.01 | 2.75 | 2.86 | 2.91 | 2.83 | 3.20 |

The standard deviations behind these means are small (mostly 0.02-0.10 hours for total laundry time once there are at least 3 washers), so the means are a reliable guide and can be turned into interval estimates at any confidence level α.

The tables show that **5 washers and 3 dryers essentially reach the lower bound** on average total laundry time, with about 3 percent of arrivals baulking. That's just two more washers and one more dryer than what we actually have. That's it. That's the whole fix. Adding machines beyond that brings no significant benefit. This is why I'd caution against relying on handbooks alone: if we know who the residents are, how they do laundry, and when, building that into capacity decisions pays off. Saving even 0.2 hours per person per week adds up across a community.

#### Using existing capacity better

The alternative to buying more machines is getting more out of the ones we have. There are two ways to do this here: smoothing demand with different prices for weekdays and weekends, and getting people to empty the washer promptly.

**Dynamic pricing.** Right now, 80 percent of residents do laundry on weekends and 20 percent on weekdays, at the same price. Suppose the operator charges more on weekends, just enough to make demand uniform across the week. The model tells us how much that reduces laundry time and baulking.

- **Current configuration (3 washers, 2 dryers).** Average total laundry time falls from 3.31 to 3.01 hours, nearly a **10 percent reduction**, and baulking falls from **9.05 to 1.86 jobs per week**. The lesson: when capacity is tight, smoothing demand keeps the machines from sitting idle on quiet days.
- **Proposed configuration (5 washers, 3 dryers).** With uniform demand, average total laundry time is 2.81 hours, surprisingly close to the uneven-demand case. In other words, 5 washers and 3 dryers already have enough slack to absorb the weekday/weekend imbalance. Baulking still falls, though, from **3.15 to 0.49 jobs per week**.

**Penalty for leaving clothes in the washer.** Here the operator charges a penalty if someone doesn't empty the washer within a set time after the wash finishes. People would then show up a few minutes before their wash is due to end, so washers never sit blocked. How strictly people comply depends on the penalty and their income, so the penalty effectively reshapes the distribution of pickup times. Modeling that properly would require data on residents' incomes. To keep things simple, I assume the penalty is high enough that everyone complies. The operator can then use the model to estimate total laundry time for different time limits.

Take the strictest case: owners must empty the washer the moment it finishes. With the current 3 washers and 2 dryers, average total laundry time drops to **1.37 hours** and baulking drops to **0.03** jobs per week. That is still slightly above the 1.25 hours of machine time; the extra 0.12 hours comes from randomness in when people arrive at the washers, which is also why baulking isn't exactly zero.

Combining the penalty with weekend pricing brings these down further, to **1.30 hours** and **0.003** baulking jobs per week.

## Conclusion

I proposed a stochastic queueing model for analyzing shared laundry systems and showed how it can support both capacity planning and pricing decisions that make better use of existing machines. A case study of my own apartment complex illustrates how these ideas work in practice.

The short version: my apartment really did have too few machines, and a handful of extra washers and dryers (or a penalty for abandoned loads) would give the whole building back a large chunk of its weekends. Until someone acts on that, I'll be down in the laundry room at 7 a.m. on a Saturday, as usual.
