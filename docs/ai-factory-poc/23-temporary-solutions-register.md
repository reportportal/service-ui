# Temporary solutions and mock removal register

**Updated:** 2026-10-19. This is the cleanup checklist for the AI Factory PoC. An implemented UI
screen does not mean its data is live. Update the relevant row in the same FE task that replaces a
mock or provisional behavior; remove the runtime fallback when its replacement has been verified.
The current integration sequence and Jira owners are in [21](21-live-pipeline-integration-2026-10-18.md),
and the progress board is [00](00-status.md).

| ID | Temporary solution / location | Removal condition | FE task / status |
|---|---|---|---|
| TMP-01 | Development mock backend: `app/src/controllers/aiFactory/mocks/` (seed, local DB, HTTP handlers, business rules) and its conditional install in `app/src/index.jsx`. `ai_factory_mocks` defaults to enabled when the feature is on in development. | Replace each endpoint group with a verified real API and remove its handler, seed-dependent runtime logic and mock-only view model. Remove the shared installer, storage switch and remaining mock DB only after **all** groups are live or explicitly retired. | Across integration tasks; **active**. |
| TMP-02 | Postman-derived empty LP1 fallback: `pipelines/temporaryPostmanFallback.ts`, `postman-demo` transport/saga branches and the demo notice. It uses synthetic IDs and is enabled only by `ai_factory_transport`. See [22](22-temporary-postman-empty-fallback.md). | Remove the fixture, branches, notice and its setup documentation after the LP1/LP2/LP3 read path and empty states are verified against real GET payloads. The Postman write bodies do not prove a GET response shape. | [EPMRPP-122412](https://jiraeu.epam.com/browse/EPMRPP-122412), [EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413); **active**. |
| TMP-03 | Mock-default Pipeline transport and closed normal live catalog/detail rollout gates in `pipelines/transport.ts`; `ai_factory_transport=postman-demo` explicitly permits read-only LP3 when LP1 is nonempty. | Replace the hard gates/temporary mode with the agreed rollout control after contract, permission, authenticated payload, error/empty and QA checks for each scope. Close LP1/LP2 and LP3 independently; opening a gate alone is not a completed integration. | [EPMRPP-122411](https://jiraeu.epam.com/browse/EPMRPP-122411)–[EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413); **active**. |
| TMP-04 | Client-side Pipeline/iteration search in `pipelinesPage/pipelinesListUtils.ts`, and assumptions that all iterations can be loaded into the page. | Use the backend search and pagination contract, including project changes and multi-page results; remove the client-only completeness assumption after verifying these paths. | [EPMRPP-122412](https://jiraeu.epam.com/browse/EPMRPP-122412); **active**. |
| TMP-05 | Rich Pipeline details, polling and comparison data represented by mock models and `mock-rich` handling in `pipelines/sagas.ts` and the Pipeline pages. The reduced API view now displays LP2 metrics and LP3 generic sections, but specialized panel semantics and Library joins remain provisional. | Replace each panel with validated backend fields or an explicit unavailable state. Remove mock-only parsing/presentation only when LP3 sections, stable stage identity, polling and LP4 compare semantics are proven for that panel. | [EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413), [EPMRPP-122414](https://jiraeu.epam.com/browse/EPMRPP-122414), [EPMRPP-122417](https://jiraeu.epam.com/browse/EPMRPP-122417); **active**. |
| TMP-06 | Mock-backed Pipeline settings, Review/Library case join, Test Case lifecycle/comments/fix rounds and automation overlays in `mocks/handlers.ts` and `mocks/overlay.ts`. The mock can enrich real TMS cases by a matching demo `displayId`; those are not live AI Factory records. | Remove each mock handler/overlay only after the corresponding published DTO, identity and permissions are verified with real project data. Settings and Review/Library have Pipeline tasks; other C/L/R/F/A contracts remain tracked in [10](10-backend-integration-contract.md). | [EPMRPP-122415](https://jiraeu.epam.com/browse/EPMRPP-122415), [EPMRPP-122416](https://jiraeu.epam.com/browse/EPMRPP-122416), then remaining contract groups; **active**. |
| TMP-07 | Demo reset and persisted `ai_factory_mock_db_v1` in the mock DB and Pipeline page. | Remove when no runtime mock data remains. Reset must never be repurposed to mutate remote project data. | Final mock cleanup; **active**. |

## Rule for closing a row

For the relevant FE task, record the real endpoint and response evidence, replace the consuming
path, verify loading/empty/error/permission states and toggle-off behavior, then delete the
corresponding runtime mock/fallback and update this row plus [00](00-status.md). Do not blend
mock values into a nonempty real response. Keep focused test fixtures that still verify the real
adapter or regression behavior; the removal target is demo data and runtime substitution.

The feature flag `show_ai_factory_poc` is a rollout control, **not** itself a mock-removal item.
Decide its lifecycle separately from these temporary data sources.
