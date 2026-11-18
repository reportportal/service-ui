# Backend contract follow-up: fix history, unit traces and native AI metrics

Date: 2026-11-18. Related story: EPMRPP-123551. PR target: `bootcamp-prototype`.

This follow-up supersedes the missing-history and missing-metrics assumptions in the 2026-11-17 handoff. It does not establish that a production agent has completed the full fix journey.

## Confirmed deployed API

TMS reports API `feature-pipelines-2929`, revision `723445217583298cb6f8052aaa4e243bc29c278e`.

- `GET /api/v1/project/{projectKey}/tms/test-case/{testCaseId}/review/fix-round` returns the case's rounds, latest first, without comments. Generation Review selects rounds by exact `previousIterationId`. Failed/pending rounds remain visible without a trace link when no result iteration exists.
- A result iteration, including one from a failed fix, supplies the fix trace. Navigation must resolve the actual unique fix-stage key and validate source/result provenance. There is no aggregate Review-stage trace.
- Trace events optionally contain an opaque `unitKey`. Unknown/missing keys belong to the stage. Names must come from the selected attempt's snapshot.
- Native cases expose metrics and optional `unsentReviewComments`. Missing metrics is valid; zero tokens/cost/score are valid. Iteration numbers are labels, while iteration IDs resolve the pipeline route.

## Producer decisions still needed

1. Confirm the units section key and name-column convention. The UI uses exact section key `units`, row key matching, and `cells.name` with the row key as fallback. It does not guess from other sections or event targets.
2. Confirm actual GRADERS payloads and snapshot model/token/cost keys. The backend stores these as producer data; the structured UI is a tolerant projection with raw JSON retained.
3. Cache tokens, criterion reasons and iteration cost share are absent. The UI must not manufacture them.
4. Trace GET remains unpaged. Virtualization limits DOM work, not response bytes or JSON memory. Production size measurements should drive a future `fromSeq`/`limit` decision.
5. Legacy transcript strings remain legacy data; the frontend does not convert them to trace events.

## Live verification scope

Authenticated GETs succeeded on 2026-11-18 for `superadmin_personal`:

- Case ID 9 / TC15: native AI READY, score 72, one criterion, zero input/output tokens and cost, iteration ID 11 / number 1, one unsent comment. This is an existing controlled integration fixture.
- Case 9 history: rounds 11 and 8, both FAILED, source iteration 11, neither has a result iteration. This verifies the no-result history case, not failed-result trace navigation.
- A separate explicitly synthetic pipeline ID 10 / iteration ID 44 / stage `unit-trace` stores two attempts. Current attempt has five events: two known-unit events and three stage events, including an unmatched key. Historical attempt uses a different unit name. No CI/agent was executed to create this fixture.

Local UI checks and automated validation are recorded below after implementation. A deployed frontend and a real producer-to-result run are separate verification steps.

### Local frontend against the real TMS API

Browser session on `http://127.0.0.1:3001/`, native data mode (no mock transport):

| Scenario | Observed result |
| --- | --- |
| Unit trace attempt 2, All events | Five events, known unit names and Stage labels visible. |
| Stage filter | Three events, including the unknown `unitKey`. |
| Sign-in unit filter | One event. |
| Switch to attempt 1 | Two events, historical unit name `Historical sign-in`; filter resets to All. |
| TC15 native details | Criterion 72/100, evaluated time, skill, input/output tokens 0, current-version cost $0.00, one unsent comment. |
| TC15 persisted history | Both failed rounds shown newest first, timestamps and reasons visible; no trace action for either missing result. |
| Native metrics Iteration #1 action | Resolved ID 11 to pipeline 5 and opened its iteration page. |
| Generation Review round chooser | Both TC15 source-linked failed rounds displayed without result links. |

No review comments were changed and no Push/retry/CI action was triggered during these browser checks. Positive FAILED + result trace navigation and a real producer's units schema remain unverified on the live environment; automated fixtures cover the navigation contracts.

## Review corrections

Independent review identified and corrected two integration risks before publication: Library trace navigation now validates the previous/result iteration pair (same pipeline, distinct IDs and coherent `rerunOf` when supplied), and non-deleting review refreshes explicitly preserve Library pagination instead of using deletion-oriented page adjustment. The same trace validation also applies to the current-round link.

## Automated validation

- Related Jest run: **94 suites / 1,113 tests PASS**. Includes all AI Factory tests, trace controller, native case normalization, Library list/sidepanel and case detail integration.
- Independent code review: **PASS after both corrections**; targeted provenance/history/action regression run: **3 suites / 53 tests PASS**.
- Independent security review and final provenance recheck: **PASS**.
- Full `npm run lint` (TypeScript, ESLint, Stylelint): **PASS**, 0 errors; existing repository warnings: 122 ESLint / 200 Stylelint.
- Final production webpack build: **PASS**.
- Module cycle check: **PASS**, no circular dependency found.
- `git diff --check`: **PASS**.
