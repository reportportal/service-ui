# T6.6-A · AI Factory implemented-surface NFR hardening

## Jira scope

Frontend-only NFR pass for AI Factory controls and layouts that already exist in `service-ui`.

### In scope

- audit and fix keyboard reachability and accessible names for the existing Approve, Push to agent,
  Automate and Discard actions;
- audit and fix AI Factory layouts at the supported 1280 px minimum viewport;
- regression-check the Test Case side-panel footer at 360 px;
- ensure every displayed pipeline-supplied cost uses two-decimal USD formatting and is identified to
  users as a pipeline estimate;
- preserve feature-toggle-OFF parity and existing permission gates;
- add focused automated coverage and authenticated browser evidence for the affected surfaces.

### Explicitly out of scope

- masked CI credential display, because the T3.6 CI connection UI is not implemented yet;
- Re-run and Retry actions, because T4.4 and its required UI/API contract are not implemented yet;
- backend/operations-owned security, reliability, idempotency, concurrency, performance, audit,
  retention and observability requirements;
- live-backend rollout or changes to demo fixtures and browser-local demo state.

The deferred credential and Re-run/Retry checks remain a follow-up NFR slice after T3.6/T4.4 land.

## Acceptance criteria

1. Existing Approve, Push to agent, Automate and Discard actions have an accessible name, correct
   native/button semantics and keyboard activation without granting additional permissions.
2. Current AI Factory pages have no horizontal clipping or overlapping primary actions at 1280 px.
3. The Test Case side-panel footer remains usable at 360 px.
4. Every rendered monetary value is formatted as USD with exactly two decimal places; estimate
   surfaces explicitly identify the value as supplied/estimated by the pipeline.
5. The AI Factory feature toggle remains OFF by default and toggle-OFF behavior is unchanged.
6. Focused tests, type-check, lint, diff inspection and authenticated viewport checks pass, with any
   unrelated baseline failure documented separately.

## Estimate

Original Estimate: **8 h**.

- Research: **2 h** — inventory current controls, cost renderers and responsive hosts; establish
  1280/360 browser baselines.
- Implementation: **4 h** — apply narrowly scoped accessibility, wording and responsive fixes plus
  focused tests.
- Validation: **2 h** — focused/full checks as proportionate, authenticated viewport walkthrough,
  toggle-OFF safeguard and documentation synchronization.
