# GitHub Actions dispatch probe

Date: 2026-10-25. Project authorized by the user: `superadmin_personal`. Task: [EPMRPP-122691](https://jiraeu.epam.com/browse/EPMRPP-122691). This is the first technical dispatch check within [R6](26-github-actions-journey-verification-2026-10-24.md), not a real agent or a completed fix-round journey.

## Prepared artifacts and prerequisites

- [fix-test-case.yml](../../.github/workflows/fix-test-case.yml) accepts exactly three required string inputs: `test_case_id`, `fix_round_id`, `previous_iteration_id`. It validates canonical positive integers and logs those IDs plus its own run URL. It has `permissions: {}`, no checkout, no secrets and no ReportPortal calls. It does not submit a result or finish a round.
- [github_actions_fixture.py](tools/github_actions_fixture.py) prepares a disposable synthetic case and source iteration. It is offline by default; only `--apply` writes to ReportPortal. It never creates an integration, pushes to an agent, overwrites the quality standard or deletes anything.
- In `reportportal/service-ui`, the verified default branch is `develop`; `main` did not exist at the preceding repository check. Before dispatch, publish this workflow through the repository's review process so that `workflow_dispatch` is available on its current default branch. The chosen execution ref must contain the workflow too. A local file or an unmerged feature-branch PR alone is not proof of dispatch availability. [GitHub manual workflow documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
- Supply a real ReportPortal credential as `BEARER_TOKEN` in the process environment or ignored root `.env`; the environment takes precedence. A raw credential or one case-insensitive `Bearer ` prefix is accepted; the request always adds exactly one Authorization scheme. Line breaks, repeated prefixes, residual whitespace and placeholders are rejected. Values are read privately, never sourced as shell code. Current authentication still requires runtime verification; credential presence alone is insufficient.
- Use a trusted HTTPS API origin. The last browser check failed with `ERR_CERT_AUTHORITY_INVALID` for the target. Configure the correct trust chain or a separately verified CA bundle with `--ca-file`; hostname and certificate checks remain enabled. No HTTP credential transmission, insecure TLS flags or certificate-interstitial bypass.

## Reproducible isolated fixture

Run from the repository root. The first command requires no credentials or network:

```sh
python3 -B docs/ai-factory-poc/tools/github_actions_fixture.py --dry-run
```

After secure transport, project access, workflow publication and integration configuration are verified:

```sh
python3 -B docs/ai-factory-poc/tools/github_actions_fixture.py --apply \
  --api-base https://tms.epmrpp.reportportal.io/api \
  --project superadmin_personal \
  --repo reportportal/service-ui \
  --workflow fix-test-case.yml
```

For a trusted private CA, append `--ca-file /absolute/path/to/verified-ca-bundle.pem`. Do not obtain or trust a new CA merely from the failing server's unverified certificate.

Apply is restricted to the user-authorized `superadmin_personal` project; another project is rejected before loading credentials or making requests. It first reads the existing project quality standard and validates every actual criterion ID and maximum before any mutation. It stops if the rubric is missing or unusable; creating/replacing shared grading rules is outside this helper. Then it:

1. Creates a uniquely named `R6-dispatch-probe-…` case and a new folder through the case request's nested `testFolder`. The description explicitly identifies synthetic data and the absence of a real agent.
2. Calls `/tms/test-case/{actualId}/generation` using real criterion IDs and controlled integer scores `floor(maxPoints × 0.72)`, with zero tokens/cost and the model/skill `controlled-integration-fixture`. These scores test the transport; they are not a real evaluation.
3. Registers one uniquely named `TEST_CASE_GENERATION` pipeline/source iteration with an `Idempotency-Key`. Its passed `upload` stage has a `RESULT` `uploadReport` row targeting the actual server-returned case `displayId`, `executorType: GITHUB_ACTIONS` and the selected `repo`/`workflowRef`. Current UTC timestamps describe fixture registration; no CI run ID or URL is invented. The source is a synthetic technical fixture, not evidence that an agent generated it.
4. Reads the case and source back to verify `origin: AI`, Draft lifecycle, default-version ID, current evaluation with matching criterion IDs/scores, the passed Upload target and derived `relatedEntities`. It does not assume a total-score aggregation formula for an arbitrary rubric. Published `PipelineStageRS` does not expose the original `execution` object, so its stored repo/workflow cannot be independently read back here; the outgoing payload is known and actual dispatch still needs verification. A successful fixture reports `FIXTURE_VERIFIED_DISPATCH_NOT_RUN` with whitelisted IDs, operation, label and idempotency key only.

POSTs are never automatically retried. On a failure the printed operation and any known created IDs identify partial state for inspection. A transport failure or unreadable POST response may leave a server-side object whose ID was not received. Do not blindly rerun apply: reconcile the unique label/known IDs through authorized reads first. A new apply intentionally uses a new label/key and may create another fixture. Cleanup is a separate explicit action; this helper does not delete partial state.

## Integration is configured separately

Read existing integrations first through `GET /api/v1/integration/project/superadmin_personal/all/github-actions`. Inspect only sanitized ID/name/enabled/repo/ref/workflow fields; never print or save the raw response, which can contain a token. Reuse a matching enabled integration. Resolve mismatches or duplicates before creating anything; do not overwrite a shared integration during this check.

If none is configured and creation is authorized, the generic creation contract is:

```http
POST /api/v1/integration/superadmin_personal/github-actions
Authorization: Bearer <REPORTPORTAL_TOKEN>
Content-Type: application/json

{
  "name": "github_actions",
  "enabled": true,
  "integrationParameters": {
    "token": "<GITHUB_PERSONAL_ACCESS_TOKEN>",
    "repo": "reportportal/service-ui",
    "ref": "develop",
    "fixWorkflowRef": "fix-test-case.yml"
  }
}
```

The ReportPortal token authenticates the request. The GitHub PAT is sent only in the integration's `token` parameter over trusted transport; it is not a ReportPortal token or workflow input. A fine-grained GitHub PAT must cover the selected repository with Actions read/write and Metadata read, including organization approval if required. Classic PATs need the appropriate `repo` access. Confirm the current repository/ref and permission policy before use. [GitHub workflow-dispatch API](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event).

`repo` in the integration and source execution must match exactly. `fixWorkflowRef` is `fix-test-case.yml`; the source `retryParameters.workflowRef` uses the same file. The fixture helper needs only the ReportPortal token and never reads the GitHub PAT.

## UI and request checks

1. Open the known frontend connected to this backend, enable the AI Factory feature and live transport as described in R6, and select `superadmin_personal`. Record the actual running frontend/backend identities. Open **Test Case Library**, the unique fixture folder, then its case details / AI review. Confirm AI origin, actual case ID/display ID, synthetic score and scenario. Open its pipeline/iteration and confirm Upload's Library link resolves to that case.
2. Add one explicit disposable review comment. Check `POST …/tms/test-case/{caseId}/review/comment` and subsequent Review: comment `NOT_SENT`, no active fix. Then click **Push to agent** once. Check one bodyless `POST …/review/fix-round`, capture the real returned round ID and source iteration ID; no repeat POST after an uncertain response.
3. In **GitHub → reportportal/service-ui → Actions → ReportPortal dispatch probe (logging only)**, locate the newly started run. Its logs must contain exactly the same case ID, actual round ID and source iteration ID as ReportPortal, plus the real run URL. Capture sanitized method/status and IDs only; no HAR/auth headers or full integration dumps. Browser Network cannot show the backend's outbound GitHub request.
4. A matching successful probe run is **dispatch delivery PASS only**. ReportPortal remains `PENDING` because this workflow sends no result; comments/approval may remain locked. Do not claim `FIXED`, click Push repeatedly or invent a callback. Use the effective backend timeout and authorized observation/reconciliation path for this disposable case. A frontend polling timeout does not mark the backend failed. Never change the shared timeout merely to speed up a test.

## Remaining full journey

The real agent or a separately reviewed callback simulator must read the round, register a linked result iteration using the real source/round IDs, submit the atomic `PUT …/review/fix-round/{roundId}/result`, then finish its stages. It needs separately provisioned ReportPortal credentials and trusted network access. Validate `FIXED`, controlled dispatch rejection, counting Fix-stage `FAILED`, and `FIXED_GRADE_FAILED` plus the R6 guards. A logging probe validates none of these terminal outcomes or real AI correction quality.

Prepared code and offline checks establish readiness to attempt setup. Integration creation, fixture apply, actual Push, workflow publication/run and terminal outcomes require their own recorded runtime evidence; none is implied by this document.

## Execution evidence — 2026-10-25

The root agent attempted `--apply` for `superadmin_personal` using normal TLS validation. The helper stopped at `operation: read_quality_standard`, with `status: INCOMPLETE` and the sanitized error `API GET transport/TLS failed; no automatic retry.` This occurred before any POST: no fixture was created. The credential was normalized successfully, but its authentication validity remains **NOT VERIFIED** because trusted transport was not established. The browser independently reported `ERR_CERT_AUTHORITY_INVALID`.

A fresh GitHub connector read of `develop/.github/workflows/fix-test-case.yml` returned 404. Workflow publication is **NOT DONE**; no dispatch or terminal fix outcome is verified.

Root validation: **11 offline unit tests PASS**, workflow YAML validation and six negative input checks **PASS**, application type check **PASS**. These checks do not establish runtime authentication, integration configuration, workflow availability or R6 completion.

## Execution evidence — 2026-10-26

At the user's explicit request, the operator retried the current `tms.epmrpp.reportportal.io` environment with certificate verification disabled for these HTTPS requests only. This was an execution-time exception; the helper's default TLS validation and system trust settings remain unchanged. Redirects were refused and credentials were not logged.

At approximately **09:11 UTC**, authenticated HTTPS reads of `/api/info`, the project's quality standard, project details and GitHub Actions integrations all returned **404**. Unauthenticated `/api/info` and `/api/api-docs` also returned 404 over both HTTP and HTTPS; the captured API response was plain text `404 page not found`. `/ui/` returned 200 over both schemes. After loading, the browser showed the login page; the connected-services dialog showed service names but no version values. Protected content and successful login were not observed. No authenticated HTTP request was made.

At that check, the blocker was API availability/routing at the configured origin, beyond the certificate error observed on October 25. These responses do not establish the backend's internal failure cause or token validity. No POST, fixture creation, integration mutation or workflow dispatch was attempted. Authentication, configuration and the real journey remained **NOT VERIFIED**. The previously inspected beta environment is not an interchangeable fixture environment.

### Recheck — 2026-10-26, approximately 11:29 UTC

API routing responded again: `/api/info` returned 200 over HTTPS with certificate verification disabled and over HTTP; `/api/api-docs` returned 200 over HTTP (the HTTPS schema request timed out). The observed API build was **feature-pipelines-2890**, `HEAD-23734b90d33575d8ff349e49a14b3a84851ec3dc`, rather than the previously inspected 2891. The fresh OpenAPI SHA256 was `16c47e2cf9911588740fe4c5634d0cbf5a89f8ea72c56b2da8f3553e69b49b1d`.

Authenticated HTTPS reads of the `superadmin_personal` quality standard and GitHub Actions integrations both returned **401 Unauthorized** using the configured ReportPortal credential. No credential value was logged; no authenticated HTTP request or mutation was made. Fixture creation remains blocked by authentication; the 401 responses alone do not establish why the credential was rejected.

The currently observed schema also lacks `stageKey` in both stage response DTOs, the single-pipeline GET and the pipeline-list `name` parameter (only `search` is published). Backend changes verified against build 2891 must therefore be re-established on this environment before treating those ACs as currently available. This is an observed build/contract difference, not a confirmed deployment root cause.

## Authenticated setup and integration blocker — 2026-10-26

After the user replaced the ReportPortal token, the Quality Standard and project integration reads returned **200**. The project has one valid existing criterion. Certificate verification remained disabled only for the explicitly authorized operator HTTPS requests; no token value was logged and no authenticated HTTP request was made.

The isolated synthetic fixture was created and read back successfully:

| Field | Observed value |
|---|---|
| Project | `superadmin_personal` |
| Label | `R6-dispatch-probe-20261026T113919Z-76718537` |
| Case / display ID / default version | `8` / `TC14` / `8` |
| Origin / lifecycle / controlled score | `AI` / `DRAFT` / `72`, current evaluation (`obsolete: false`) |
| Folder / pipeline / source iteration IDs | `2` / `2` / `2` |
| Source linkage | Passed stage, matching `TEST_CASE` target in both RESULT cells and derived `relatedEntities` |

These are technical dispatch fixtures, not real agent output. The helper now accepts an omitted stage response `stageKey` for the observed 2890 contract only when the actual case target, derived relationship and PASSED state are confirmed; a present wrong key is rejected. This does not infer semantic stage identity from a name/sequence or enable specialized frontend panels. **12 offline tests PASS.**

The logging-only workflow is committed separately in [draft PR #5856](https://github.com/reportportal/service-ui/pull/5856), targeting `develop`, commit `374130515c14aa7bd5c2468d60a73b667f735ff8`. Workflow YAML, trigger/permissions/input checks, six negative input cases and `git diff --check` passed. Local/remote/PR commit identities matched. It has not been merged or dispatched; CI completion is tracked separately. The primary R6 branch's fixture tooling and documentation remain local changes.

### Backend handoff: creation rejects an enabled built-in integration

Both project and global GitHub Actions integration reads returned empty lists. `GET /api/v1/plugin` nevertheless lists `github-actions` as **enabled**, `pluginType: BUILT_IN`, type `9000`.

The documented `POST /api/v1/integration/superadmin_personal/github-actions` body shown above, with securely supplied credentials, returned **HTTP 400**, `errorCode: 40016`, message:

```text
Error in handled Request. Please, check specified parameters: 'Plugin for  isn't installed'
```

A second diagnostic attempt was made only after confirming the first rejection and an empty project configuration; it reproduced the same error. No integration was created. No automatic mutation retry or alternative provider-field guessing was used.

Source inspection at the exact observed backend revision `23734b90d33575d8ff349e49a14b3a84851ec3dc` explains the routing mismatch:

- [IntegrationConfig](https://github.com/reportportal/service-api/blob/23734b90d33575d8ff349e49a14b3a84851ec3dc/src/main/java/com/epam/reportportal/base/core/configs/IntegrationConfig.java) registers special integration services for `email` and `qa-space`, not `github-actions`.
- [CreateIntegrationHandlerImpl](https://github.com/reportportal/service-api/blob/23734b90d33575d8ff349e49a14b3a84851ec3dc/src/main/java/com/epam/reportportal/base/core/integration/impl/CreateIntegrationHandlerImpl.java) resolves the type from the URL and falls back to the basic service.
- [BasicIntegrationServiceImpl](https://github.com/reportportal/service-api/blob/23734b90d33575d8ff349e49a14b3a84851ec3dc/src/main/java/com/epam/reportportal/base/core/integration/util/BasicIntegrationServiceImpl.java) requires a PF4J `ReportPortalExtensionPoint` before collecting create parameters and throws the matching error when it cannot obtain one. Being listed as a built-in type does not supply that instance.

**Requested backend correction:** route built-in automation integrations to their supported integration service, preserving parameter validation and secret encryption. Then retry the same documented request and verify `201` plus one matching enabled project integration through sanitized reads. The current request schema contains only `name`, `integrationParameters` and `enabled`; no extra required provider field is published. The current rejection is not evidence that the GitHub PAT lacks Actions permission; that permission remains unverified until the provider path can be exercised.

**Next gates:** fix integration creation on the backend and merge the reviewed workflow into the repository default branch before one explicit Push on case `8`. A green logging probe can establish delivery only; the separate result callback/real agent and four terminal R6 outcomes remain outstanding. No Push or fix round was started in this setup.

## Readiness recheck — backend 2893, 2026-10-26

The previous integration-creation blocker is **resolved on the observed build**: `/api/info` now reports `feature-pipelines-2893`, `HEAD-770d0ea4697c746db580c2012fe8471a002c6408`. At this revision, the integration service mapping includes both built-in CI providers through `CiTriggerIntegrationService`.

After confirming an empty project configuration, the previously authorized integration creation was retried once. It returned **201**, integration ID **3**. A sanitized project read verified one enabled matching configuration: `repo: reportportal/service-ui`, `ref: develop`, `fixWorkflowRef: fix-test-case.yml`. The existing fixture remains AI/Draft `TC14`, case/default-version `8`, score `72`, source iteration/pipeline `2`/`2`.

Fresh OpenAPI confirms required `stageKey` in both stage response schemas, the single-pipeline GET and the pipeline-list `name` filter. The stage DTO schema keys are fully qualified Java names in this document; looking up only a bare `PipelineStageRS` key would incorrectly report the field absent. The actual source response now includes `upload` and `review` stage keys.

[PR #5856](https://github.com/reportportal/service-ui/pull/5856) is still open/draft and unmerged at commit `374130515c14aa7bd5c2468d60a73b667f735ff8`. Both exact-head Build runs and the Sonar checks completed successfully. The workflow is still absent from `develop`; merging/publishing it remains a dispatch prerequisite.

Repository-level Actions secrets were inspected by name only: no ReportPortal callback credential is configured at that level. Organization/environment-level credentials were not established by this check. The current logging-only workflow does not need a ReportPortal secret; a future callback simulator does. Creating the integration validates required parameters, not GitHub PAT access or workflow execution; those remain unverified until actual dispatch.

**Implementation can proceed** for the controlled callback simulator: read current case/round, register linked N+1, submit the atomic result, then finish stages. For full runtime acceptance, publish the workflow, securely provision the callback credential and execute the four R6 outcomes. No Push or workflow run was started during this readiness check. The operator-only certificate-verification exception remains scoped to this user-authorized environment; helper defaults were not changed.
