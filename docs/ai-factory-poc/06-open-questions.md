# 06 · Open questions, gaps and decisions log

Each question has an ID, an owner group and a **default** that the FE proceeds with until it is answered.
When a question is answered, move it to the *Decisions log* (bottom) with the date and who decided.

Owner groups: **ORG** (team or organisation, asked to the FE lead), **BA** (requirements owner, Anatolii Fedosik),
**BE** (backend, Hleb / Vadim), **FE** (our own design decisions), **DES** (design).

## ORG: organisation and process

| ID | Question | Default until answered |
|----|----------|------------------------|
| Q-ORG-04b | Demo date? (Team size answered: one dev) | Plan ≈ 9–11 weeks; cut list in the README |
| Q-ORG-07 | Which remote project / folder may the mock seeding write real test cases into (the backend is shared)? | A dedicated demo project or folder `AI Factory demo`; ask before the first seed |
| ~~Q-ORG-05~~ | ~~Jira PAT returns 401~~ → **resolved 2026-09-25**: renewed in `service-ui/.env`; the script authenticates and creates sub-tasks | — |
| Q-ORG-06 | Does code review happen by the regular service-ui reviewers or inside the bootcamp team only? | Bootcamp team |

## BA: requirement gaps (to Anatolii)

| ID | Gap / ambiguity | Where | Default |
|----|-----------------|-------|---------|
| Q-BA-01 | Where do lifecycle **History** entries live? The prototype has a "History" section on the case page. The product already has a **History of actions** sub-route | US-007 | A new collapsible "History" (lifecycle) section in the details left column; the BE may also write activity (Q-FE-01) |
| Q-BA-02 | Can reviewers comment on the **Ready** case of a manual case? AC: comments are for AI cases only. Push works on Ready AI cases. Confirm that comments on Ready AI cases are allowed | US-011, US-012 | Allowed on AI cases in any lifecycle; manual → no comments |
| Q-BA-03 | Comment anchoring after an agent fix: steps are replaced. Addressed comments stay attached to step **position**? What if the agent removes or reorders steps? | US-011/012 | Addressed comments are kept by position; comments whose position no longer exists are shown under the Precondition as "on removed step N" |
| Q-BA-04 | Test Plan page "Launch blocked" banner is **not prototyped**: exact place, link format, and how Draft cases are marked in the plan list | US-014 | A `SystemMessage` above the plan content, listing the Draft case IDs as links; a Draft badge in the plan rows |
| Q-BA-05 | Manual Launch from the Test Plan page ("Add to Launch" of the whole plan) is also gated? | US-014 | Yes, blocked while the plan has Draft cases |
| Q-BA-06 | Bulk Approve of cases with an **Obsolete** evaluation: is a confirmation needed (single approve asks)? | US-008/013 | Bulk approves them and lists them as "approved with obsolete evaluation" in the result message |
| Q-BA-07 | Iteration **Failed** for automation: "at least one case failed". Does the Launch still get linked? Is the case status `FAILED`? | US-016/017 | Launch linked if created; case `FAILED` with stage + reason |
| Q-BA-08 | Colours of score bars: the prototype colours them by share (green / amber / red), and the AC forbids "traffic-light verdicts". Which one wins? | US-009 | Neutral single-colour bars (Q-FE-05) |
| Q-BA-09 | "Trigger" values for iterations (Web form · REQUIREMENT, Automate · Test Case Library, …): a closed list? | US-002 | Free string from the BE |
| Q-BA-10 | Environment list for Automate (beta5, qa, dev5): where does it come from? | US-015 | From the BE (A1), default `beta5` |
| Q-BA-11 | Library side panel for a Draft AI case has ⋯, Open Details, Add to Launch, Add to Test Plan and Approve (5 buttons). Is overflow into ⋯ acceptable at narrow widths? | US-008 | Keep 5; at < 400 px, move Add to Launch into ⋯ |
| Q-BA-12 | Priority names differ: the prototype uses Critical / Major / Medium / Minor, the product uses blocker / critical / high / medium / low / unspecified | prototype | Use the product priorities |

## BE: contract (to Hleb / Vadim), see [05](05-backend-contract.md)

| ID | Question | Default |
|----|----------|---------|
| Q-BE-01 | F8: are lifecycle / AI / evaluation / cost fields on the TestCase DTO, or on a separate `/ai` resource? | Summary fields on the DTO (C1) + details in `/ai` (C2) |
| Q-BE-02 | Namespace for the new resources (`tms/pipeline`, `tms/automation`, …) | As in 05 |
| Q-BE-03 | Filter parameter naming for `lifecycle` / `ai` / `iterationId` following the existing TMS convention | As in 05 C3 |
| Q-BE-04 | Stage metrics: numbers (FE formats) vs pre-formatted strings | Numbers |
| Q-BE-05 | Async notification of fix rounds / automation: polling OK for the PoC? | Polling 3 s / 5 s |
| Q-BE-06 | Is the "What the agent changed" snapshot stored by the BE (before / after scenario)? | Yes, `lastAgentChange` in C2 |
| Q-BE-07 | Do batch add-to-plan / add-to-launch return a `skipped` part for Draft cases? | FE pre-filters; the BE rejects |
| Q-BE-08 | Mapping from the automation `testCaseId` (string) → Library numeric id for Launch links | `tmsTestCase` on the test item (A3) |
| Q-BE-09 | F11: is the feature flag a server feature, a project attribute or nullable fields? | A localStorage toggle on the FE for now; only `featureFlag.ts` changes when the BE decides |
| Q-BE-10 | F15: how does "Project Manager and above" map onto the current roles (org MANAGER / project MEMBER + EDITOR / VIEWER / ADMIN)? | Settings: ADMIN + org MANAGER; review actions: same as `MANAGE_TEST_CASES` |

## FE: our own decisions (defaults applied, revisit if needed)

| ID | Decision | Rationale |
|----|----------|-----------|
| Q-FE-01 | Lifecycle History shown as a collapsible section in the details left column (from `lifecycleHistory` in C2) | Matches the prototype; no dependency on the activity service |
| Q-FE-02 | Pipeline settings as a **modal**, not a page | Simpler; reuses ui-kit Modal + Toggle + FieldNumber; no extra route |
| Q-FE-03 | Pipelines built from UI-kit and TMS components, following the prototype's structure (not Vitalii's pixel design) | Reuse the requirement; no Figma for PL-* in the repo (❓ DES) |
| Q-FE-04 | The Compare page computes deltas on the FE from two iteration DTOs | No extra endpoint |
| Q-FE-05 | Neutral colour for criterion bars (no red / amber / green) | AC "no traffic-light verdicts" |
| Q-FE-06 | Mock DB persisted in localStorage + Reset demo | Demo survives a reload |
| Q-FE-07 | A Launch for automation results in mock mode: a mock "Launch" record shown on the case / iteration only; the real Launches page integration is done when the BE and CI report real launches | Not worth faking the whole Launches module |
| Q-FE-08 | Pipelines sidebar item placed before Test Case Library | Prototype order |

## DES: design

| ID | Question | Default |
|----|----------|---------|
| Q-DES-01 | Figma for the Pipelines screens (Vitalii PL-01/02/05) and the new icons (Pipelines sidebar icon, AI chip, comment icon)? | Existing icon set + a simple inline SVG |
| Q-DES-02 | Dark theme support needed for the demo? | Use UI-kit tokens (works in both themes), no extra checks |

---

## Decisions log

| Date | ID | Decision | By |
|------|----|----------|----|
| 2026-09-23 | D1–D10 | Grooming decisions (see 01 §3) | grooming |
| 2026-09-25 | — | Plan v0.1 written; defaults above applied | FE |
| 2026-09-25 | FF | **Every new part is behind one feature toggle; toggle OFF = current functionality unchanged** (incl. existing button rules, requests, mocks). See 03 §3 | Saveli Savich |
| 2026-09-25 | Q-ORG-01 | Per-task branches from `bootcamp-prototype` (`EPMRPP-<subtask>-<desc>`), PRs back into `bootcamp-prototype` | Saveli Savich |
| 2026-09-25 | Q-ORG-02 | One `[FE]` sub-task per story, assignee Saveli_Savich@epam.com; Phase 0 goes under US-002 (EPMRPP-121704) | Saveli Savich |
| 2026-09-25 | Q-ORG-03 | Local only: `npm run dev` with the remote backend (`PROXY_PATH`) → mock mode A (overlay); mocks are never in production builds | Saveli Savich |
| 2026-09-25 | Q-ORG-04 | One FE developer (Saveli Savich); phases run sequentially | Saveli Savich |
| 2026-09-25 | — | Docs stay in `docs/ai-factory-poc/` on `bootcamp-prototype` | Saveli Savich |
| 2026-09-25 | Q-ORG-02b | `[FE]` sub-tasks are created **one at a time, when the story starts** (not in advance). First one: EPMRPP-121765 under US-002 | Saveli Savich |
| 2026-09-25 | EST | **After every task, record the hours a senior human FE developer would need** for the delivered result. All estimations live in **08-estimations.md** and nowhere else | Saveli Savich |
| 2026-09-25 | Q-ORG-05 | Jira PAT renewed; sub-task creation via the script works | Saveli Savich |
