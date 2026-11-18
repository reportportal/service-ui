# AI Factory mock backend

Active runtime mock groups are listed in the
[November backend handoff](../../../../../docs/ai-factory-poc/31-backend-handoff-2026-11-18.md#where-mocks-and-ui-without-live-data-remain).
The [October removal register](../../../../../docs/ai-factory-poc/23-temporary-solutions-register.md) tracks earlier cleanup.

Implements the remaining mock endpoint groups in [`docs/ai-factory-poc/05-backend-contract.md`](../../../../../docs/ai-factory-poc/05-backend-contract.md)
on top of [`axios-mock-adapter`](https://github.com/ctimmerm/axios-mock-adapter), so the UI can be
built against a real HTTP contract before the backend exists. See
[`docs/ai-factory-poc/03-frontend-architecture.md`](../../../../../docs/ai-factory-poc/03-frontend-architecture.md)
§4 for the design this implements.

## Files

| File | What it does |
|------|--------------|
| `seedData.ts` | Fixture data ported from the UX prototype (pipelines, iterations, cases TC101…TC108, a plan, a launch) |
| `types.ts` | Internal record shapes (`MockCaseRecord`, …) — **not** the public contract; that's `types/aiFactory.ts` |
| `db.ts` | In-memory store: hydrates the seed, persists to `localStorage`, exposes finders and mutators |
| `engine.ts` | Pure backend rules: `deriveIterationStatus`, `applyAutoReady`, `caseCost`, `automateSkipReason`, … |
| `viewModels.ts` | Projects `db.ts` records into the contract's `*RS` DTOs |
| `handlers.ts` | Registers remaining P4/LP5/C/L/R/F/A endpoints on a `MockAdapter`; LP1–LP4 pass through to the real API; simulates fix rounds and automation with `setTimeout` |
| `overlay.ts` | Merges AI/lifecycle fields onto **real** TMS test-case responses, matched by `displayId` (Mode A — see below) |
| `index.ts` | `installAiFactoryMocks(axiosInstance)` — the only thing outside this folder should import |

## How it's wired in

`app/src/index.jsx` dynamically imports this folder and calls `installAiFactoryMocks(axios)` only when:

1. `isAiFactoryEnabled()` is true (the feature toggle), **and**
2. the build is `development`, **and**
3. `isAiFactoryMocksEnabled()` is true (localStorage `ai_factory_mocks`, default on).

With the toggle off, none of this code is even fetched (it's a separate webpack chunk) — see the
toggle-OFF checklist in `03-frontend-architecture.md` §3.

## Mode A — Overlay

The mock adapter uses `onNoMatch: 'passthrough'`. The overlay interceptor also rewrites selected Library filter requests, emulates pagination and overrides Review Queue totals with the local seed count. It enriches legacy case rows by `displayId` and adds provisional Test Plan Draft summary fields. Native case DTOs bypass per-case enrichment and mock scenario edit side effects. Disable `ai_factory_mocks` and reload to check backend filtering, counts and case data.

The overlay's demo fields are available on compatible legacy cases with seed IDs such as `TC101`…`TC108`. Native AI cases use the native case, Review and fix-round API contracts.

## Demo controls

The Pipelines page uses live LP1–LP3, so its **Reset demo** action is hidden. To restore the mock data used by other AI Factory features, clear the local DB as shown below. It resets only
the browser-local mock database for the current localhost origin. It does not delete, modify or restore
remote Test Cases, plans or launches. There is no floating dev menu and no implemented remote seeding action.

Browser console setup:

```js
// enable the feature + mocks, then reload
localStorage.setItem('show_ai_factory_poc', 'true'); location.reload();

// disable mocks but keep the toggle on (once real BE endpoints exist for a group)
localStorage.setItem('ai_factory_mocks', 'false'); location.reload();

// emergency local reset only, when the UI action cannot be used
localStorage.removeItem('ai_factory_mock_db_v1'); location.reload();
```

The emergency command works because the next load falls back to the compiled seed. It is not a remote rollback.
If TC101–TC108 do not already exist in the selected remote project, stop the rehearsal steps that need those
Library rows. Do not create them on the shared backend until Q-ORG-07 names an approved project/folder and a
separate owner/runbook defines creation and restoration.

## Known simplifications (see docs/ai-factory-poc/06-open-questions.md for the rest)

- **Async delay:** fix rounds and automation stages resolve after `SIMULATED_DELAY_MS` (1.5 s),
  not the 3–5 s the architecture doc mentions — close enough for a demo, easy to tune.
- **`lastAgentChange` before/after text:** the mock does not hold real scenario text (that lives
  in the real TMS case once overlay seeding exists), so it returns placeholder step arrays. The
  score before/after and round number are real.
- **Case lookup accepts either a numeric id or a `displayId`** in the mock (`findCase`), which is
  more lenient than the real backend will be — convenient for tests, not a claim about the final
  contract.
- **Fix-round outcomes:** TC106 exercises `PASSED`, TC107 fails once with `FAILED` and succeeds on
  retry, and TC105 exercises `GRADE_FAILED` after a review comment is added.

## Tests

`engine.test.ts` and `viewModels.test.ts` exercise the business rules and DTO shapes directly.
`handlers.test.ts` is the endpoint smoke test (installs a real `MockAdapter` on a scratch axios
instance and calls the remaining mock endpoints, advancing fake timers for the async
ones). `overlay.test.ts` covers the merge mechanism. Run them all:

```bash
npx jest src/controllers/aiFactory
```
