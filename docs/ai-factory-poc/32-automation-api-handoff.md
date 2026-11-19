# Automation API handoff

This is the proposed contract behind the Service UI implementation of `Send to automation`. Please confirm the routes, DTOs and error semantics against the implementation before enabling the flow on a shared environment.

Requirements are [US-015 — Send Ready Test Cases to automation](https://git.epam.com/EPM-RPP/reportportal-requirements/-/blob/main/domains/projects/df_bootcamp_2026/stories/US-AI-FCTRY-015-send-ready-test-cases-to-automation.md), [US-016 — Report automation iterations](https://git.epam.com/EPM-RPP/reportportal-requirements/-/blob/main/domains/projects/df_bootcamp_2026/stories/US-AI-FCTRY-016-report-automation-iterations-to-reportportal.md), [US-017 — Link automation results](https://git.epam.com/EPM-RPP/reportportal-requirements/-/blob/main/domains/projects/df_bootcamp_2026/stories/US-AI-FCTRY-017-link-automation-results-to-test-case.md) and [US-019 — Connect a pipeline to CI](https://git.epam.com/EPM-RPP/reportportal-requirements/-/blob/main/domains/projects/df_bootcamp_2026/stories/US-AI-FCTRY-019-connect-pipeline-to-ci.md).

## Test Case reads

Add `automationState` to the native Test Case details and every row of the project-scoped Test Case list. Keep the existing top-level `status` (`DRAFT` or `READY`). The list may omit result references. Details should return the available references and results below. Project members who can read a case may read its automation state, regardless of start permission.

```json
{
  "status": "READY",
  "automationState": {
    "ciConnection": "CONNECTED",
    "fixInProgress": false,
    "status": "IN_PROGRESS",
    "scenarioChangedAfterAutomation": false,
    "iteration": { "pipelineId": 17, "iterationId": 452, "number": 8 }
  }
}
```

| Field | Contract |
| --- | --- |
| `ciConnection` | `CONNECTED`, `NOT_CONNECTED` or `CONNECTION_FAILED`. Report the effective state of the **Test automation** pipeline that would handle the request. |
| `fixInProgress` | Boolean. Report whether the case has an active fix round so list and off-page selections can be evaluated. |
| `status` | `NOT_AUTOMATED`, `IN_PROGRESS`, `AUTOMATED` or `FAILED`. Publish `NOT_AUTOMATED` explicitly for cases that have never been sent. |
| `scenarioChangedAfterAutomation` | Boolean. Set it from authoritative scenario/version state when the current scenario differs from the automated one. |
| `iteration` | `{ pipelineId, iterationId, number }`. Required in case details while an accepted iteration is in progress and after it completes. The list may omit it. Use the IDs returned by the start operation. |
| `launch` | Optional `{ id, name, number }` for the linked ReportPortal Launch. |
| `mergeRequest` | Optional `{ id, state }`, where `id` is a string and `state` is `OPEN`, `MERGED` or `CLOSED`. |
| `lastResult` | Optional `{ status, defectType? }`, where `status` is `PASSED` or `FAILED` and `defectType` is a display string. |

All numeric IDs and display numbers used here must be positive safe integers. Omit optional objects until available. Publish `automationState` only when the project has the automation API enabled. An omitted field keeps the current preview in the Test Case menu. A disconnected or failed CI state in a valid payload disables the live action and shows the CI hint. Supply consistent CI state across all rows in a project so multi-page selections are eligible for the same pipeline.

After a successful start, `GET /v1/project/{projectKey}/tms/test-case/{testCaseId}` should immediately return the accepted case's current automation state and iteration reference. The frontend refreshes that read in the background until the case reaches a terminal state. The iteration must be accessible at the published Pipeline Iteration read route to users who can open the case. Include real automation stage payloads and final Launch linkage for US-016 validation.

## Environments

Proposed route `GET /v1/project/{projectKey}/tms/automation/environment`.

```json
{
  "environments": ["beta5", "qa"],
  "default": "beta5"
}
```

Return the ordered list configured for the automation job in CI, with unique, nonempty values. Its first entry is the default. Return a defined error if the configuration has no usable environment. The frontend keeps `Send` unavailable while the list is loading or invalid and offers a retry on failure.

## Start automation

Proposed route `POST /v1/project/{projectKey}/tms/automation`. A single case and a bulk selection use the same operation.

```json
{
  "testCaseIds": [42, 43],
  "environment": "beta5",
  "confirmReautomate": false
}
```

Authorize the action for project Editors and other roles with automation permission. Resolve the automation pipeline and the requested Library case IDs within the project. Recheck CI and environment availability, native case status, active fix rounds and in-progress automation at dispatch time. The browser calls ReportPortal. ReportPortal starts the CI job, and CI reads the cases from Library.

Return one iteration for all accepted cases. On success return `202 Accepted` with the following structure.

```json
{
  "iteration": { "pipelineId": 17, "iterationId": 452, "number": 8 },
  "accepted": [42],
  "skipped": [{ "id": 43, "displayId": "TC43", "reason": "AUTOMATION_IN_PROGRESS" }]
}
```

`accepted` and `skipped` are disjoint and cover exactly the IDs submitted in that request, each once. The UI may filter some locally known ineligible cases before sending the command, so include only submitted IDs in the response. Report race-time case ineligibility with stable reasons (`NOT_READY`, `FIX_RUNNING`, `AUTOMATION_IN_PROGRESS`). If every case is ineligible, return an error and start zero iterations. The UI clears only accepted selections and retains skipped rows for review.

For already automated cases requiring confirmation, return `409` with `reason: "ALREADY_AUTOMATED_CONFIRM_REQUIRED"` and a top-level `testCaseIds` array containing the affected subset of the submitted IDs. The request must have no start side effects. On confirmation the UI submits `confirmReautomate: true` and `confirmedTestCaseIds` with the IDs the user saw and confirmed. If any additional case now needs confirmation, return `409` with the current required set before starting the job.

For a denied or unsuccessful start, return a stable machine-readable error and avoid persisting a successful start or leaving an orphan iteration. Confirm the final status codes, error reason keys and whether a safe explanation is available for CI rejection, lost connection, forbidden operations and changed eligibility. The current dialog has a generic start error plus the structured confirmation case. The backend owns deduplication and concurrent validation. Please confirm the idempotency strategy for retries after ambiguous network failures.

## Backend review and joint verification

- Confirm the versioned URLs, effective CI states, field names and status values. Supply examples for a brand-new case, a connected case, disconnected CI, an active fix round, a running iteration and an automated or failed result.
- Supply a permitted Editor and a read-only Viewer in a test project with a configured Test automation job. Verify single and bulk send, repeat confirmation, partial acceptance, rejection with no orphan iteration, and the iteration/Launch links from a real run.
- Supply a representative automation iteration with Prepare, Develop, Review and Fix results and confirm how the producer links the final Launch and Library Test Case IDs. CI credentials stay on the server.
- Disable the existing AI Factory development mocks for the joint verification so requests reach the real API.
