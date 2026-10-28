# Live Review and fix-round integration

**Completion handoff updated 2026-10-25:** [27](27-backend-integration-completion-contract-2026-10-25.md) is the current Backend request list and scope/evidence reconciliation; the dated implementation and runtime evidence below is preserved.

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

Started 2026-10-24 on `EPMRPP-122687-live-review-comments`, stacked on R1 commit `7bb96619a` while PR #5845 is in review. The user authorized R2 commit, push and PR creation on 2026-10-24. The dependent PR temporarily targets `EPMRPP-122686-live-test-case-ai-data` to show only R2 changes; after R1 merges, retarget it to `bootcamp-prototype`. Delivery and CI evidence are tracked in the R2 Jira issue and PR.

- Integrate `GET .../review`, `POST .../review/comment`, own-comment deletion and unsent-comment discard.
- Adapt the response envelope and `NOT_SENT`, `targetType`, 1-based `stepNumber`, `SCENARIO_TEXT`, `authorId`, ISO dates, `roundNumber` and `agentReason`.
- Render live comments for native AI cases and use authoritative `unsentCount` / `fixInProgress` for state. Do not invent author names or permissions absent from the response.
- Verify edit/view permissions, comment targets, empty/error states, mutation conflicts and project/case navigation races.
- Use the numeric current-user ID for author ownership, and a localized user-ID fallback when no author name is supplied. Native `STEP` numbers come from the original scenario array before any display filtering.
- Keep native and legacy Review capabilities explicit: native cases may read/write comments but must not call legacy `/ai`, `/review-comment`, `/fix-round` or `/lifecycle`, or enable native Push/Approve. The native fixing state must not synthesize a round number or a legacy `review.fixRound` DTO.
- Guard GET and mutation completions across project/case changes, disable/unmount and A→B→A; retain composer text on mutation failure, reconcile server state, and block duplicate submissions and edits while fixing.

## R3 — Live Approve

Started 2026-10-24 on `EPMRPP-122688-live-test-case-approval`, stacked on R2 commit `5267d5261` while PRs #5845 and #5846 remain open. Original Estimate remains 16 h (3 / 9 / 4). The user authorized R3 commit, push and PR publication on 2026-10-24. The dependent PR temporarily targets `EPMRPP-122687-live-review-comments` so its diff contains only R3; after the dependencies merge, retarget to `bootcamp-prototype`. Delivery and exact-head CI evidence are tracked in Jira/PR.

- Use `PATCH .../tms/test-case/{id}` with `status: READY` for supported single-case approval.
- Handle review conflict `409`, including error code `40915`, with refresh and useful localized feedback.
- Refresh case/review data after success. Do not silently implement batch behavior or obsolete-confirmation semantics absent from the new contract.
- Verify pending comments, active fixes, permissions, errors and flag-OFF behavior.
- Scope the native action to AI Draft cases in details and the Library side panel. Native manual Mark as ready remains unavailable pending its confirmed contract; legacy manual behavior is preserved.
- Share the synchronous mutation lock with comment operations, fail closed while Review is unavailable, and retain a successful-approval latch while a stale case response still says Draft. Ignore completions after navigation, feature disable, permission revocation or unmount.
- Preserve HTTP 409 in the approval request locally; shared HTTP-client behavior remains unchanged. Refresh both case and Review on current-resource conflict without automatically retrying the mutation.

## R4 — Live Push to agent

Started 2026-10-24 on `EPMRPP-122689-live-fix-round` from PR [#5848](https://github.com/reportportal/service-ui/pull/5848), branch `EPMRPP-122692-remove-obsolete-compare-mocks`, exact head `3ec0526ce12421ab03ae8430cbb88c97c9b3e2e4`, as explicitly requested. Original Estimate remains 28 h (5 / 16 / 7). The user authorized R4 commit, push and PR creation on 2026-10-24. The dependent PR temporarily targets `EPMRPP-122692-remove-obsolete-compare-mocks` while #5848 remains open; merge dependencies first, then retarget to `bootcamp-prototype`. Delivery and exact-head CI evidence are tracked in Jira/PR. Real agent/workflow dispatch is not included.

- Use `POST .../review/fix-round` and the documented round/review reads. Adapt `id`, `roundNumber`, `PENDING`, `FIXED`, `FIXED_GRADE_FAILED`, `FAILED` and available workflow/provenance fields.
- The native POST has no body. Read a known round with `GET .../review/fix-round/{id}`. The optional `review.fixRound` field is a round number, not this ID; resume tracking only from a validated POST ID or unambiguous explicit comment `fixRoundId` metadata. Without a safe ID, poll Review and report completion neutrally.
- Native AI Draft and Ready cases can Push with edit permission and authoritative unsent comments. Use the existing synchronous Review mutation lock for Push, comments and Approve; latch accepted starts before releasing it, so stale reads cannot reopen actions during a pending round.
- Drive fixing locks from server state; poll only while needed, cancel on navigation, refresh comments and case after completion, and distinguish failed start from failed/expired round.
- Read errors or a bounded frontend observation deadline pause monitoring and offer a read-only retry while preserving known fixing protection. They never set the backend round to FAILED or automatically repeat POST. Server timeout and Auto-Ready remain backend-owned; refreshed case status/metrics are authoritative.
- A network error or malformed launch response can leave dispatch outcome unknown. Reconcile Review before permitting another explicit start; show uncertainty separately from a confirmed failed round, and do not render raw server error text.
- Do not claim score-before/after, cumulative cost, change diff or `canPush` support when unavailable.
- Verify start rollback, duplicate push, timeout, failure and successful fix without a grade using contract fixtures; live CI verification belongs to R6.

## R5 — Fix iterations and scope

Started 2026-10-24 on `EPMRPP-122690-live-fix-iteration-provenance`, based on PR [#5849](https://github.com/reportportal/service-ui/pull/5849) head `b14bbb58ed045b9e33c18c0a69b7751f7cbcfa5d`. R4's exact-head Build completed successfully. Jira is In Progress; Original Estimate remains 20 h (4 / 11 / 5). R5 implementation and publication are authorized; no backend mutation or real workflow dispatch is included.

- Represent a fix round as its own iteration, using `rerunOf` and supplied fix-round attributes, without adding its cost to the original iteration.
- Read provenance uses `rerunOf: {id, iterationNumber}`. The `fixRoundId` NONE attribute supplies the actual round link; `fixRound` META is display text only. An ordinary `rerunOf` is not sufficient to classify a fix iteration.
- Refresh the original Review and navigate using real pipeline/iteration identities when available.
- Round DTOs have iteration IDs but no pipeline ID. Resolve only explicit references through the canonical project-scoped iteration-by-ID GET and validate returned identity before constructing routes. Never infer a pipeline, subtract an iteration number or parse a `TC...` display label into an ID.
- Avoid presenting different-scope suite totals as a regression. Preserve existing generic comparison behavior for ordinary iterations.
- Fix comparisons remain neutral even when backend `sameScope` is true: the source handoff copies comparison-key attributes while comparing one repaired case against the original suite. Show independent iteration values without aggregate delta/verdict or unsupported case-level comparison; leave ordinary Compare semantics unchanged.
- An accepted LP3 refresh must re-read its referenced Library rows even if the linked IDs are unchanged. Preserve exact display-ID lookup, deduplication and the existing limit; do not fetch all cases or fan out native Review reads.
- Keep absent provenance unavailable; verify different-scope, missing metadata, errors and stale responses.

## R6 — GitHub Actions journey verification

Started 2026-10-24 on `EPMRPP-122691-github-actions-journey-verification`, based on PR [#5850](https://github.com/reportportal/service-ui/pull/5850) exact head `11a81f2389db0c9fa5b6e00d8d4354d1eb7c4350`. R5 fresh SonarCloud analysis matches this SHA: Quality Gate OK, zero open issues; [Build 40129900921](https://github.com/reportportal/service-ui/actions/runs/40129900921) SUCCESS. Jira R6 is In Progress; Original Estimate remains 12 h (3 / 4 / 5). On 2026-10-25 the user authorized commit, push and a draft PR for documentation/preflight. Delivery and exact-head CI evidence are tracked in Jira/PR; no R6 deployment or workflow dispatch is included.

[Native runtime checklist, setup gate and evidence matrix](26-github-actions-journey-verification-2026-10-24.md). The current read-only preflight identifies the reachable backend build and available browser context. The user confirmed no real scenario is available. R6 runtime execution is blocked by external prerequisites: an eligible case/source iteration and configured integration/workflow. Real workflow outcomes and exact deployed FE identity remain NOT VERIFIED.

The 2026-10-25 credential follow-up confirms GitHub authentication using the locally supplied PAT; workflow access/Actions write remain unverified. Final local verification identified the ReportPortal variable as a configuration-field placeholder; an actual ReportPortal credential is still required. HTTPS certificate verification also failed before authentication. [Sanitized results and remaining prerequisites](26-github-actions-journey-verification-2026-10-24.md#credential-verification-follow-up-2026-10-25) contain no secret values. Draft publication records this preparation, not completion of the end-to-end task.

- Verify an enabled project `github-actions` integration with real repository/ref/workflow settings, and a source stage with matching `GITHUB_ACTIONS` execution metadata.
- Verify that the agent workflow accepts `test_case_id`, `fix_round_id`, `previous_iteration_id`, reads comments, reports a new iteration with `fixRoundId`, and reports the atomic result.
- Capture sanitized evidence for successful fix, failed dispatch, failed round and grade failure; record exact deployment/build and workflow run identities where available.
- Credentials and repository/workflow values are prerequisites, not values to guess. Do not include secrets in documentation or browser storage.
- Creating a generic integration does not implement the separate CI-settings UI story, general iteration Re-run or failed-stage Retry.

## Existing scopes and unresolved backend questions

- Continue generation-panel task [EPMRPP-122414](https://jiraeu.epam.com/browse/EPMRPP-122414) when `stageKey` is returned by LP2/LP3; it is still absent from the new response examples.
- Continue Auto-Ready settings task [EPMRPP-122415](https://jiraeu.epam.com/browse/EPMRPP-122415): the new handoff clarifies PATCH merge/null/range behavior, while concurrent edits and the accepted UI permission policy remain unresolved.
- Native Library `origin`/`status`/`displayId` filters, totals and criterion score DTOs are already published; legacy filter/count replacement and criterion rendering remain FE work. Iteration-scoped/bulk Review membership is unagreed. Version-history reads, previous/current diff, cumulative version cost and attribution/eligibility-reason fields are separate Product-scoped gaps, not minimum R6 blockers; see [27](27-backend-integration-completion-contract-2026-10-25.md).
- Legacy Library quick filters and the folder review count still use the development overlay's mock database when that mode is enabled. Native read presentation does not integrate these filters: mock-backed filtering can omit native cases or classify them using a same-display-ID fixture. Verify R1 with those provisional filters cleared and the mock overlay disabled; authoritative native/iteration filter and count semantics remain with the existing Review/Library scope. R1 does not add undocumented backend filter parameters or a global capability registry.
- No general Re-run command or complete Retry command is specified in this handoff. Keep those controls unavailable pending their contracts.

## Execution evidence

All six Jira subtasks were created with Original Estimates and breakdown comments on 2026-10-24. R1–R5 are submitted for review; R5 is published in PR #5850 with exact-head CI/Sonar success recorded above. R6 preparation and read-only preflight are complete. The user confirmed no real scenario is available; runtime execution waits for an eligible case/source iteration, with actual integration/workflow configuration still unverified. The user authorized R1–R4 publication on 2026-10-24; delivery and exact-head CI evidence are tracked in their Jira issues and PRs. R5 delivery and current exact-head CI/Sonar evidence are recorded in Jira/PR. No deployment or manual workflow trigger is included.

R1 implements native DTO/read presentation, current-version score/model/cost, native-before-overlay precedence (including scenario-update responses), and guards unsupported provisional actions. The first code review found that removing legacy lifecycle data bypassed Draft eligibility checks; four behavior tests reproduced the regression before a host-local native-status fix. Both code and security rechecks report no remaining introduced findings.

Automated checks on 2026-10-24:

- Node 20 `npm run type-check`: PASS.
- Focused Jest before publication: 11 suites / 160 tests PASS, including adapter, overlay, Library, details, header/side panel, native summary, bulk/off-page selection, existing automation/Ready-only/lifecycle seams and the shared AI chip. Jest exited 0 and emitted an open-handles warning; no timeout or failed test occurred.
- Changed-file ESLint: 21 TS/TSX files, zero warnings, PASS.
- Changed-file Stylelint: three SCSS files, PASS (native summary, AI chip, details header).
- `git diff --check`: PASS.

The publication recheck also reviewed the shared AI chip tooltip wrapper/badge sizing and native header placement, with no actionable code-review findings. No authenticated runtime or visual browser check was performed for R1. Tests use explicit contract fixtures; they do not prove the deployed build, real project roles or real workflow execution. Full criterion-level metrics, native quick filters/counts, Review/Approve/Push, version history and cumulative version cost are not claimed integrated by R1. The delivery workflow is Code review after PR creation, then Testing after merge; R2 is the next implementation slice.

R1 Sonar follow-up: PR [#5845](https://github.com/reportportal/service-ui/pull/5845), commit `7bb96619a487f3e5501dd5e0b64f2331b80fde41`, extracts the existing Ready-only selection and native detail read-state calculations without behavior changes. Node 20 type-check, changed-file ESLint, 3 focused suites / 56 tests and independent code/security checks pass. SonarCloud analysis at `2026-10-24T12:48:03+0000` matches that exact commit: Quality Gate OK, zero bugs/vulnerabilities/code smells and zero open issues. GitHub [Build run 40095414828](https://github.com/reportportal/service-ui/actions/runs/40095414828) subsequently completed successfully for the same head, including JS Build and Codecov. The PR remains open; no merge or deployment is claimed.

## R2 local implementation evidence (2026-10-24)

Native AI case details now use a separate live Review adapter/hook/strip. The URLs are `GET .../review`, `POST .../review/comment`, `DELETE .../review/comment/{id}` and `DELETE .../review/comment`. The hook validates responses, uses the server's unsent count and fixing state, checks current numeric author ownership and editor permission, prevents duplicate mutations and ignores stale completions across project/case changes, disable, unmount and A→B→A. Failed mutations retain composer text and reconcile Review; a failed refresh preserves a previously known fixing presentation while blocking mutations.

Native comments use original 1-based scenario positions before empty-step filtering, localized user-ID fallbacks and generic round labels when optional metadata is absent. Native fixing locks are explicit header props; legacy DTOs, hooks and feature-OFF behavior remain separate. Native Review does not activate provisional `/ai`, `/review-comment`, `/fix-round`, `/review/fix-round` or `/lifecycle`, nor Push/Approve. Refresh is manual; fix-round polling remains R4.

- Node 20 canonical `npm run type-check`: PASS.
- Focused Jest: 8 suites / 138 tests PASS, including DTO/hook/shared comments, details, header and original step positions. Test log: `/tmp/service-ui-r2-tests.log` (local evidence only).
- Changed-file ESLint: 17 JS/TS/TSX files, zero warnings, PASS. No SCSS changes in R2.
- `git diff --check`: PASS.
- Independent senior code and security reviews: PASS, no actionable introduced findings.

R2 is submitted from `EPMRPP-122687-live-review-comments`, stacked on R1 commit `7bb96619a`, following the user's publication request. The delivery workflow moves Jira to Code review after PR creation; this does not mark the task deployed or runtime-verified. No authenticated browser check, backend comment mutation, merge or deployment was performed. Automated contract fixtures do not establish deployed authorization or runtime behavior. Native Library filter/count semantics, Approve and Push remain separate follow-ups.

## R3 implementation and local validation

R3 is implemented locally on `EPMRPP-122688-live-test-case-approval` from R2 `5267d5261`. Native AI Draft cases now offer Approve in details and the Library side panel. The command sends only `PATCH .../tms/test-case/{id}` with `{status: "READY"}` and reconciles case/Review after success or a current-resource failure. Request-local raw response handling preserves HTTP 409; numeric `errorCode: 40915` is also recognized. Feedback is localized and never renders server error text.

The command shares the synchronous Review mutation lock with comments, checks editor permission and authoritative loaded Review state, and blocks unsent comments, active fixes, errors, loading and duplicates. An approval latch prevents another PATCH while stale case data still says Draft. Default-version identity and approval epochs invalidate old handlers/responses after navigation, permission changes, disable/unmount or a new version. An ordinary Review refresh does not discard an in-flight approval result. Details reuse their existing Review hook; the side panel loads Review only for visible native AI Draft cases. Viewer reads remain permitted, while the approval button and command require edit permission.

Validation: 12 focused suites / 227 tests PASS, full Node 20 `type-check` PASS, changed-file ESLint for 8 production and 5 test files with zero warnings PASS, and `git diff --check` PASS. Changed production entry-point Madge processed 832 files with 7 warnings and found no circular dependency. Independent senior code and security reviews PASS after navigation/permission/version race fixes. Fixtures cover both raw HTTP 409 with an unknown body and the documented 40915 body, shared locks in both directions, stale callbacks/completions and same-case version changes, authoritative latch reset, case/Review refresh and native-versus-legacy/feature-OFF behavior.

Authenticated browser/backend execution, backend authorization/atomic conflict enforcement, deployment and fresh R3 CI/Sonar are NOT VERIFIED by the local checks above. No live case mutation was performed. Publication is authorized; Jira moves to Code review after PR creation, with current delivery/CI evidence tracked in the issue and PR. Native manual approval, native batch approval, obsolete-confirmation semantics, Push and fix-round polling remain outside this slice. On a side-panel Review read error, retry by closing and reopening the panel; there is no inline Retry control.

For the later runtime check, enable `show_ai_factory_poc`, disable demo overlays, and open a real native AI Draft case with a numeric ID and confirmed project access. Verify one initial Review GET in details; Approve sends the status-only PATCH followed by Review and case refresh, with the authoritative Ready result replacing Draft. Repeat from the Library side panel and verify list refresh. Verify the button is unavailable for Viewer, flag OFF, native manual/Ready cases, unsent comments and active fixing. A real conflict must show localized feedback, refresh both resources and never automatically retry PATCH. This checklist is pending runtime verification, not a recorded pass.

## R4 implementation and local validation

R4 is implemented on `EPMRPP-122689-live-fix-round`, based exactly on PR #5848 head `3ec0526ce12421ab03ae8430cbb88c97c9b3e2e4`. The details Review strip supports native Push for eligible AI Draft and Ready cases. The command sends a bodyless POST to `/review/fix-round`; typed native reads validate actual case/round IDs and statuses. Comment metadata can recover an unambiguous actual round ID; the optional Review round number is never used as a database ID. Without a safe ID, monitoring reads Review only and reports completion neutrally.

Comments, Approve and Push share one synchronous mutation semaphore per Review hook. Accepted starts retain the fixing lock before the command releases its semaphore. Navigation, case/version changes, feature disable and unmount abort requests/timers and invalidate stale handlers. Viewers can observe an existing fix but cannot start one. The details header and approval controls consume the same fixing state; side-panel monitoring refreshes its list on completion and exposes no Push action.

Monitoring uses non-overlapping GETs with a 3-second interval and an independent 30-minute frontend observation deadline, including cancellation of a hung read. A read error, missing round or observation timeout retains known fixing protection and offers read-only retry. These UI states do not set backend FAILED or repeat POST. An uncertain start reconciles Review before another explicit launch is possible. Terminal FIXED, FIXED_GRADE_FAILED and FAILED refresh case/Review with distinct localized feedback; returned version/status/metrics remain authoritative. Feedback survives a same-case version refresh, is cleared for a new observation/resource, and known round completions are deduplicated within the project/case session. UI eligibility does not establish that a source workflow/integration is configured.

Validation on the final local source:

- Full Node 20 `npm run type-check`: PASS.
- Full `npm run test:coverage -- --runInBand --watch=false --notify=false`: 176 suites / 1799 tests PASS, exit 0.
- Production `npm run build`: PASS; webpack compiled successfully.
- Changed-file ESLint: 10 production and 6 test files, zero warnings, PASS. No SCSS changes.
- Changed production entry-point Madge: 836 files, 6 warnings, no circular dependency.
- Independent senior code and security reviews: PASS after resumed-round lock, external-round feedback and completion-idempotency fixes. Each reported regression was reproduced before correction.
- `git diff --check`: PASS.

Publication is authorized; Jira moves to Code review after PR creation, with current delivery and exact-head CI/Sonar evidence tracked in Jira/PR. Authenticated browser/backend execution and real workflow dispatch remain unverified. The 28 h Original Estimate is unchanged planned effort, not measured delivery time. R5 provenance/comparison, native filters/history/diff/cumulative cost, server Auto-Ready cause attribution and R6 workflow verification remain separate scopes. Legacy fix-round handlers and fixtures remain available for legacy consumers.

For later runtime verification, use a project with a configured matching integration/workflow and source iteration, enable the feature flag and disable demo overlays. Add an unsent comment to a real native AI Draft or Ready case; Push must send one bodyless native POST, lock comments/Approve/Edit Scenario immediately, and read the actual returned round ID. Reload during a pending fix and verify safe resume, then verify all three terminal outcomes, case/Review refresh and stale-score removal. Viewer/feature-OFF behavior, conflict, unknown start, read retry and timeout remain runtime QA scenarios; retry monitoring must issue GET only. This checklist is pending runtime evidence.

## R5 implementation and local validation

R5 is implemented locally on `EPMRPP-122690-live-fix-iteration-provenance`, based on R4 `b14bbb58e`. LP2/LP3 preserve a validated `rerunOf.id` and an optional valid display number. Fix markers come from supplied `fixRoundId`/`fixRound` attributes; an ordinary rerun is not relabeled as a fix. Pipeline cards show provenance as text without nested links, while details and the native Review strip offer **Show iteration links**.

That explicit action reads only the supplied source/result iteration IDs through the canonical project-scoped GET, with at most two unique requests per attempt. Navigation uses confirmed response IDs, pipeline IDs and iteration numbers. Missing metadata, mismatched identities, different pipelines or an inconsistent result `rerunOf` leave links unavailable. Network errors offer read-only retry. Duplicate clicks, stale responses and retained handlers are guarded across project, resource, round, feature and unmount changes, including A→B→A navigation. Viewer access remains read-only.

An accepted LP3 refresh now reloads its known Library rows even when their display IDs stay the same. The component deduplicates references, keeps the existing 50-ID limit and exact `filter.eq.displayId` lookup, and does not scan all cases or add native Review fan-out. Backend status/score values remain authoritative. Compare re-fetches after a project change with identical numeric IDs. If either side is a fix iteration, it keeps independent values, cost and stage facts but omits aggregate delta/verdict and unsupported case comparison sections, including when `sameScope=true`. Ordinary comparison behavior and the raw-response inspector are preserved.

Local validation:

- Full Node 20 `npm run type-check`: PASS.
- Focused integration tests: 20 suites / 436 tests PASS.
- Full `npm run test:coverage -- --runInBand --watch=false --notify=false`: 182 suites / 1882 tests PASS, exit 0.
- Production `npm run build`: PASS; webpack compiled successfully.
- Changed-file ESLint: 18 production and 13 test files, zero warnings, PASS. No SCSS changes.
- Changed production entry-point Madge: 336 files, 6 warnings, no circular dependency. A type-only back edge was removed with a local structural attribute type; its follow-up 4 suites / 120 tests, type-check and lint PASS.
- Independent senior code and security reviews: PASS. Mounted tests cover on-demand navigation/retry, missing and inconsistent metadata, duplicate requests, stale callbacks, project changes, ABA, unmount and accepted-detail refresh. Tests found duplicate Library-ID fan-out; the component now deduplicates before both lookup and rendering.
- `git diff --check`: PASS.

Authenticated browser/backend behavior, deployed authorization, workflow dispatch and fresh R5 CI/Sonar are NOT VERIFIED by local fixtures. Publication is authorized; the dependent PR targets R4’s branch until dependencies merge, then bootcamp-prototype. Jira moves to Code review after PR creation, with delivery and exact-head CI evidence tracked in Jira/PR. The 20 h Original Estimate is unchanged planned effort. Native history/diff, cumulative cost, Review filters/counts and server Auto-Ready cause attribution remain separate scopes.

For later runtime verification, enable the feature flag, disable demo overlays and open a real fix iteration in Pipelines. Confirm its fix label, optional source number and its own cost. Open details, select **Show iteration links**, and inspect `GET /api/v1/project/{project}/pipeline/iteration/{id}` for only the explicit source/result IDs. Open both destinations and **Compare source and fix**; confirm the route uses actual IDs and the subset notice replaces aggregate regression/delta/verdict claims. In the native Test Case Review strip, load links for the returned round and repeat as Viewer. Refresh the original iteration details and verify its existing linked Library rows are fetched again with exact `filter.eq.displayId` queries, showing server-returned status/score. Exercise missing metadata, 403/404, retry, rapid duplicate clicks and project/case/round navigation while a read is pending. This checklist is pending runtime evidence; it does not require starting a new fix round.
