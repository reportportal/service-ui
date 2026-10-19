# Temporary solutions and mock removal register

**Updated:** 2026-10-19. This is the cleanup checklist for the AI Factory PoC. An implemented UI
screen does not mean its data is live. The user approved switching LP1–LP3 to API by default after
authenticated nonempty local-proxy evidence; trusted HTTPS, deployed SHA and error/multi-page checks
remain open. Update the relevant row when replacing mock or provisional behavior.
The current integration sequence and Jira owners are in [21](21-live-pipeline-integration-2026-10-18.md),
and the progress board is [00](00-status.md).

| ID | Temporary solution / location | Removal condition | FE task / status |
|---|---|---|---|
| TMP-01 | Development mock backend in `app/src/controllers/aiFactory/mocks/` remains for settings, comparison, Test Case and automation features. LP1–LP3 HTTP handlers were removed; the installer still runs for other groups in development. | Remove each remaining group with its verified API; remove the installer and DB when all groups are live or retired. | Across integration tasks; **partially removed**. |
| TMP-02 | Postman-derived empty LP1 fallback, synthetic LP2/LP3 and demo notice. | Removed from runtime and documentation; API empty/error responses now remain authoritative. | EPMRPP-122412/EPMRPP-122413; **removed**. |
| TMP-03 | Mock-default Pipeline transport, local storage override and closed LP1–LP3 gates. | Removed: LP1–LP3 now always request the canonical API URLs. Finish trusted deployment, role, empty/error and pagination QA independently. | EPMRPP-122411–EPMRPP-122413; **runtime removed, QA pending**. |
| TMP-04 | Client-side Pipeline/iteration search in `pipelinesPage/pipelinesListUtils.ts`, and assumptions that all iterations can be loaded into the page. | Use the backend search and pagination contract, including project changes and multi-page results; remove the client-only completeness assumption after verifying these paths. | [EPMRPP-122412](https://jiraeu.epam.com/browse/EPMRPP-122412); **active**. |
| TMP-05 | Rich Pipeline details, polling and comparison data represented by mock models and `mock-rich` handling in `pipelines/sagas.ts` and the Pipeline pages. The reduced API view now displays LP2 metrics and LP3 generic sections, but specialized panel semantics and Library joins remain provisional. | Replace each panel with validated backend fields or an explicit unavailable state. Remove mock-only parsing/presentation only when LP3 sections, stable stage identity, polling and LP4 compare semantics are proven for that panel. | [EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413), [EPMRPP-122414](https://jiraeu.epam.com/browse/EPMRPP-122414), [EPMRPP-122417](https://jiraeu.epam.com/browse/EPMRPP-122417); **active**. |
| TMP-06 | Mock-backed Pipeline settings, Review/Library case join, Test Case lifecycle/comments/fix rounds and automation overlays in `mocks/handlers.ts` and `mocks/overlay.ts`. The mock can enrich real TMS cases by a matching demo `displayId`; those are not live AI Factory records. | Remove each mock handler/overlay only after the corresponding published DTO, identity and permissions are verified with real project data. Settings and Review/Library have Pipeline tasks; other C/L/R/F/A contracts remain tracked in [10](10-backend-integration-contract.md). | [EPMRPP-122415](https://jiraeu.epam.com/browse/EPMRPP-122415), [EPMRPP-122416](https://jiraeu.epam.com/browse/EPMRPP-122416), then remaining contract groups; **active**. |
| TMP-07 | Demo reset and persisted `ai_factory_mock_db_v1` in the mock DB and Pipeline page. | Remove when no runtime mock data remains. The Pipeline page action is unavailable with live catalog provenance; it never mutates remote project data. | Final mock cleanup; **active for other mock groups**. |
| TMP-08 | Collapsed `Full API response` JSON on live LP3, alongside `Mapped API fields`. It makes currently unmodeled backend values inspectable as text only. | Remove the raw inspector after the LP3 field mapping, sensitive-field policy and Product/QA presentation are agreed; retain only purpose-built visual elements. | [EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413)/[EPMRPP-122414](https://jiraeu.epam.com/browse/EPMRPP-122414); **active**. |
| TMP-09 | LP3 section Test Case links with a `TC…` display ID open Library search by the case name. Library search matches names, and the sample `TC25602` is found this way; the section target lacks the numeric Library ID required for a direct details route. | Backend supplies the numeric Test Case ID or a verified internal details URL per linked cell, and the UI navigates directly to the matching case. Remove the name-search fallback after live verification. | [EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413); **active**. |
| TMP-10 | The live LP3 header shows disabled Compare with previous, Re-run and Pipeline settings actions with explanations. The rich mock-only actions are not wired to live data. | Enable Compare after LP4 baseline and identity behavior are verified; enable settings after LP5 read/write mapping and permissions are verified; enable Re-run only after its command contract and authorization are available. Remove each disabled placeholder when its live action is implemented. | [EPMRPP-122417](https://jiraeu.epam.com/browse/EPMRPP-122417), [EPMRPP-122415](https://jiraeu.epam.com/browse/EPMRPP-122415), Re-run contract pending; **active**. |

## Rule for closing a row

For the relevant FE task, record the real endpoint and response evidence, replace the consuming
path, verify loading/empty/error/permission states and toggle-off behavior, then delete the
corresponding runtime mock/fallback and update this row plus [00](00-status.md). Do not blend
mock values into a nonempty real response. Keep focused test fixtures that still verify the real
adapter or regression behavior; the removal target is demo data and runtime substitution.

The feature flag `show_ai_factory_poc` is a rollout control, **not** itself a mock-removal item.
Decide its lifecycle separately from these temporary data sources.
