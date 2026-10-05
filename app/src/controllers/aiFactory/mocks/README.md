# AI Factory mock backend

Implements every endpoint in [`docs/ai-factory-poc/05-backend-contract.md`](../../../../../docs/ai-factory-poc/05-backend-contract.md)
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
| `handlers.ts` | Registers every P/C/L/R/F/A endpoint on a `MockAdapter`; simulates fix rounds and automation with `setTimeout` |
| `overlay.ts` | Merges AI/lifecycle fields onto **real** TMS test-case responses, matched by `displayId` (Mode A — see below) |
| `index.ts` | `installAiFactoryMocks(axiosInstance)` — the only thing outside this folder should import |

## How it's wired in

`app/src/index.jsx` dynamically imports this folder and calls `installAiFactoryMocks(axios)` only when:

1. `isAiFactoryEnabled()` is true (the feature toggle), **and**
2. the build is not `production`, **and**
3. `isAiFactoryMocksEnabled()` is true (localStorage `ai_factory_mocks`, default on).

With the toggle off, none of this code is even fetched (it's a separate webpack chunk) — see the
toggle-OFF checklist in `03-frontend-architecture.md` §3.

## Mode A — Overlay

The mock adapter is installed with `onNoMatch: 'passthrough'`: every request to a real endpoint
(folders, existing test cases, plans, launches) reaches the real backend untouched. `overlay.ts`
then enriches `GET tms/test-case` and `GET tms/test-case/{id}` responses with the AI/lifecycle
fields, matched by `displayId` against the mock db.

**What this means today:** the merge function and interceptor are real, tested code
(`overlay.test.ts`). What is *not* wired up yet is actually creating AI-marked cases in a real
project — that writes to a shared dev backend, and the target project/folder is still open
(Q-ORG-07 in `docs/ai-factory-poc/06-open-questions.md`). Until that's answered, the overlay only
enriches responses for cases that happen to share a `displayId` with the seed (`TC101`…`TC108`).
Detecting a real scenario edit (`SCENARIO_CHANGED`) is deferred for the same reason.

## Demo controls

Use the supported **Reset demo** action on the Pipelines page to restore `seedData.ts`. It resets only
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
instance and calls every P/C/L/R/F/A endpoint at least once, advancing fake timers for the async
ones). `overlay.test.ts` covers the merge mechanism. Run them all:

```bash
npx jest src/controllers/aiFactory
```
