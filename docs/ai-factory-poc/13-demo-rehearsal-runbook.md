# 13 · AI Factory demo rehearsal runbook

> T6.4-P prepares this procedure; it does **not** execute or complete T6.4. A rehearsal is complete only
> when steps 1–17 have dated evidence (or an explicit blocker) and step 18 is recorded as not applicable.

## 1. Safety boundary

- Run only from a local development build. The mock database is browser-local; `Reset demo` is not a
  backend rollback.
- Do not create, edit or delete remote Test Cases, folders, plans or launches merely to make the demo pass.
- Q-ORG-07 is a stop condition. If an approved remote project/folder and remote restoration owner have not
  been named, do not seed the shared backend.
- If TC101–TC108 are absent from the selected project's Test Case Library, record the affected steps as
  `BLOCKED — Q-ORG-07 / matching remote cases absent` and stop those flows. Do not improvise remote data.
- Never copy production tokens, bypass TLS, change role assignments or use another person's credentials.
- Mutating demo actions are allowed only against the local mock contract. If DevTools shows a mutation going
  to a real endpoint rather than the mock adapter, stop before confirming it.

## 2. Environment preflight

Record the result beside every item before opening a demo flow.

| Check              | Required evidence                                                                                 | Result |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------ |
| Repository/branch  | `git status --short --branch`; record exact branch and HEAD                                       |        |
| Node               | Node `20.x`; record `node --version`                                                              |        |
| Dependencies       | Existing `app/node_modules`; do not reinstall during rehearsal unless separately approved         |        |
| Proxy              | `PROXY_PATH` points to the intended dev backend; record hostname only, never credentials          |        |
| Start              | From `app/`, run `npm run dev`; capture successful compile and `http://localhost:3000`            |        |
| Authentication     | Sign in through the normal localhost flow; record account name and time, not secrets              |        |
| Project            | Record organization, project and folder. Confirm the project is approved for the rehearsal        |        |
| Role               | Record Viewer/Editor/Organization Manager/Administrator and expected controls for that role       |        |
| Feature flag       | On localhost: `localStorage.setItem('show_ai_factory_poc', 'true'); location.reload()`            |        |
| Mock mode          | Ensure `localStorage.getItem('ai_factory_mocks') !== 'false'`; mock mode must be enabled          |        |
| Transport          | Confirm the mock overlay is active and the LP1–LP3 live gates remain closed                       |        |
| Baseline           | Use the Pipelines-page **Reset demo** action; after reload, confirm the seed Pipelines/iterations |        |
| Library identities | Search TC101–TC108. Record which rows exist. Absence activates the Q-ORG-07 stop rule             |        |
| Viewports          | Prepare desktop evidence and a 360 px viewport for the side-panel checks                          |        |
| Evidence location  | Create a dated folder/ticket attachment location; do not commit credentials or personal data      |        |

Do not begin step 1 if Node, proxy, authentication, project, feature flag or mock mode is unresolved. Steps
that need Test Case Library rows cannot begin unless the matching TC display ids already exist remotely.

## 3. Reset to the local baseline

Preferred path:

1. Open **Pipelines** in the local application.
2. Invoke **Reset demo** and confirm the destructive local reset.
3. Reload if the UI does not reload automatically.
4. Confirm generation and automation pipelines plus their seed iterations are back at baseline.
5. Confirm prior local fix-round/automation mutations no longer appear.

Emergency fallback, only when the supported UI action cannot be used:

```js
localStorage.removeItem("ai_factory_mock_db_v1");
location.reload();
```

Both paths affect only local storage for the current localhost origin. They do not restore any remote resource.

## 4. Rehearsal evidence template

For every step record: `PASS`, `FAIL`, `BLOCKED` or `N/A`; actual URL; account/role; viewport; timestamp;
screenshot/video reference; relevant Console/Network observation; and a short note. Do not tick the checklist
in [04-implementation-plan.md](04-implementation-plan.md) until the corresponding evidence is captured.

| #   | Flow and expected result                                                                                         | Required evidence                                                              | Result / evidence link |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| 1   | Pipelines list shows both pipelines and iteration cards with status, requirement, stages, score and cost         | Full-page screenshot; URL; no unexpected request error                         |                        |
| 2   | Generation Iteration #1 Grade shows per-case scores and expandable reasons, without PASS/FAIL semantics          | Before/after expansion screenshots; keyboard activation note                   |                        |
| 3   | Upload shows Draft/Ready and `Auto-Ready: 2 of 4 promoted (threshold 90)`                                        | Panel screenshot and iteration identity                                        |                        |
| 4   | Review shows Ready actor, unsent comments and fix rounds with cost                                               | Review-panel screenshot and row details                                        |                        |
| 5   | Compare #1 vs #2 shows suite `+4`, cost `+$0.13` worse and duration delta                                        | Selected iteration ids, comparison screenshot                                  |                        |
| 6   | Pipeline settings shows toggle, threshold 90, validation and read-only behavior appropriate to role              | Editable/read-only evidence with recorded role; no unauthorized mutation       |                        |
| 7   | Library review queue shows Status/AI quality, AI chip, quick filters and preset                                  | Library screenshot, active URL filters and result count                        |                        |
| 8   | TC106 side panel at desktop and 360 px shows status/evaluation, disabled add actions and Approve where permitted | Desktop + 360 px screenshots; overflow/focus notes                             |                        |
| 9   | TC106 Steps details shows the AI evaluation and lost-point reasons                                               | Details screenshot and expanded reason evidence                                |                        |
| 10  | TC103 shows about `$0.54` (`$0.32` share + `$0.22` fix round) and Pipeline links                                 | Cost/link screenshot; destination URLs                                         |                        |
| 11  | TC106 step 3 shows the pending comment, `1 not sent`, disabled Approve and Discard                               | Comment target/strip screenshot; keyboard/focus evidence                       |                        |
| 12  | TC106 Push progresses `81 → 92 → Auto-Ready`; TC107 first Push records job-timeout failure                       | Timestamped before/running/terminal evidence; Network confirms mock handling   |                        |
| 13  | TC103 remains Draft at 88 < 90, exposes Approve, and keeps add actions disabled                                  | Header/actions screenshot with role                                            |                        |
| 14  | TC104 Text template exposes comments on Precondition and scenario block                                          | Both comment targets and accessible names                                      |                        |
| 15  | Editing TC108 shows approval hint and `In plan · Launch blocked` after the scenario becomes Draft/Obsolete       | Before/after screenshots; do not save if request would be remote               |                        |
| 16  | TC105 Automate opens the dialog and a local automation iteration progresses with Fix Skipped                     | Dialog, iteration stages and terminal evidence; Network confirms mock handling |                        |
| 17  | TC101 Automation shows Automated, last result Passed, and safe iteration/Launch links                            | Section screenshot and internal-link destinations                              |                        |
| 18  | User flows tab exists only in the prototype and is not built in the product                                      | Record `N/A — prototype only`                                                  | N/A — prototype only   |

When a step is blocked by absent TC101–TC108, preserve the evidence of the search result and continue only with
independent Pipeline steps. Do not substitute a different remote case because the mock identity contract is keyed
to these display ids.

## 5. Post-run cleanup and ownership

1. Export/link all evidence and record failures or blockers before resetting.
2. Use **Reset demo** to restore the local mock seed. Use the emergency localStorage command only if the UI
   control is unavailable.
3. Optionally restore feature flags for the localhost profile:

   ```js
   localStorage.removeItem("show_ai_factory_poc");
   localStorage.removeItem("ai_factory_mocks");
   location.reload();
   ```

4. Stop the local dev server and record that it stopped.
5. Local cleanup ends here. Any remote data created under a separately approved Q-ORG-07 procedure must be
   restored by that procedure's named remote-data owner. The frontend operator must not infer permission to
   delete it, and `Reset demo` must never be cited as remote restoration evidence.

## 6. Rehearsal summary

| Field                              | Value                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Date/time                          |                                                                         |
| Branch / HEAD                      |                                                                         |
| Operator                           |                                                                         |
| Organization / project / folder    |                                                                         |
| Role                               |                                                                         |
| Browser / viewport(s)              |                                                                         |
| Steps PASS / FAIL / BLOCKED / N/A  |                                                                         |
| Q-ORG-07 status                    |                                                                         |
| Local reset before/after confirmed |                                                                         |
| Remote writes performed            | Must be `No`, unless a separate approved procedure and owner are linked |
| Remote restoration owner/evidence  | `N/A` when no remote writes occurred                                    |
| Evidence location                  |                                                                         |
| Follow-up defects                  |                                                                         |
