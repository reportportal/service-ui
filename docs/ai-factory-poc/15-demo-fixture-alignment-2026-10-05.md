# 15 · T6.4-F demo fixture alignment evidence · 2026-10-05

> Jira: [EPMRPP-122047](https://jiraeu.epam.com/browse/EPMRPP-122047)
>
> Branch: `EPMRPP-122047-ai-factory-demo-fixture-alignment`
>
> Remote writes: **No**

## Implemented boundary

- The overlay preserves the real Test Case scenario and registers only its visible step ids for the
  matching real-case alias.
- Seeded logical step targets are projected onto those visible ids when local review comments are
  read through the real numeric case id. The canonical seed remains unchanged and no remote scenario
  content is manufactured.
- TC107 starts from a clean mock seed with one pending review comment, enabling its scripted first-push
  `job timeout` path.
- TC106 has a deterministic successful fix score of `81 → 92`, followed by the existing Auto-Ready
  evaluation.

## Validation

| Check | Result |
|-------|--------|
| Focused mock/overlay Jest | PASS · 2 suites / 66 tests |
| Full Jest | PASS · 158 suites / 1440 tests |
| TypeScript | PASS · `tsc --noEmit` |
| Focused ESLint | PASS · 0 errors |
| Full lint | PASS · exit 0; repository baseline warnings only |
| Diff whitespace | PASS · `git diff --check` |
| Node 20 dev compile | PASS · webpack compiled successfully in 43.4 s |
| TC106 browser target | PASS · authenticated localhost details showed `1 not sent` and `1 comment` on the real case's only visible step |
| TC107 clean-seed browser timeout | NOT RUN · the user requested preserving the current browser-local demo data, so Reset demo and Push were not used |
| Remote transport observation | PASS · proxy output showed GET requests only; no remote POST, PUT, PATCH or DELETE |
| Cleanup | PASS · dev server shut down gracefully and browser-local demo data was left unchanged |

## Completion boundary

The code and automated regression are complete, and the original TC106 target mismatch is visibly
resolved without replacing the real scenario. A full-green browser rerun of rehearsal step 12 is not
claimed in this evidence: exercising the new TC107 seed requires a clean local mock baseline, while the
user explicitly requested that the existing demo state remain untouched. Run Reset demo and repeat
steps 11–12 only when preserving that local state is no longer required.
