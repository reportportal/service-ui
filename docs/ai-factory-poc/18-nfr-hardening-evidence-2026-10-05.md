# T6.6-A · Implemented-surface NFR hardening evidence · 2026-10-05

## Scope and safety

- Jira: [EPMRPP-122049](https://jiraeu.epam.com/browse/EPMRPP-122049).
- Branch: `EPMRPP-122049-ai-factory-nfr-hardening`.
- Original Estimate: 8 h, recorded as 2 h research / 4 h implementation / 2 h validation.
- The walkthrough was read-only. No Reset, Push, Save or other mutation was performed, and browser-local
  demo data and mock fixtures were left unchanged.
- Masked CI credentials and Re-run/Retry remain excluded until T3.6 and T4.4 implement those controls.

## Audit results

### Existing actions

Approve, Push to agent, Automate and Discard already render as native `button` elements with visible
accessible names and keyboard focusability (`tabIndex=0`). Permission and disabled-state behavior remains
unchanged, so no action-semantics remediation was necessary.

### Responsive layouts

Authenticated checks found no horizontal document overflow on the Pipelines page, iteration details or
Test Case details at 1280 × 800. At 360 × 800, the Test Case Library side panel had no horizontal overflow
and its More actions, Open Details and Add to Test Plan footer controls were visible and unclipped.

### Cost provenance and formatting

The shared cost formatter already produced exact two-decimal USD values. The evidenced gap was provenance:
several surfaces showed only `$0.88` or a generic `Cost` label. Localized `Pipeline estimate` wording is now
used by:

- the shared cost label, including approximate and exact variants;
- Pipeline iteration-card metadata;
- iteration-detail KPI, fix-round column and token-usage summary;
- comparison KPI and stage labels;
- Generation cost heading and formula.

Authenticated post-change checks showed labels including `Pipeline estimate $0.88`, `Pipeline estimate`,
`Pipeline estimate · ≈ $0.41` and `Pipeline estimate: $1.62 ÷ 4 cases = $0.41`, with no 1280 px overflow.

## Automated validation

- Focused Jest: 7 suites / 39 tests passed.
- Full Jest: 158 suites / 1440 tests passed.
- TypeScript: `npm run type-check` passed on Node 20.19.1.
- Full lint: exit 0; 0 errors and 199 unrelated existing warnings.
- Runtime: development compilation and hot reload completed successfully.
- Feature toggle: no toggle/default/route/request code changed; the completed T6.5 toggle-OFF regression
  remains the applicable safeguard.

## Completion boundary

T6.6-A is complete for controls and layouts currently implemented in the frontend. This evidence does not
claim the backend/operations-owned security, reliability, performance, audit, retention or observability
parts of US-018, nor behavior for controls that do not yet exist.
