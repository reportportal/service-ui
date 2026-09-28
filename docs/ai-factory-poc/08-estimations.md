# 08 · Estimations

> **All estimations live here. Nowhere else.** After finishing any task, add its estimate to this file
> and to nothing else. [00-status.md](00-status.md) tracks status only and links here.

## Method

An estimate answers one question: **how many hours would a senior frontend developer need,
working by hand, to produce the result that was actually delivered?** It is not the AI-assisted runtime.

| Rule | |
|------|---|
| Unit | Hours of focused work. 1 working day = 8 h |
| Level | Senior FE developer, familiar with React / Redux but new to this feature |
| Included | Reading the requirements and prototype, design decisions, implementation, tests, messages / i18n, self-review, fixing review comments |
| Excluded | Waiting for review, meetings, environment or token problems, blockers outside the task |
| Breakdown | Split into **analysis / implementation / tests + review** |
| When | Right after the task meets its DoD, before moving on |
| Planned sizes | S = 8 h · M = 20 h · L = 36 h (from [04](04-implementation-plan.md)) |

If an estimate differs from the planned size by more than ~30 %, write why in *Deviation notes*
and re-check the remaining sizes.

## Per-task estimates

Filled in as tasks complete. `—` = not done yet.

| ID | Task | Phase | Planned | **Actual (h)** | Analysis | Impl. | Tests+review | Date |
|----|------|-------|---------|----------------|----------|-------|--------------|------|
| T0.1 | Requirements digest + plan docs | 0 | — | **20** | 12 | 6 | 2 | 2026-09-25 |
| T0.2 | Feature toggle | 0 | S (8) | — | | | | |
| T0.3 | Types + format utils | 0 | S (8) | — | | | | |
| T0.4 | URL helpers | 0 | S (8) | — | | | | |
| T0.5 | Mock backend (adapter, DB, seed, engine, overlay) | 0 | L (36) | — | | | | |
| T0.6 | Shared atoms + usePolling | 0 | M (20) | — | | | | |
| T0.7 | Permissions helpers | 0 | S (8) | — | | | | |
| T1.1 | Routes + sidebar + pipelines controller | 1 | M (20) | — | | | | |
| T1.2 | Iterations list | 1 | L (36) | — | | | | |
| T1.3 | Iteration details + stage panels | 1 | L (36) | — | | | | |
| T2.1 | Lifecycle display + history + toast | 2 | M (20) | — | | | | |
| T2.2 | Library columns + AI chip + flags | 2 | M (20) | — | | | | |
| T2.3 | Quick filters + Review queue + iteration chip | 2 | M (20) | — | | | | |
| T2.4 | Side panel additions | 2 | M (20) | — | | | | |
| T2.5 | AI evaluation panel + rubric | 2 | M (20) | — | | | | |
| T2.6 | Generation cost + pipeline links | 2 | S (8) | — | | | | |
| T3.1 | Review comments + AI review strip | 3 | L (36) | — | | | | |
| T3.2 | Approve / Mark as ready (+ bulk, Edit Scenario) | 3 | M (20) | — | | | | |
| T3.3 | Push to agent + fix round states + diff modal | 3 | L (36) | — | | | | |
| T3.4 | Pipeline settings modal | 3 | S (8) | — | | | | |
| T4.1 | Ready-only gate + In plan · Launch blocked | 4 | M (20) | — | | | | |
| T4.2 | Test Plan page launch-blocked banner | 4 | M (20) | — | | | | |
| T4.3 | Compare iterations | 4 | M (20) | — | | | | |
| T5.1 | Automate action + Send to automation dialog | 5 | M (20) | — | | | | |
| T5.2 | Automation iteration progress | 5 | S (8) | — | | | | |
| T5.3 | Automation section on case | 5 | S (8) | — | | | | |
| T5.4 | Launch ↔ case links | 5 | M (20) | — | | | | |
| T6.1 | Roles / read-only states | 6 | S (8) | — | | | | |
| T6.2 | BE integration per endpoint group | 6 | S (8) ×N | — | | | | |
| T6.3 | i18n, a11y, responsive | 6 | S (8) | — | | | | |
| T6.4 | Demo rehearsal (parity checklist) | 6 | S (8) | — | | | | |
| T6.5 | Toggle-OFF regression pass | 6 | S (8) | — | | | | |

## Phase roll-up

`Planned` sums the sizes above. `Actual` sums the completed estimates. Update on every entry.

| Phase | Tasks | Planned (h) | Actual so far (h) | Done / total | Δ |
|-------|-------|-------------|-------------------|--------------|---|
| 0 · Foundation | T0.2–T0.7 (+T0.1 planning) | 88 (+20 planning) | 20 | 1 / 7 | — |
| 1 · Pipelines | T1.1–T1.3 | 92 | 0 | 0 / 3 | — |
| 2 · Library | T2.1–T2.6 | 108 | 0 | 0 / 6 | — |
| 3 · Review loop | T3.1–T3.4 | 100 | 0 | 0 / 4 | — |
| 4 · Gate & compare | T4.1–T4.3 | 60 | 0 | 0 / 3 | — |
| 5 · Automation | T5.1–T5.4 | 56 | 0 | 0 / 4 | — |
| 6 · Hardening | T6.1–T6.5 | 40 | 0 | 0 / 5 | — |
| **Total** | | **544 h + 20 h planning = 564 h** | **20** | 1 / 32 | — |

**564 h ≈ 70,5 working days ≈ 14 working weeks** for one developer at 8 h/day.
This prices every task at its nominal size, so it is the pessimistic end; the earlier
headline of 9–11 weeks assumed a faster pace on the small tasks. Re-check after phase 1 and,
if the trend holds, apply the scope cut list in the [README](README.md#scope-cut-list-if-the-demo-date-is-tight).

## Deviation notes

| Task | Planned | Actual | Why |
|------|---------|--------|-----|
| — | | | |

## Estimate log

Newest first. One line per estimate recorded.

| Date | Task | Hours | Note |
|------|------|-------|------|
| 2026-09-25 | T0.1 Requirements digest + plan docs | 20 | 12 h reading (epic, 5 features, 17 stories, prototype incl. its JS data model, 4 flows, scope review, TMS code map) · 6 h writing docs 00–07 · 2 h Jira helper + token debugging. No planned size: this task was created together with the plan |
