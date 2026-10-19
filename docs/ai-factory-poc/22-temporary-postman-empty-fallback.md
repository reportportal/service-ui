# Temporary Postman pipeline fallback

Removal is tracked as TMP-02 in the [temporary solutions register](23-temporary-solutions-register.md).

Source: `Report Portal Pipelines.postman_collection.json` supplied on 2026-10-19.
The collection contains write request bodies and a read journey, but no saved GET responses. The
fixture in `app/src/controllers/aiFactory/pipelines/temporaryPostmanFallback.ts` is therefore a
small read model derived from those bodies, with synthetic pipeline, iteration and stage IDs.
`NEEDS_HUMAN` and the Review stage represent the final 3/4 review step; neither is a captured
backend response field.

## Enable for local verification

In the browser console for the target project:

```js
localStorage.setItem('ai_factory_transport', JSON.stringify({ pipelineCatalog: 'postman-demo' }));
location.reload();
```

The mode sends the real project-scoped LP1 GET. It substitutes one demo pipeline only when LP1
returns HTTP 200 with a valid empty first page (`content: []`, zero totals). The demo iteration and
detail are then read locally. A visible notice marks the catalog as demo data. A nonempty LP1
response is adapted as live data; HTTP errors, malformed bodies and other successful statuses do
not trigger the fixture. Existing mock mode and the closed live rollout gate are unchanged.

To disable:

```js
localStorage.removeItem('ai_factory_transport');
location.reload();
```

## Removal

Remove `temporaryPostmanFallback.ts` and its test, the `postman-demo` branches in `transport.ts`
and `sagas.ts`, and the notice in `pipelinesPageContent.tsx`, `messages.ts` and
`pipelinesPage.scss`. Remove this note. The permanent LP1/LP2/LP3 integration must use actual GET
response contracts; the collection's stage update requests alone do not establish those shapes.
