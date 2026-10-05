# T6.5 toggle-OFF regression evidence — 2026-10-05

## Scope and safety boundary

- Jira: [EPMRPP-122048](https://jiraeu.epam.com/browse/EPMRPP-122048)
- Feature branch baseline: `77660e186`
- Comparison baseline: fetched `origin/develop` at `fee530755`
- Runtime: Node `20.19.1`, authenticated Chrome session, `http://localhost:3000`
- AI Factory was forced OFF only in a disposable detached worktree. The tracked branch, browser
  `localStorage`, mock database and demo fixtures were not reset or changed.
- Validation was read-only: navigation plus opening and cancelling Edit Scenario. No Save, Push,
  Reset, POST, PUT, PATCH or DELETE action was used.

## Result

**PASS.** Toggle OFF preserves the compared `origin/develop` UI and request behavior on the audited
surfaces. No production-code remediation was required.

| Surface | Toggle-OFF result | Comparison with `origin/develop` |
|---------|-------------------|----------------------------------|
| Project sidebar | Pipelines and Review queue are absent | No AI Factory navigation is added |
| Test Case Library | Base folders, table, search and filters remain available; AI quick filters and lifecycle presentation are absent | 62 accessible labels on each build; the only difference was a React-generated search-field token |
| Test Case side panel | Base metadata, scenario sections and standard actions remain available; AI status, evaluation, review and automation content are absent | Same base side-panel behavior |
| Test Case details | Base details header, content and actions remain available; lifecycle, score, approval and automation content are absent | 42 accessible labels on each build, exact label-set match |
| Edit Scenario | Base form opens; no lifecycle hint or Draft-to-Ready control is rendered; Cancel closes without mutation | Same base form behavior |
| Test Plans | Base page remains available; no Draft launch gate is applied while the toggle is OFF | 101 accessible labels on each build, exact label-set match |
| Manual Launches | Base page remains available | 100 accessible labels on each build; the only difference was a React-generated field token |
| Launches | Base page remains available; the standard `Automated Launches` navigation label is unchanged | 43 accessible labels on each build, exact label-set match |

## Request evidence

The toggle-OFF run issued only the existing read requests for folders, milestones, Test Case details,
attributes, manual launches and launches. It issued no AI Factory/Pipeline request and no mutation.
The `origin/develop` run issued the same class of baseline reads.

Both builds received the same backend/environment response for the Launch filter containing
`AGENTIC`: `invalid input value for enum launch_type_enum: "AGENTIC"`. Because it reproduces on the
exact fetched `origin/develop` baseline, it is recorded as backend/baseline drift rather than an AI
Factory toggle regression.

## Automated validation

Focused Node 20 Jest validation passed:

- 14 suites passed
- 106 tests passed
- coverage includes the feature flag and mock-mode gates, Library AI filters, lifecycle rendering,
  side effects/refetch/navigation, Edit Scenario lifecycle behavior, Add to Launch behavior, details
  automation/lifecycle behavior and AI backlinks

The source audit also confirmed that mock installation, Pipeline route thunks, sidebar entries,
Library filters/actions, side-panel/details AI content, Edit Scenario lifecycle behavior and Test Plan
Draft gating are all guarded by the same OFF-by-default feature flag.

## Completion boundary

T6.5 is complete for the requested toggle-OFF comparison. This evidence does not close the separate
T6.4-F clean-seed TC107 timeout rerun; that rerun still requires an explicitly allowed local demo Reset
and Push, which were intentionally not performed here.
