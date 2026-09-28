# 01 · Knowledge base — AI Factory · DF Bootcamp 2026 PoC

> Local digest of the requirements so that work can continue without re-reading the whole
> requirements repo. **Requirements win**: if this file and the source disagree, the source
> is right. Update this file and log the change in [06-open-questions.md](06-open-questions.md).

| Item | Value |
|------|-------|
| Source of truth | `EPM-RPP/reportportal-requirements` → [`domains/projects/df_bootcamp_2026`](https://git.epam.com/EPM-RPP/reportportal-requirements/-/tree/main/domains/projects/df_bootcamp_2026) |
| Snapshot used | `main`, 2026-09-23 (epic v0.4, features/stories v0.1–0.2) |
| Jira epic | [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192) — bootcamp PoC, **not** product release 26.1 |
| Requirements owner | Anatolii Fedosik |
| UX reference | `html_prototype/ai-factory-bootcamp-poc-prototype.html` (single file, mock data, walkthrough of 18 steps) |
| Flows | `html_prototype/flows/A…D.mermaid` (global, review in Library, fix round, pipelines owner) |
| Scope review | `html_prototype/scope-review-2026-09-23.md` (31 fixed inconsistencies, coverage matrix) |

---

## 1. What the PoC is

Requirement → AI Factory **generation iteration** (Create → Grade → Upload → Review) →
cases land in the **Test Case Library as Draft** → human **review in the Library** (step
comments → Push to agent → fix → re-grade) → **Ready** (Approve or Auto-Ready) →
**Ready-only** Test Plan / Launch → **Automate** → **automation iteration**
(Prepare → Develop → Review → Fix) → Launch result shown on the Test Case.

Two factories exist in GitLab CI today (`rp-tests` for generation, `rp-ui-autotests` for
automation). They do **not** report to ReportPortal yet. There is **no backend** for any of
this in ReportPortal yet → the UI is built on mocks first.

## 2. Glossary

| Term | Meaning | UI wording |
|------|---------|------------|
| Pipeline | A factory flow reported to RP: **Test case generation** (`EPM-RPP/rp-tests`) or **Test automation** (`EPM-RPP/rp-ui-autotests`) | "Test case generation", "Test automation" |
| Iteration | One run of a pipeline, numbered per pipeline. **Never called a Launch** | `<pipeline> · Iteration #N` |
| Stage | Step of an iteration. Generation: Create, Grade, Upload, Review. Automation: Prepare, Develop, Review, Fix | stage cards / chips |
| Fix round | One Push to agent on one case: Fix → Grade → update. Recorded in the Review stage of the iteration **that created the case**. Numbered **per case** (first push of a case = Fix round 1) | "Fix round K" |
| Evaluation | Copy of the grader's 100-point result on the case (6 criteria + total). States **Evaluated** / **Obsolete** | "AI evaluation", `★ N` |
| AI marker | The case was generated, graded or modified by an agent | chip **AI** next to the ID |
| Review comments | Comments for the agent on precondition / steps (Steps template) or precondition / Instructions+Expected block (Text template). Unsent comments block Approve and Auto-Ready | "Review comments · N not sent" |
| Auto-Ready | Per-pipeline setting: evaluated AI Draft case with total ≥ threshold becomes Ready | "Auto-Ready ON ≥ 90" |
| Generation cost | ≈ case's share of the iteration (Create+Grade+Upload ÷ N cases) + its own fix rounds. $ supplied by the pipeline | `≈ $0.32` |
| Lifecycle | Exactly **DRAFT** or **READY** for every Library case (AI or manual) | badge DRAFT / READY |

## 3. Grooming decisions (2026-09-23) — do not re-litigate

| # | Decision |
|---|----------|
| D1 | Human review happens **only in the Test Case Library**. GitLab MR is not a review gate. |
| D2 | Cases are uploaded to the Library right after generation + grading (no MR wait). |
| D3 | One pipeline run = one iteration. PoC: one requirement → one suite → N cases. |
| D4 | Generation stages shown: Create → Grade → Upload → Review. Self-review/self-fix hidden. Review fix rounds started by **Push to agent** (Fix → Grade → update). |
| D5 | Grade is **evaluation only**: never blocks, only scores (no PASS/FAIL). Scenario edit → **Obsolete**. |
| D6 | Case cost ≈ iteration cost ÷ N (+ own fix rounds), labelled approximate. $ from pipeline. |
| D7 | New cases = Draft. Auto-Ready per pipeline. Pre-existing cases → Ready (migration). Only steps / expected results / preconditions change (or agent fix) returns a case to Draft. |
| D8 | Push to agent → RP starts the fix job → case updated in Library → Auto-Ready may promote again. Works on Draft **and** Ready. |
| D9 | Automation in scope: **Automate** in the Library → automation pipeline → Launch linked to iteration and case. |
| D10 | Test Plan and Launch accept **only Ready**. **Compare** two iterations is in scope. |

## 4. Business rules the UI must enforce / display

> All of these rules apply **only while the AI Factory feature toggle is ON**. With it OFF, the
> product keeps its current behaviour: for example, Add to Launch stays enabled for every case. See
> [03 §3](03-frontend-architecture.md#3-feature-toggle-mandatory-for-every-change).

### 4.1 Lifecycle (US-007)
- Values: `DRAFT` | `READY`. No other states.
- New case from any origin (Create, CSV Import, Duplicate, factory upload) → `DRAFT`.
- Existing cases at feature switch-on → `READY` (BE migration; UI just shows it).
- Draft → Ready: **Approve** (AI case), **Mark as ready** (manual case), **Auto-Ready**, or the
  "…along with these changes" checkbox in Edit Scenario.
- Ready → Draft: user changes **steps / expected results / preconditions**, or an agent fix.
  Toast: "Scenario changed — status set to Draft".
- NOT lifecycle-changing: name, priority, tags, attachments, description, folder,
  execution time, requirements. A new evaluation alone never changes lifecycle.
- History reasons: Created, Uploaded by Iteration #N, Migrated, Approved, Marked as ready,
  Approved along with changes, Marked as ready along with changes, Auto-Ready (S ≥ T),
  Scenario changed, Agent fix · Fix round K. Each entry: from → to, reason, who, when.

### 4.2 Approve / Mark as ready (US-013)
- AI Draft: **Approve**. Disabled when unsent comments exist ("Push or discard the review
  comments first") or a fix runs ("Agent is fixing this Test Case").
- Manual Draft: **Mark as ready** (no comment/fix blocks — manual cases have no comments).
- Evaluation Obsolete → confirm "The evaluation is obsolete. Approve anyway?".
- Placement: Test Case page header, right of ⋯ / Edit Scenario / Add to Launch / Add to
  Test Plan (primary); Library side panel footer (primary). Only for Draft. For Ready the
  header/footer stay as today (Add to Test Plan primary).
- Edit Scenario modal (Draft only): checkbox **Approve along with these changes** /
  **Mark as ready along with these changes**; hint that editing the scenario returns a Ready
  case to Draft and makes the evaluation obsolete.
- Bulk Approve: all selected Draft cases without unsent comments / running fix → Ready
  (AI → "Approved", manual → "Marked as ready"); skipped ones named in a message.
- Proposed roles: Editor+ (F15, open).

### 4.3 Ready-only gate (US-014)
- Add to Test Plan on Draft → disabled, "Only Ready Test Cases can be added to a Test Plan".
- Add to Launch on Draft → disabled, "Only Ready Test Cases can be added to a Launch".
- Applies to: Test Case page header, side panel footer, bulk actions (bulk adds Ready, reports
  Draft as skipped).
- Planned case that returns to Draft **stays in the plan**; plan Launch disabled;
  plan page banner "Launch blocked: N Draft Test Cases" with links (not prototyped);
  case page + side panel banner **In plan · Launch blocked** with plan name.
- AI marker / score / Auto-Ready never bypass the gate.

### 4.4 Auto-Ready (US-005)
- Pipeline setting (generation pipeline only): toggle + threshold (whole number 0–100,
  default 90; default ON is a proposal, F14). Automation pipeline has no settings.
- Runs after upload and after a fix round re-grade. Promotes when: ON, AI case, Draft,
  evaluation Evaluated (not Obsolete), total ≥ threshold, no unsent comments, no fix running.
- Never demotes; changing the setting does not re-evaluate existing cases.
- Validation: "Threshold must be a whole number from 0 to 100".
- Editable by Project Manager+ (proposal, F15); others read-only; change recorded in activity.
- History: "Draft → Ready · Auto-Ready (S ≥ T)", actor **Auto-Ready**.
- **This logic runs on the backend.** UI only shows results; mocks simulate it.

### 4.5 Evaluation (US-009)
- 6 criteria, fixed order and max: Atomicity /15, Clear steps /20, Clear expected results /20,
  No invented logic /20, No invented UI /15, Coherence /10. Total /100.
  Keys (grader): `atomicity`, `clear_steps`, `expected_results`, `no_invented_logic`,
  `no_invented_ui`, `coherence`.
- Below max ⇒ ≥ 1 failure reason (expandable); at max ⇒ nothing to expand.
- No PASS/FAIL, no traffic-light verdicts (bars show share only).
- Evaluated line: "Evaluated · Iteration #N · <date>" or "… · Fix round K · <date>".
- Obsolete: gray score + "Obsolete — scenario changed after evaluation". Not used by Auto-Ready.
- Help icon → rubric description (not configurable in RP).

### 4.6 Cost (US-010)
- AI cases only. `≈ $X.XX`, note "Approximate: share of iteration cost".
- Breakdown: "Iteration #N share" = (Create+Grade+Upload) ÷ N cases; "Fix round K" = exact.
- Tokens: input, cache read, cache write, output; model. Estimates from the pipeline.
- Pipeline section: links to source iteration (opens Grade stage) and each fix round (opens
  Review stage).

### 4.7 Review comments (US-011)
- AI cases only. Steps template: comment icon on Precondition row + every step row.
  Text template: Precondition block + Instructions/Expected Result block.
- Icon shows count: orange when some unsent, gray when all addressed. Click → thread under the
  row: author, time, state (not sent / sent · agent fixing / Addressed · Fix round K), input + Add.
- All targets form one pending set per case.
- **AI review strip** above Requirements: lifecycle, "Review comments · N not sent",
  **Discard comments** (only N > 0, with confirmation), **Push to agent · N** (disabled with
  "Add at least one review comment" when N = 0).
- Author can delete own unsent comment; others' comments only via Discard.
- Comments don't change lifecycle.

### 4.8 Push to agent / fix round (US-012)
- Available on AI case (Draft or Ready) with ≥ 1 unsent comment. Proposed Editor+.
- Job start failure → error, no round recorded, comments stay "not sent".
- While running: "Agent is fixing… · Fix round K", comments read-only, Approve / Push /
  Edit Scenario disabled, Auto-Ready paused.
- Success: same case id; scenario replaced; lifecycle → Draft (even if Ready); AI marker
  "modified by agent"; new evaluation Evaluated; comments "Addressed · Fix round K";
  fix cost added; then Auto-Ready runs.
- **What the agent changed**: before/after steps side by side + score before → after;
  available until the next fix round.
- Fix OK but re-grade failed: case updated, Draft, comments Addressed, previous evaluation →
  Obsolete, no Auto-Ready, round result "Fixed · Grade failed".
- Fix failed (error/timeout): case unchanged; comments back to "not sent"; message offers
  Push again / Discard; failed round shown in Review stage.
- **Async by nature** → UI needs polling (or push) for the fix-round status.

### 4.9 Automation (US-015/016/017)
- **Automate**: Test Case page ⋯ menu, button in card's Automation section, Library bulk.
  Ready only ("Only Ready Test Cases can be automated").
- **Send to automation** dialog: lists cases; skips Draft, already-in-progress, fix-running
  ("Agent is fixing this Test Case") with names; environment (default `beta5`); "Already
  automated: <ids>. Automate again?"; **Send**; start error shown in dialog.
- One automation iteration per Send. Case shows "Automation · In progress · Iteration #N".
- Automation section: Not automated / In progress / Automated / Failed; last result
  (Passed/Failed + defect type); links to Launch and iteration; "Scenario changed after
  automation" note.
- Launch: attribute `pipeline:<iteration>`, link in iteration header; each test item links
  back to its Library case.

### 4.10 Pipelines (US-002/003/004)
- Left sidebar entry **Pipelines**. Groups per pipeline (collapsible), iterations newest first.
- Group header: repo, # iterations, "Auto-Ready ON ≥ 90" (generation).
- Iteration card: status badge RUNNING / IN REVIEW / COMPLETED / FAILED; title; outcome line
  ("2 of 4 Ready · 1 fix round"; automation "2 of 2 implemented · Launch #12"); meta
  (Requirement or TC ids, Trigger, Model, Test Cases, Suite score, Cost, Started · Duration);
  stage chips with dot + metric; attribute chips (`env:`, `spec:`, `jira:`, `ci:`, `mr:`).
- Search (requirement / iteration # / pipeline name), **Refresh**, **Compare iterations**,
  **Pipeline settings**. "No iterations match". Empty: "No pipeline iterations yet" + hint.
- No Pipeline / Automation / Manual tabs; never call an iteration a Launch.
- Iteration status derivation (BE computes; mocks mimic): Running (a stage runs),
  In review (Upload passed and ≥ 1 case Draft), Completed (all cases Ready), Failed (Create
  or Upload failed; a failed Grade does not fail the iteration). Automation: Running /
  Completed / Failed.
- Details: header (meta, chips, KPIs: Test Cases, Suite score, Auto-Ready promoted, Ready now,
  Fix rounds, Cost), actions Compare with previous / Pipeline settings; status banner (In
  review → "N Draft Test Cases wait for review…" + **Open review queue**); stage cards
  (default Grade; automation default Develop); stage panels (Create / Grade / Upload / Review
  with fix-rounds table; automation per-case table); token usage per model; no generic "go to
  Library" button.
- Compare: Pipeline select → Baseline / Candidate of that pipeline (reset to two latest on
  change); stage row (baseline above, candidate below, cost b → c); metrics table with Δ
  (green better / red worse; score higher better, cost/duration lower better); note
  "Different requirements — compare trends, not individual cases".

### 4.11 Library list (US-008)
- AI chip next to ID (tooltip "Generated by Iteration #N" / "… · modified by agent").
- New columns before Last execution: **Status** (badge) and **AI quality** (`★ N` or gray
  "obsolete", `≈ $0.32`, `Iteration #N ↗`, "—" when no evaluation).
- Quick filters next to "All test cases" title: Status All/Draft/Ready × AI All/AI/No AI (AND);
  preset **Review queue · N** (= Draft AND AI); removable chip **Iteration #N** (deep link from
  iteration); Clear. Filters in URL. Empty: "No Test Cases match these filters".
- Row flags under name: "N comment(s) not sent", "agent fixing".
- Bulk: "N selected", Clear selection, Approve, Add to Launch, Add to Test Plan, Automate.
- Side panel additions: Status badge + AI chip + `★ N` + "N comment(s) not sent" under ID /
  Created; Draft hint; **AI evaluation** section after Tags (bars, cost, iteration link);
  scenario per template; footer ⋯, Open Details, Add to Launch, Add to Test Plan (disabled for
  Draft with tooltip), primary **Approve** / **Mark as ready**. Check width 360 px (5 buttons).

## 5. Open asks from the requirements (owner in brackets)

| ID | Item | FE impact |
|----|------|-----------|
| F8 | TMS API: lifecycle, AI marker, evaluation, cost, factory key; update of an uploaded case (Hleb / Vadim) | All Library DTO extensions are **assumed** → see [05-backend-contract.md](05-backend-contract.md) |
| F11 | Hide AI Factory UI for projects without the factory (feature flag vs nullable fields) (Hleb / Sergey) | FE builds behind a feature flag + renders nothing when fields are null |
| F12 | RP → GitLab job trigger (fix, automation) + CI → RP transport (Vadim) | FE only calls RP endpoints (`push`, `automate`); async status via polling |
| F13 | Library source adapter / Library id for `rp-ui-autotests` (Vadim) | None directly |
| F14 | Auto-Ready default ON for new pipeline (Anatolii / Teodor) | Settings form default |
| F15 | Roles: approve / push Editor+, Pipeline settings PM+ (Anatolii) | Permission helpers, read-only UI |
| F16 | Automation MR stays a GitLab code review (Anatolii / Vadim) | None |

## 6. Outside MVP (don't build)
Batch requirements in several formats; model pricing in RP settings; re-grade without fix;
golden set / multi-grader; TC versioning / full diff history (only last agent fix diff);
validation rules / decisions inbox / gate overrides (Vitalii MD-*, NAV-*, VR-*);
Test Plan page redesign (only the Launch-blocked banner); replies / editing comments /
notifications; comments on attachments; launching a plan excluding Drafts; tabs Pipeline /
Automation / Manual runs.

## 7. Demo data worth keeping in mocks (mirrors the prototype)

| Case | Why |
|------|-----|
| TC101, TC102 | AI, Ready by Auto-Ready (94, 91), automated in Test automation · Iteration #1, Launch #12 passed |
| TC103 | AI Draft, modified by agent, fix round 1 (72 → 88, $0.22), cost ≈ $0.54 |
| TC104 | AI Draft, **Text** template, score 58 |
| TC105 | AI Ready (93), in plan "TMS regression · Sprint 42", good candidate for Automate |
| TC106 | AI Draft (81), 1 unsent comment on step 3; Push → 92 → Auto-Ready (success path) |
| TC107 | AI Draft (66); first Push fails with "job timeout" (failure path) |
| TC108 | AI Draft after a scenario edit, evaluation **Obsolete**, in plan → **In plan · Launch blocked** |
| TC1, TC4 | Manual, Ready by migration (Text / Steps) |
| TC52 | Manual Draft → **Mark as ready** |
| Iterations | gen #1 (US-TMS-MIG-001, suite 79, $1.27 + fix), gen #2 (US-TMS-BLK-001, suite 83), gen #3 running (Grade running), auto #1 (TC101, TC102, MR !212, Launch L-12) |
