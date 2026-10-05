# AI Factory · DF Bootcamp 2026 PoC — frontend workspace

This folder is the working memory of the frontend part of the PoC: it records what we build, why, in which
order, how far we are and what we still need from the backend. The UI is built on mocks that follow a proposed
API contract; a live Pipeline and Quality Standard API subset is documented but not yet integrated.

- Jira epic: [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192)
- Requirements (source of truth): [`reportportal-requirements/domains/projects/df_bootcamp_2026`](https://git.epam.com/EPM-RPP/reportportal-requirements/-/tree/main/domains/projects/df_bootcamp_2026)
- UX reference: `html_prototype/ai-factory-bootcamp-poc-prototype.html` in that repo (open it locally in a browser)

## Files

| File | What it is | Changes when |
|------|------------|--------------|
| [00-status.md](00-status.md) | **Status board**: current task, all tasks with status / Jira / PR, session log | every task / session |
| [01-knowledge-base.md](01-knowledge-base.md) | Requirements digest: glossary, decisions D1–D10, business rules, UI texts, demo data | requirements change |
| [02-stories-to-ui.md](02-stories-to-ui.md) | Story → FE scope → prototype screen → existing code to reuse → tasks | scope or code map changes |
| [03-frontend-architecture.md](03-frontend-architecture.md) | Folders, feature flag, mock layer, state, routing, permissions, atoms, tests | design decisions |
| [04-implementation-plan.md](04-implementation-plan.md) | Phases, tasks (T-ids) with size / deps / DoD, Jira mapping, demo-parity checklist | plan changes |
| [05-backend-contract.md](05-backend-contract.md) | Proposed API contract + **integration status board** per endpoint | contract agreed or changed, endpoint integrated |
| [06-open-questions.md](06-open-questions.md) | Questions (ORG / BA / BE / FE / DES) with defaults + decisions log | question raised or answered |
| [07-jira-workflow.md](07-jira-workflow.md) | Sub-task conventions, story → sub-task registry, helper script | sub-task created |
| [08-estimations.md](08-estimations.md) | **All estimations**: method, per-task senior-developer hours, phase roll-up, deviation notes, log | after every finished task |
| [10-backend-integration-contract.md](10-backend-integration-contract.md) | Actionable FE/BE integration gaps, decisions, security/readiness gates and acceptance criteria | API contract or integration decision changes |
| [11-backend-integration-contract-test-cases.md](11-backend-integration-contract-test-cases.md) | Risk-based QA cases and traceability for the backend integration contract and rollout groups G1–G9 | contract acceptance criteria, rollout decisions or coverage change |
| [tools/jira_fe_subtask.py](tools/jira_fe_subtask.py) | Creates the `[FE]` sub-task of a story (dry run by default) | — |

## How to resume work (humans and AI agents)

1. Read **00-status.md** (Now / next and the last session-log line).
2. Open the task in **04-implementation-plan.md**, then its stories in **02** and the rules in **01**.
3. Check **06** for questions affecting the task. Apply the default if the question is still open.
4. **Jira:** make sure the story has an `[FE]` sub-task ([07](07-jira-workflow.md)); create it if missing (dry run → confirm → `--yes`).
5. Work → DoD (04) → record the senior-developer hour estimate in **[08-estimations.md](08-estimations.md)**
   (the only place for estimates) → update **00-status** (status, Jira, PR, notes, session-log line),
   **05** (endpoint status), and **06** (new questions / decisions).

## Key principles (short)

- **Contract-first mocks** at the HTTP level (`axios-mock-adapter` on the global axios, passthrough for everything else), so switching to the
  real BE means turning a handler group off.
- **Backend rules live in the mock engine**, never in components (Auto-Ready, statuses, Draft on edit, Obsolete, costs).
- **Overlay existing TMS screens** with small flag-guarded injection points and reuse TMS and UI-kit components.
- **Feature toggle is mandatory.** Everything new is behind `localStorage.show_ai_factory_poc = 'true'` (default OFF).
  **Toggle OFF = the product behaves exactly as on `develop`**: no new UI, requests, rules or mocks (see the checklist in 03 §3).
  Mocks load only when the toggle is ON, in dev builds (`localStorage.ai_factory_mocks = 'false'` disables them).
- **Process:** branch per task from `bootcamp-prototype` → PR back into it; each `[FE]` Jira sub-task is capped at
  **36 h (≈ 5 SP)**, created when needed and assigned to Saveli_Savich@epam.com; run locally (`npm run dev`)
  against the remote backend.
- **Every finished task gets a senior-developer hour estimate** — how long a human senior FE dev would need for the
  delivered result — written **only** to [08-estimations.md](08-estimations.md) and rolled up per phase there.

## Scope cut list (if the demo date is tight)

Keep, in this order: Phase 0 → Pipelines list and details → Library badges, filters and evaluation → comments, Push and Approve → Ready-only gate.
Cut first: T4.2 (Test Plan page banner; not prototyped), T5.4 (Launch ↔ case links), T4.3 (Compare), then T5.x (automation).
