# GitHub Actions fix-round journey verification

**Backend follow-up (2026-10-25):** [27 — completion contract](27-backend-integration-completion-contract-2026-10-25.md) assigns requested prerequisites and acceptance criteria. This checklist retains its 2026-10-24 observation dates and NOT VERIFIED runtime results.

Date: 2026-10-24. Task: [EPMRPP-122691](https://jiraeu.epam.com/browse/EPMRPP-122691), R6. Status: **runtime execution blocked by external prerequisites; preparation and limited preflight complete; end-to-end outcomes NOT VERIFIED**.

Branch `EPMRPP-122691-github-actions-journey-verification` starts from R5 commit `11a81f2389db0c9fa5b6e00d8d4354d1eb7c4350`. R5 [PR #5850](https://github.com/reportportal/service-ui/pull/5850) has a successful exact-head [Build run 40129900921](https://github.com/reportportal/service-ui/actions/runs/40129900921) and fresh Sonar Quality Gate OK with zero issues. These checks do not establish the deployed frontend version. Jira is In Progress; Original Estimate is 12 h, not measured execution time.

## Authority and boundaries

The R6 scope is [25-live-review-fix-round-integration-2026-10-24.md](25-live-review-fix-round-integration-2026-10-24.md), section R6. Backend request/state expectations come from the supplied `pipeline-iteration-e2e-journey 1.md`, sections 19–20. Its sample IDs, GitLab URLs and claimed backend integration tests are contract examples, not captures from this environment. GitHub Actions requires the actual configured repository and workflow.

R6 verifies the existing native Review/fix-round integration. It does not implement CI-settings UI, general iteration Re-run, failed-stage Retry, history/diff, cumulative version cost or unsupported provenance. No backend mutation, integration creation or workflow dispatch was performed during this preflight.

## Observed preflight

The observations below were reported from read-only checks on 2026-10-24. They are deliberately narrower than a conclusion about all projects or integrations.

| Check | Result | Evidence and limit |
|---|---|---|
| Local browser session | PASS, limited | `http://localhost:3000` authenticated as admin in `superadmin_personal`. Running-process proxy environment was not verified. |
| Direct target browser session | PASS, limited | `http://tms.epmrpp.reportportal.io/ui/` authenticated as the same admin. My organization → Projects displayed `default_personal` and `superadmin_personal`. This is not proof that the target project is absent or permission is denied. |
| Visible integration settings | PASS, observation only | Direct target → `superadmin_personal` → Project Settings → Integrations displayed only an Email Server card. This does not prove that a GitHub integration is absent from the API. |
| Connected service versions | PASS, limited | Direct target → Help & Service versions → Versions of connected services displayed Service UI `bootcamp-prototype-4171`, API `feature-pipelines-2890`, Jobs `develop-51`, ReportPortal `26.1`. Exact frontend commit is unverified; these labels do not establish R5 deployment. Local browser runtime SHA is also unverified. |
| Local project search | PASS, observation only | Searching `epm` in the local project dropdown returned no results. No global project/integration absence is inferred. |
| Backend build identity | PASS | Unauthenticated `GET /api/info` returned HTTP 200 at both origins, with equal sanitized fields: repository `reportportal/service-api`, version `feature-pipelines-2890`, branch `HEAD-23734b90d33575d8ff349e49a14b3a84851ec3dc`. Equal responses do not establish project access, eligible source data or frontend deployment identity. |
| Existing case 3 | NOT ELIGIBLE for E2E | Description explicitly identifies an R1 synthetic case without an agent/pipeline. Review already displayed two unsent comments and failed-start feedback before this verification; the check did not initiate it. This is not a newly reproduced dispatch failure. |
| Configured proxy | NOT VERIFIED at runtime | `app/.env` identifies `http://tms.epmrpp.reportportal.io`; the running process configuration was not established. |
| Real workflow prerequisites | NOT VERIFIED | No usable repository/ref/workflow configuration, integration identity or eligible case was discovered in the available context. No repository fix workflow or ReportPortal credential environment keys were found. This does not prove no server-side integration exists. |
| Frontend deployment / dispatch / all outcomes | NOT VERIFIED | No exact deployed R5 frontend identity, correlated agent run or controlled outcome execution was captured. |

The user confirmed that no real scenario is available. To unblock execution, provide an actual disposable case/project with its source iteration and repository/ref/workflow, or an existing integration identity from which configuration can be inspected. Check connected project/repository context before requesting credentials; never put tokens in this document or browser storage.

### Credential verification follow-up (2026-10-25)

The user supplied local environment variables for read-only verification. Only their names and sanitized results are recorded; `.env` and secret values are excluded from publication.

| Variable / check | Result | Remaining boundary |
|---|---|---|
| `REPORT_PORTAL_GITLAB_TOKEN` | GitHub fine-grained PAT format; authenticated `GET https://api.github.com/user` returned HTTP 200 for `Saveli0S`. Despite the variable name, the checked provider is GitHub. | GitHub authentication is confirmed. Public repository listing does not establish target-repository access, organization approval or `Actions: write`; the actual agent repository/workflow still needs identification and verification. |
| `BEARER_TOKEN` | Final local verification identified the literal configuration-field name `integrationParameters.token` as its value, rather than a supplied ReportPortal credential. The HTTPS connection also failed certificate validation before authentication; normal curl failed issuer validation. | Supply an actual ReportPortal bearer credential through the local secure configuration and provide a trusted certificate chain/CA. Authentication and project permissions remain NOT VERIFIED; no real credential was rejected, no TLS bypass or HTTP credential transmission was used. |
| Integration / agent execution | No integration was created and no workflow was dispatched. | Actual `repo`, `ref`, `fixWorkflowRef`, an eligible case/source iteration and the correlated four outcomes remain NOT VERIFIED. |

Documentation publication is authorized as a **draft PR**. It exposes preparation, current contract and external blockers; it does not complete R6 or establish deployed readiness. Jira remains In Progress while runtime prerequisites are unresolved.

## Setup gate

Complete this gate before interpreting any journey result:

1. Record the test origin/project key and exact running frontend SHA containing R1–R5, either a local development runtime connected to the real backend or a deployed build. Verify the actual running source/build rather than Git HEAD alone. Record backend build identity, current user and actual project edit/view permission, plus workflow repository/file/ref/commit separately. Local E2E evidence is valid for this origin; it does not establish deployment/rollout acceptance. Authenticated target traffic still requires trusted transport with normal certificate validation; do not bypass TLS.
2. In the intended browser origin, set `localStorage.show_ai_factory_poc = 'true'` and `localStorage.ai_factory_mocks = 'false'`, then reload. Confirm native Network responses. LP1–LP3 already use live transport; an old transport override is unnecessary. Clear provisional Library filters so they cannot hide/classify native cases using demo data.
3. Inspect the existing project's enabled `github-actions` integration through an available supported read surface. Verify real `repo`, `ref` and `fixWorkflowRef` values without recording its token. A generic integration existing is insufficient evidence that it matches the source execution.
4. Find a disposable native `origin: AI` case, in Draft or Ready, actually linked by a stage target to a source iteration. Record numeric case/default-version IDs, current status/metrics, pipeline ID, source iteration ID and display number. The latest linked source iteration must have a suitable stage execution with `executorType: GITHUB_ACTIONS` and matching usable repository/workflow metadata.
5. Inspect the exact workflow ref. `workflow_dispatch` accepts `test_case_id`, `fix_round_id`, `previous_iteration_id`. The job reads the current case and round comments from ReportPortal, reports a new iteration linked by `fixRoundId`, and submits the atomic result. Only IDs travel in dispatch inputs. The integration's `fixWorkflowRef` selects the workflow; the documented fallback must be checked against actual source metadata rather than guessed.
6. Establish controlled fixtures for successful fix, counting Fix-stage failure, result without grade and dispatch rejection. Use isolated configuration for failure injection; do not break a shared working integration. Have a Viewer account for the permission check. Confirm the disposable fixture and authorized execution scope before triggering paid/external workflow work.

## Where to go and what to capture

Use **Test Case Library → selected native AI case → case details / AI review** for comments and Push. The Library side panel supports Review comments and approval/monitoring; native Push is available in case details. Use **Pipelines → source pipeline → source/fix iteration** for provenance, refresh and Compare. Known routes are `/organizations/{organizationSlug}/projects/{projectSlug}/pipelines`, `.../pipelines/{pipelineId}/iterations/{iterationId}` and `.../pipelines/compare`; prefer UI links so actual identifiers are preserved.

In DevTools Network, preserve the log and record sanitized URL/method/status plus relevant response fields. Base `B = /api/v1/project/{project}` below; use the deployment's actual prefix. Browser traffic cannot show server-to-GitHub dispatch: correlate that through the workflow run and available backend evidence.

| Native request | What to verify |
|---|---|
| `GET B/tms/test-case/{caseId}` | Numeric ID, `origin`, lifecycle, `defaultVersionId`, current metrics before and after. |
| `GET B/tms/test-case/{caseId}/review` | Authoritative comments, `unsentCount`, `fixInProgress`; `fixRound` is a display round number, not a round ID. |
| `POST B/tms/test-case/{caseId}/review/comment` | `targetType`, original 1-based `stepNumber` for STEP, text; NOT_SENT response and subsequent Review. |
| `POST B/tms/test-case/{caseId}/review/fix-round` | One explicit **bodyless** POST; actual round `id`, `roundNumber`, status and source reference. |
| `GET B/tms/test-case/{caseId}/review/fix-round/{roundId}` | Actual round ID from validated response/metadata; PENDING → terminal status, optional workflow/source/result fields. |
| `PATCH B/tms/test-case/{caseId}` | Approve uses `{"status":"READY"}` only when eligible. Deliberate conflict checks return 409, including documented pending-comment conflict `40915`; no automatic mutation retry. |
| `GET B/pipeline/iteration/{iterationId}` | Canonical identity and fix/source metadata. Resolve explicit references only; no guessed pipeline or ID arithmetic. |
| `GET B/pipeline/iteration/{resultId}/compare?with={sourceId}` | Both real iteration identities; fix comparisons must remain neutral despite different scope, even if backend `sameScope` is true. |

Agent-side evidence must additionally correlate `POST B/pipeline/iteration`, `PUT B/tms/test-case/{caseId}/review/fix-round/{roundId}/result` and subsequent stage reports. These requests normally belong in job/backend logs, not the editor's browser Network panel. Native-backed UI must not call provisional `/ai`, `/lifecycle`, `/review-comment` or legacy `/fix-round` endpoints.

## Four required outcomes

All four are currently **NOT VERIFIED**. Contract examples such as scores 72 → 93, IDs 31/32/5, costs 1.27/0.22 and Review counts 2/4 → 3/4 are illustrative. Assert actual fixture values and server responses.

| Scenario / priority | Action | Expected UI and native state | Required correlation |
|---|---|---|---|
| Success, `FIXED` / Critical | Editor adds STEP/PRECONDITION comments and clicks Push once. Agent applies a valid fix with quality scores and finishes stages. | Comments NOT_SENT → SENT → ADDRESSED / NOT_ADDRESSED with returned reason. PENDING shows fixing and locks comments/Approve/Edit Scenario. Completion refreshes case/Review, changes default version, displays the new version's current metrics and releases locks. Case returns to Draft and may become Ready through server Auto-Ready; use actual returned lifecycle/settings rather than forcing Ready. | Exactly one dispatch/run with the case ID, actual round ID and previous iteration ID. New iteration is in the same pipeline, `rerunOf` points to source and `fixRoundId` equals the round ID. Atomic result precedes the refreshed state. |
| Confirmed dispatch failure / Critical | Use isolated configuration that reaches a controlled dispatch rejection. Missing integration is a separate preflight-rejection subcase. | Push error; no round retained, comments remain/return NOT_SENT, case/version/metrics unchanged. Later explicit Push is possible after state reconciliation. An uncertain network start is not a confirmed rejection and must never auto-repeat POST. | Request error and rollback evidence; no successfully started matching run. Existing synthetic failed-start feedback is insufficient. |
| Agent round `FAILED` / Critical | Controlled job reports a counting Fix stage Failed on an iteration carrying this round's `fixRoundId`. | Failed feedback, fixing false, comments restored to NOT_SENT. **Default version, lifecycle and grade unchanged**; no version is created by this failure. Grade failure on a non-counting stage alone does not satisfy this scenario. | Matching workflow run, failed iteration and actual round; returned failure reason when available. An actual backend-timeout run is an optional additional FAILED variant only if separately agreed; it is not a fifth required outcome. |
| `FIXED_GRADE_FAILED` / Critical | Agent submits a valid atomic fixed result without `qualityScores`. | **New default version, Draft**, comments answered, locks released and **no current evaluation**. Do not display the old version's score as current. Auto-Ready does not promote the ungraded new version. | Matching workflow/run, actual round and result iteration; result payload omits grade, refreshed case confirms absence of current grade. |

## Focused checks during these runs

| Check / priority | Steps and expected result |
|---|---|
| Pending resume and duplicate prevention / High | Reload during PENDING. Resume through a validated actual round ID or safe Review monitoring; never use the display round number as the ID. Double-click Push: no duplicate frontend POST. Pending comments, discard, Approve and Edit Scenario stay locked. Navigate to another case/project: late old responses must not alter it. |
| Read retry and timeout ownership / High | Interrupt a polling GET and use Retry monitoring. Retry issues GET only and preserves known fixing protection; it must not dispatch again. A frontend observation deadline does not mark the backend FAILED. Document effective backend timeout/check interval, configuration and terminal-state semantics. Execute an actual controlled backend-timeout fixture only if separately agreed as additional scope; then verify eventual FAILED, restored comments and unchanged case/version/grade. It is not mandatory for the four-outcome R6 exit. |
| Viewer, editor and ownership / High | Viewer can read Review/available provenance but cannot comment, Push, approve or discard. Editor's own unsent comment may be deleted; sent comments are immutable. Revoke edit permission mid-session: retained handlers cannot mutate. Existing native state remains authoritative for action eligibility. |
| Feature OFF and manual case / High | Feature OFF exposes no new AI actions or Review polling. Native manual cases must not expose AI Push. |
| Source/result provenance / High | Open validated source/result links. Missing or inconsistent metadata stays unavailable; do not infer a pipeline, parse `TC...` as an ID or subtract an iteration number. At most two unique explicit identity GETs per resolution attempt; repeated clicks must not duplicate an in-flight attempt. |
| Review refresh and comparison / High | Refresh the original iteration after completion. Its Review stage and referenced Library rows must reread backend data even with unchanged display IDs, preserving exact `filter.eq.displayId` lookup/dedup/limit. No all-Library scan or per-row Review fan-out. Show source/fix costs independently and no different-scope aggregate delta/verdict or unsupported case comparison. Ordinary reruns alone are not fix iterations. |

The API does not currently expose previous-version history/diff, cumulative version cost, reliable `modifiedByAgent` or “made ready by” attribution. Do not invent those assertions. Notifications are not specified in R6.

## Evidence matrix and completion rule

| ID | Requirement | Current status | Required next evidence |
|---|---|---|---|
| R6-SETUP | Exact running frontend/test origin, backend, project, integration, workflow and eligible disposable source | NOT VERIFIED | Complete setup gate, retaining sanitized identities. |
| R6-FIXED | Successful atomic fix and complete correlated workflow | NOT VERIFIED | Browser/API before/pending/after, run identity and agent reports. |
| R6-DISPATCH | Confirmed dispatch rejection and rollback | NOT VERIFIED | Isolated failure and round/comment/case reconciliation. |
| R6-FAILED | Failed counting stage and safe restoration | NOT VERIFIED | Failed run/iteration/round; unchanged version and grade. |
| R6-GRADE | Successful content fix without current evaluation | NOT VERIFIED | Missing-grade result; new Draft default version and absent current score. |
| R6-GUARDS | Permission, reload, duplicate, read-retry and stale-response checks | NOT VERIFIED | Focused observations during controlled runs. |
| R6-PROVENANCE | Original Review refresh, independent costs, valid links and neutral Compare | NOT VERIFIED | Actual source/result/Compare captures. |

For each executed check record: `ID | PASS/FAIL/NOT VERIFIED | UTC time | frontend SHA | backend build | project/case/default-version IDs | source/result iteration IDs | round ID/number | workflow run URL/ID/SHA | sanitized request/status/fields | UI evidence | discrepancy`.

PASS requires observed expected behavior and the relevant UI/API/workflow correlation. An observed contradiction is FAIL. Missing access/configuration/deployment or an unexecuted scenario is NOT VERIFIED. Local automated tests, CI, matching `/api/info` responses and documented backend integration tests cannot replace end-to-end evidence. Observed local-frontend/real-backend E2E with verified runtime identities and trusted transport is eligible evidence for that origin; trusted deployed rollout acceptance remains separate. R6 remains incomplete until its required runtime outcomes are verified or explicitly accepted as outstanding.
