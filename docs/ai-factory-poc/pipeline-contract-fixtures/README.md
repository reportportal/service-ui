# LP1–LP3 source examples

These JSON files are **contract examples**, not captured responses from the deployed TMS environment. They model the response shapes in the supplied `pipeline-iteration-e2e-journey.md`, the `feature/pipelines` backend source at [`3e9a6454`](https://github.com/reportportal/service-api/commit/3e9a6454e0b5755cb2b2f44ccb305c01f3356d4f), and the unauthenticated OpenAPI labeled `feature-pipelines-2876` on 2026-10-18. IDs, names, scores and times are fixture values.

| File | Operation | State represented |
|---|---|
| [lp1-pipelines.json](lp1-pipelines.json) | `GET /v1/project/{projectKey}/pipeline?offset=0&limit=100` | One pipeline, Auto-Ready enabled |
| [lp2-iterations.json](lp2-iterations.json) | `GET /v1/project/{projectKey}/pipeline/{pipelineId}/iteration?offset=0&limit=100` | One iteration in review |
| [lp3-iteration-detail.json](lp3-iteration-detail.json) | `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}` | Same iteration with generic stage details |

LP1 and LP2 have 1-based page numbers. `page.hasNext` is absent in the source's page converter. Stage responses contain no `stageKey`. These examples deliberately contain no Library case join, external link, invented KPI or Re-run command. They can seed adapter tests but cannot prove deployed payload values or permissions.
