# 14 · T6.4 demo rehearsal evidence · 2026-10-04

> Jira: [EPMRPP-122046](https://jiraeu.epam.com/browse/EPMRPP-122046)
>
> Branch: `EPMRPP-122046-ai-factory-demo-rehearsal`
>
> Result: **15 PASS · 2 FAIL · 0 BLOCKED · 1 N/A**
>
> Remote writes: **No**

## Preflight

| Check                 | Result                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository            | `EPMRPP-122046-ai-factory-demo-rehearsal` at starting HEAD `90f9cfeb445b2edc42a73aed15d384e5167e8bb2`; worktree clean before documentation updates                                                                                    |
| Runtime               | The interactive shell initially reported Node `22.20.0`; the dev server was explicitly started with Node `20.19.1` and compiled successfully in 39.1 s                                                                                |
| Dependencies          | Existing `app/node_modules` present; no install or lockfile change                                                                                                                                                                    |
| Proxy                 | `PROXY_PATH` hostname: `tms.epmrpp.reportportal.io`; no credentials recorded                                                                                                                                                          |
| Authentication        | Normal localhost session was already authenticated as `tester admin` / `superadmin@domain.com`                                                                                                                                        |
| Context               | Organization `my-organization`; project `superadmin_personal`; observed Administrator controls                                                                                                                                        |
| Feature / transport   | AI Factory sidebar, Pipeline pages and case overlays were visible. Pipeline demo data and Reset demo were served by the local mock flow; LP1-LP3 live gates remained closed. Direct localStorage values were not exported as evidence |
| Baseline              | Reset demo confirmed before and after the rehearsal with `The local AI Factory demo was reset.`; only browser-local AI Factory demo state was reset                                                                                   |
| Remote identity check | TC101 was present on Library page 2; TC102-TC108 were present on page 3. The first search-based check was invalid because Library search filters by case name rather than display id; pagination/display-id inspection corrected it   |
| Safety decision       | The exact remote identities already existed, so no remote seeding or substitution was needed. The only mutations exercised were intercepted by the local mock overlay; no remote case, plan or launch was created, edited or deleted  |
| Viewports             | Desktop flows and the TC106 side panel at an explicit `360 × 800` viewport were inspected. The temporary viewport override was reset after the responsive check                                                                       |
| Transport observation | Dev-server proxy output contained remote GET requests for authenticated Library/folder lookups. No remote POST, PUT, PATCH or DELETE was observed; Push, Automate and Reset were handled by the local mock flow                       |
| Cleanup               | Post-run Reset demo confirmed; dev server shut down gracefully; port 3000 released                                                                                                                                                    |

## Step evidence

| #   | Result | Evidence / observation                                                                                                                                                                                                                            |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | PASS   | `/pipelines` rendered Test case generation and Test automation groups with iteration cards, status, requirement, stages, score and cost                                                                                                           |
| 2   | PASS   | `/pipelines/1/iterations/101` Grade showed TC101-TC104 scores `94 / 91 / 88 / 58`; TC104 expanded into all six criteria and reason text; no PASS/FAIL case verdict was shown                                                                      |
| 3   | PASS   | Iteration #1 Upload showed two `Ready (Auto-Ready)` and two Draft cases plus `Auto-Ready: 2 of 4 promoted (threshold 90)`                                                                                                                         |
| 4   | PASS   | Iteration #1 Review showed Ready actors, unsent-comment counts, and TC103 fix round `72 → 88` with cost `$0.22`                                                                                                                                   |
| 5   | PASS   | `/pipelines/compare?pipeline=1&baseline=101&candidate=102` showed suite `+4`, cost `+$0.13`, duration `+1m 32s` and the selected iteration identities                                                                                             |
| 6   | PASS   | Generation Pipeline settings opened for the Administrator with Auto-Ready enabled and threshold `90`; Save remained disabled because no value was changed. No PATCH was sent                                                                      |
| 7   | PASS   | Review-queue URL preserved `lifecycle=DRAFT&ai=AI&iteration=101`; Status Draft, AI, `Review queue · 5` and `Iteration #1` controls were active and Grade links were present                                                                       |
| 8   | PASS   | TC106 side panel was inspected on desktop and at `360 × 800`; status, AI evaluation, cost and accessible actions remained available without horizontal page overflow. Before Push, add actions and Approve were disabled by the Draft/review gate |
| 9   | PASS   | `/testLibrary/test-cases/2720` showed TC106 score `81`; an expanded criterion exposed the lost-point reason                                                                                                                                       |
| 10  | PASS   | TC103 showed about `$0.54`: `$1.27 ÷ 4 = $0.32` iteration share plus `$0.22` fix round; Grade and Review links were present                                                                                                                       |
| 11  | FAIL   | TC106 review strip reported `1 comment not sent`, but the actual remote case had one scenario step and both visible comment targets reported `0 comments`; the required step-3 pending thread and Discard evidence could not be shown             |
| 12  | FAIL   | Local mock Push completed TC106 as `81 → 91 → Auto-Ready`, not the required `81 → 92`. TC107 had `0 not sent`, so its first Push was disabled and the expected timeout path could not start                                                       |
| 13  | PASS   | TC103 remained Draft at `88 < 90`; Approve was enabled for the Administrator while Add to Launch and Add to Test Plan stayed disabled                                                                                                             |
| 14  | PASS   | TC104 Text template exposed separate accessible comment targets for Precondition and the scenario text block                                                                                                                                      |
| 15  | PASS   | TC108 showed Draft/obsolete plus `In plan · Launch blocked`; Edit Scenario exposed `Approve along with these changes`. The dialog was cancelled without a remote save                                                                             |
| 16  | PASS   | TC105 Automate opened the eligible-case dialog; the local mock created automation iteration `#2`, whose terminal stages were Prepare/Develop/Review Passed and Fix Skipped                                                                        |
| 17  | PASS   | TC101 Automation showed `Automated · Iteration #1`, Launch `#12`, MR `!212 · Open`, last result Passed, and safe internal iteration/Launch destinations                                                                                           |
| 18  | N/A    | Prototype-only User flows tab is intentionally not implemented in the product                                                                                                                                                                     |

## Completion boundary

This rehearsal is complete under the runbook rule that every step has a dated result. It proves 15 expected
flows in the selected environment and records two reproducible parity failures: the TC106 pending-comment
target does not match the remote scenario shape, and the Push fixtures/remote rows do not support the expected
TC106 `81 → 92` plus TC107 timeout sequence. No remote mutation was used to manufacture the missing state. A
follow-up must align the mock identity/comment fixtures with the approved remote cases before a full-green
rerun. The local Reset demo must never be treated as remote-data restoration evidence.
