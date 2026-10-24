# Live Review and fix-round integration

Date: 2026-10-24. Base: `bootcamp-prototype` at `e5a53e8b9`.

The user authorized creating the sequential subtasks and starting implementation. The backend handoff is the supplied `pipeline-iteration-e2e-journey 1.md`, especially steps 5/10 and sections 19/20. Its examples and stated integration-test coverage are contract evidence, not authenticated deployment captures. The deployed build and end-to-end GitHub Actions behavior are not verified.

## Sequential delivery

| Order | Jira | Parent | Scope | Estimate (research / implementation / validation) | Depends on |
|---|---|---|---|---|---|
| R1 | [EPMRPP-122686](https://jiraeu.epam.com/browse/EPMRPP-122686) | EPMRPP-121677 | Native Library/detail AI data and read-only presentation | 24 h (4 / 14 / 6) | Supplied case response contract |
| R2 | [EPMRPP-122687](https://jiraeu.epam.com/browse/EPMRPP-122687) | EPMRPP-121681 | Live review comments and review state | 24 h (4 / 14 / 6) | R1 |
| R3 | [EPMRPP-122688](https://jiraeu.epam.com/browse/EPMRPP-122688) | EPMRPP-121682 | Live Approve and review conflict handling | 16 h (3 / 9 / 4) | R1, R2 |
| R4 | [EPMRPP-122689](https://jiraeu.epam.com/browse/EPMRPP-122689) | EPMRPP-121703 | Live Push to agent and fix-round state transitions | 28 h (5 / 16 / 7) | R1, R2, R3 |
| R5 | [EPMRPP-122690](https://jiraeu.epam.com/browse/EPMRPP-122690) | EPMRPP-121703 | Fix iteration provenance, refresh and comparison scope | 20 h (4 / 11 / 5) | R4 |
| R6 | [EPMRPP-122691](https://jiraeu.epam.com/browse/EPMRPP-122691) | EPMRPP-121703 | GitHub Actions fix-round journey verification | 12 h (3 / 4 / 5) | R1–R5, configured integration and agent workflow |

These are planned FE effort estimates, not actual delivered hours. Every new Jira subtask must have the matching Original Estimate and immediate research/implementation/validation comment. Each scope is below the 36 h limit.

## R1 — Native Library/detail AI data

- Add typed backend `origin`, `status`, `defaultVersionId` and documented `metrics` fields.
- Select a native read model when backend fields are present; keep legacy mock extensions separate. Native responses must take precedence over demo overlays.
- Display supported AI origin, Draft/Ready status, current score/obsolete state and current-version cost in the Library, detail and side-panel metadata.
- Do not manufacture iteration provenance, version history, previous scores, modified-by-agent status or cumulative cost.
- The supplied `metrics.criteria` examples are abbreviated. Full criterion-level rendering waits for an authoritative unabridged DTO; R1 displays the confirmed summary fields only.
- Native-backed cases must not activate provisional `/ai`, `/lifecycle`, `/review-comment`, `/fix-round`, automation or pipeline-provenance behavior. Those capabilities are enabled in later subtasks only when their contracts are integrated.
- Existing Add to Test Plan / Launch guards must read native Draft status for eligibility, including mixed and off-page bulk selections, without populating the legacy `lifecycle` command field.
- Preserve feature-flag-OFF behavior and legacy fixtures without native fields. Test native AI/manual cases, missing optional metrics, zero score/cost, native-versus-overlay precedence and absence of provisional calls/actions.

## R2 — Live review comments

- Integrate `GET .../review`, `POST .../review/comment`, own-comment deletion and unsent-comment discard.
- Adapt the response envelope and `NOT_SENT`, `targetType`, 1-based `stepNumber`, `SCENARIO_TEXT`, `authorId`, ISO dates, `roundNumber` and `agentReason`.
- Render live comments for native AI cases and use authoritative `unsentCount` / `fixInProgress` for state. Do not invent author names or permissions absent from the response.
- Verify edit/view permissions, comment targets, empty/error states, mutation conflicts and project/case navigation races.

## R3 — Live Approve

- Use `PATCH .../tms/test-case/{id}` with `status: READY` for supported single-case approval.
- Handle review conflict `409`, including error code `40915`, with refresh and useful localized feedback.
- Refresh case/review data after success. Do not silently implement batch behavior or obsolete-confirmation semantics absent from the new contract.
- Verify pending comments, active fixes, permissions, errors and flag-OFF behavior.

## R4 — Live Push to agent

- Use `POST .../review/fix-round` and the documented round/review reads. Adapt `id`, `roundNumber`, `PENDING`, `FIXED`, `FIXED_GRADE_FAILED`, `FAILED` and available workflow/provenance fields.
- Drive fixing locks from server state; poll only while needed, cancel on navigation, refresh comments and case after completion, and distinguish failed start from failed/expired round.
- Do not claim score-before/after, cumulative cost, change diff or `canPush` support when unavailable.
- Verify start rollback, duplicate push, timeout, failure and successful fix without a grade using contract fixtures; live CI verification belongs to R6.

## R5 — Fix iterations and scope

- Represent a fix round as its own iteration, using `rerunOf` and supplied fix-round attributes, without adding its cost to the original iteration.
- Refresh the original Review and navigate using real pipeline/iteration identities when available.
- Avoid presenting different-scope suite totals as a regression. Preserve existing generic comparison behavior for ordinary iterations.
- Keep absent provenance unavailable; verify different-scope, missing metadata, errors and stale responses.

## R6 — GitHub Actions journey verification

- Verify an enabled project `github-actions` integration with real repository/ref/workflow settings, and a source stage with matching `GITHUB_ACTIONS` execution metadata.
- Verify that the agent workflow accepts `test_case_id`, `fix_round_id`, `previous_iteration_id`, reads comments, reports a new iteration with `fixRoundId`, and reports the atomic result.
- Capture sanitized evidence for successful fix, failed dispatch, failed round and grade failure; record exact deployment/build and workflow run identities where available.
- Credentials and repository/workflow values are prerequisites, not values to guess. Do not include secrets in documentation or browser storage.
- Creating a generic integration does not implement the separate CI-settings UI story, general iteration Re-run or failed-stage Retry.

## Existing scopes and unresolved backend questions

- Continue generation-panel task [EPMRPP-122414](https://jiraeu.epam.com/browse/EPMRPP-122414) when `stageKey` is returned by LP2/LP3; it is still absent from the new response examples.
- Continue Auto-Ready settings task [EPMRPP-122415](https://jiraeu.epam.com/browse/EPMRPP-122415): the new handoff clarifies PATCH merge/null/range behavior, while concurrent edits and the accepted UI permission policy remain unresolved.
- Review queue/filter, version-history reads, previous-versus-current diff, cumulative version cost, `modifiedByAgent` and `canPush` remain contract gaps.
- Legacy Library quick filters and the folder review count still use the development overlay's mock database when that mode is enabled. Native read presentation does not integrate these filters: mock-backed filtering can omit native cases or classify them using a same-display-ID fixture. Verify R1 with those provisional filters cleared and the mock overlay disabled; authoritative native/iteration filter and count semantics remain with the existing Review/Library scope. R1 does not add undocumented backend filter parameters or a global capability registry.
- No general Re-run command or complete Retry command is specified in this handoff. Keep those controls unavailable pending their contracts.

## Execution evidence

All six Jira subtasks were created with Original Estimates and breakdown comments on 2026-10-24. R1 is implemented on `EPMRPP-122686-live-test-case-ai-data`; R2–R5 remain pending and R6 also awaits actual integration/workflow configuration. The user authorized commit, push and a PR into `bootcamp-prototype` on 2026-10-24. Delivery and exact-head CI status are tracked in the R1 Jira issue and PR; no deployment or manual workflow trigger is included.

R1 implements native DTO/read presentation, current-version score/model/cost, native-before-overlay precedence (including scenario-update responses), and guards unsupported provisional actions. The first code review found that removing legacy lifecycle data bypassed Draft eligibility checks; four behavior tests reproduced the regression before a host-local native-status fix. Both code and security rechecks report no remaining introduced findings.

Automated checks on 2026-10-24:

- Node 20 `npm run type-check`: PASS.
- Focused Jest before publication: 11 suites / 160 tests PASS, including adapter, overlay, Library, details, header/side panel, native summary, bulk/off-page selection, existing automation/Ready-only/lifecycle seams and the shared AI chip. Jest exited 0 and emitted an open-handles warning; no timeout or failed test occurred.
- Changed-file ESLint: 21 TS/TSX files, zero warnings, PASS.
- Changed-file Stylelint: three SCSS files, PASS (native summary, AI chip, details header).
- `git diff --check`: PASS.

The publication recheck also reviewed the shared AI chip tooltip wrapper/badge sizing and native header placement, with no actionable code-review findings. No authenticated runtime or visual browser check was performed for R1. Tests use explicit contract fixtures; they do not prove the deployed build, real project roles or real workflow execution. Full criterion-level metrics, native quick filters/counts, Review/Approve/Push, version history and cumulative version cost are not claimed integrated by R1. The delivery workflow is Code review after PR creation, then Testing after merge; R2 is the next implementation slice.
