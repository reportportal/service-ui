# RP Extension-Point Reference

This document is the authoritative reference for how `service-ui/app` (core, Module Federation host) and `plugin-*/ui` (remotes) connect through `uiExtension:*` extension points. Read this before writing `contract.md` or any code under those paths.

## End-to-end picture

```
plugin-*/ui                                      service-ui/app
─────────────────────────────                    ───────────────────────────────────
src/metadata.json (extensions[])     ── HTTP ──> domain.uiExtensions.extensionManifests
src/components/<X>/index.ts                      uiExtensions/selectors.js (filters by extensionPoint)
webpack.config.js exposes['./<X>']   ── MF  ──> components/extensionLoader/* (loads & renders)
                                                 createImportProps(pluginName) (shared API injected as props)
```

A plugin registers an extension by writing one entry under `metadata.json#extensions` with a `type` matching a core extension point id. Core selectors filter by extension point id and the host component renders matching extensions through `ExtensionLoaderWrapper`. The wrapper lazily loads the federated module and injects the shared API produced by `createImportProps` plus any host-supplied component props.

## Core: extension-point catalogue

File: `service-ui/app/src/controllers/plugins/uiExtensions/constants.js`.

Add a new extension point as a single uppercase constant whose value is the string id used in plugin manifests. Convention: `EXTENSION_TYPE_<SLOT_SCREAMING_SNAKE> = 'uiExtension:<slotCamelCase>'`. Existing precedents include:

- `EXTENSION_TYPE_LOG_STACKTRACE_ADDON` — addon rendered inside the stack-trace tab.
- `EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON` — addon inside the test-item-details modal.
- `EXTENSION_TYPE_INTEGRATION_FORM_FIELDS` / `EXTENSION_TYPE_INTEGRATION_SETTINGS` — used by `plugin-mobitru` already.

There is no central registry beyond this file; the value is simply imported from `selectors.js` and the host component.

## Core: selector

File: `service-ui/app/src/controllers/plugins/uiExtensions/selectors.js`.

For every extension point add a memoised selector via the helper `createExtensionSelectorByExtensionPoints([...])`:

```js
export const uiExtension<Slot>Selector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_<SLOT_SCREAMING_SNAKE>,
]);
```

The helper iterates enabled external plugins, normalises remote and federated extensions, and returns the array of `{ name, pluginName, payload, extensionPoint, ... }` items. Re-export the new selector from `service-ui/app/src/controllers/plugins/uiExtensions/index.js` so host components import from `controllers/plugins/uiExtensions`.

## Core: host component

A host component reads its selector via `connect()` (class) or `useSelector()` (hook), then renders each matching extension. Two precedents:

- `service-ui/app/src/pages/inside/common/stackTrace/stackTrace.jsx` — uses `<ExtensionLoader>` directly per item.
- `service-ui/app/src/pages/inside/stepPage/modals/testItemDetailsModal/testItemDetailsModal.jsx` — same pattern.

For a tabbed host (e.g. `service-ui/app/src/pages/inside/logsPage/logItemInfo/logItemInfoTabs/logItemInfoTabs.jsx`), append a tab descriptor to the `tabs` array per matching extension. Tab shape: `{ id, label, icon, component, componentProps, eventInfo, stroked? }`. The `component` may be `ExtensionLoaderWrapper` bound to the extension; pass host context (e.g. `logItem`, `activeRetry`) via `componentProps`. If multiple extensions match the same slot, decide deterministically — usually one tab per extension with a stable `id` like `${extensionPointId}:${pluginName}`.

## Core: federated loader

File: `service-ui/app/src/components/extensionLoader/extensionLoader.jsx`.

Always render through `ExtensionLoaderWrapper`, not raw `ExtensionLoader`. The wrapper:

- Wraps the lazy module in `ErrorBoundary` (silent fallback by default; pass `silentOnError={false}` to render `ExtensionError` on failure).
- Supports legacy in-process plugins via `extension.component`.
- Falls through to `FederatedExtensionLoader` for ModuleFederation remotes (`PLUGIN_TYPE_EXTENSION`) and `RemoteExtensionLoader` for remote plugin servers (`PLUGIN_TYPE_REMOTE`).

`FederatedExtensionLoader` calls `createImportProps(pluginName)` and spreads it into the lazy component **before** spreading host-provided props. This means host props win on key collision — name your host props with care.

The `lib` key inside `createImportProps` (re-exporting `react`, `react-redux`, `react-intl`, `redux-form`, `moment`, `classnames`, `html-react-parser`, …) is **deprecated**. It is kept only for compatibility with older plugins. New code MUST import these libraries directly; see [Plugin: webpack ModuleFederation](#plugin-webpack-modulefederation) and [Shared API: createImportProps](#shared-api-createimportprops).

## Plugin: metadata.json

File: `plugin-*/ui/src/metadata.json`. Schema (current `plugin-mobitru` example):

```json
{
  "scope": "<plugin_name_with_underscores>",
  "extensions": [
    {
      "name": "<unique-extension-name>",
      "type": "uiExtension:<slotCamelCase>",
      "moduleName": "./<exposedModule>"
    }
  ]
}
```

`scope` must match `ModuleFederationPlugin.name` in `webpack.config.js`. `moduleName` must match a key under `exposes`. `type` must match the value of the corresponding `EXTENSION_TYPE_*` constant in core.

## Plugin: webpack ModuleFederation

File: `plugin-*/ui/webpack.config.js`. For each new exposed component add an entry under `ModuleFederationPlugin.exposes`:

```js
exposes: {
  './<exposedModule>': './src/components/<exposedModule>/index.ts',
}
```

Keep the file path stable; downstream tooling caches by URL+name. Re-use the existing `shared` block (`react`, `react/jsx-runtime`, `react-dom`, `react-redux`, `redux-form`, `react-intl`, `react-tracking`, `moment`, `html-react-parser`, `classnames`) — do not duplicate or re-version. Versions must match what `service-ui/app/package.json` declares for the same packages.

External libraries are consumed by plugins via **direct imports** because every entry above is registered with `singleton: true` and the federation runtime will hand back the host's instance at runtime:

```ts
// inside a plugin component — the canonical way
import { useSelector, useDispatch } from 'react-redux';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import moment from 'moment';
```

Do **not** consume these libraries through `props.lib.*` from `createImportProps`. The `lib` key is deprecated and only kept for legacy plugins; see [Shared API: createImportProps](#shared-api-createimportprops).

## Plugin: component shape

File pattern: `plugin-*/ui/src/components/<componentName>/{componentName.tsx, index.ts, componentName.scss}`.

```ts
// index.ts
import { <ComponentName> } from './<componentName>';
export { <ComponentName> };
export default <ComponentName>;
```

Inside the component receive:

1. Host props (whatever the host explicitly passes via `componentProps`, e.g. `{ logItem, activeRetry }`).
2. Non-deprecated keys of `createImportProps(pluginName)` (see next section): `components`, `componentLibrary`, `HOCs`, `actions`, `selectors`, `constants`, `icons`, `utils`, `validators`, `portalRootIds`. These are RP-specific and have no public package — they are only available through this prop bag.

External libraries (`react`, `react-redux`, `react-intl`, `redux-form`, `moment`, `classnames`, `html-react-parser`) are imported **directly** at the top of the file; the federation runtime will resolve them to the host's singleton instances. Do not destructure `props.lib`.

Type the injected props with the helper aliases under `plugin-*/ui/src/types/extensionProps/`.

## Shared API: createImportProps

File: `service-ui/app/src/controllers/plugins/uiExtensions/createImportProps.js`.

`createImportProps(pluginName)` returns an object whose keys are spread as props onto the federated component. Treat these keys in two distinct ways:

### Use directly (RP-specific surface — no public package available)

- `components` — UI-kit and main components (Buttons, Inputs, `NavigationTabs`, `Tabs`, `ScrollWrapper`, `SystemMessage`, `SpinningPreloader`, `BubblesPreloader`, `ModalLayout`, `FieldElement`, `FieldErrorHint`, `FieldText`, `MarkdownEditor/Viewer`, …).
- `componentLibrary` — opinionated heavier widgets (`DraggableRuleList`).
- `HOCs` — `withTooltip`, `withFilter`, `withSortingURL`.
- `constants` — `COMMON_LOCALE_KEYS`, route names, statistics keys, status constants, etc.
- `actions` — Redux action creators (`showModalAction`, `showSuccessNotification`, `showDefaultErrorNotification`, `showScreenLockAction`, `addExportAction`, `loginAction`, …).
- `selectors` — `activeProjectKeySelector`, `activeProjectRoleSelector`, `userRolesSelector`, `userAccountRoleSelector`, `projectInfoSelector`, `pluginRouteSelector`, `pagePropertiesSelector`, `urlOrganizationAndProjectSelector`, `globalIntegrationsSelector`, `logsSizeSelector`, … See the file for the full list.
- `icons` — common SVG icons (Plus, Remove, Cross, Error, Pencil, …).
- `utils` — `fetch`, `URLS`, `downloadFile`, `debounce`, `formatAttribute`, `parseQueryAttributes`, `provideEcGA`, etc.
- `validators` — `requiredField`, `email`, BTS validators, `helpers.composeValidators`, `helpers.bindMessageToValidator`.
- `portalRootIds` — DOM ids for tooltip/modal/popover/notification/screen-lock portals.

These are the only RP-internal entities a federated plugin may consume. Plugins should consume cross-cutting context (project key, user role, intl message helpers from `react-intl`) through `selectors.*` and `actions.*` rather than hardcoding selectors or attribute names. This keeps the contract narrow.

### Deprecated — do not use in new code

- `lib` — re-exports of `react` (incl. `useSelector`/`useDispatch` from `react-redux`), `react-intl` (`useIntl`, `defineMessages`), `react-tracking` (`useTracking`), `redux-form` helpers (`reduxForm`, `formValueSelector`, `getFormValues`, `destroy`, `change`), `moment`, `Parser` (html-react-parser), `classNames`.

The `lib` key remains in the prop bag for legacy plugins only. New plugins import these libraries directly:

```ts
// preferred — direct imports
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';
import { useTracking } from 'react-tracking';
import { reduxForm, formValueSelector, getFormValues } from 'redux-form';
import classNames from 'classnames/bind';
import moment from 'moment';
import Parser from 'html-react-parser';
```

Because `webpack.config.js#shared` declares each entry with `singleton: true` and `requiredVersion` aligned to the host, the import resolves to the host's instance at runtime — there is no duplicate React, no duplicate Redux store, no broken intl context.

Existing plugins still consuming `props.lib.*` are not blocked from shipping, but new code and migrations should drop the destructure.

## Localisation

- All user-facing strings live in `react-intl` `defineMessages` blocks.
- Key naming: `<ComponentName>.<elementName>`.
- Workflow: write English defaults inline → run `npm run manage:translations` from `service-ui/app/` → update `localization/translated/{be,ru,uk}.json` only for keys you added.
- Never edit other plugins' or unrelated keys; ask the UI lead if a sweep is required.

## Testing the wiring locally

1. `cd plugin-*/ui && npm run dev` (watch build) and `npm run start` (serves `remoteEntity.js` on port 3001 by default; check `devServer.js`).
2. `cd service-ui/app && npm run dev` with `PROXY_PATH` pointing at a backend that has the plugin uploaded **or** override the manifest fetch to point to the local `remoteEntity.js`.
3. Open the host page (e.g. test item logs) and verify the new slot renders. Check the network panel for `metadata.json` and the federated chunk.

## Design source: Figma MCP

Designs for ReportPortal stories live in Figma and are linked from the user-story markdown (`Design / Figma mockups` table). Treat the Figma node as a normative input, not a hint.

### URL parsing

A Figma URL such as `https://figma.com/design/<fileKey>/<fileName>?node-id=<a>-<b>&...` resolves to:

- `fileKey = <fileKey>` (a string between `/design/` and the next `/`).
- `nodeId  = <a>:<b>` (the `node-id` query param with `-` replaced by `:`; the Figma MCP also accepts the raw `<a>-<b>` form).

If the URL is `https://figma.com/design/<fileKey>/branch/<branchKey>/<fileName>` use `branchKey` as `fileKey`. If the URL is `https://figma.com/make/<makeFileKey>/<makeFileName>` use `makeFileKey`.

### Tools and when to call which

| Tool | Use it for | Cost |
|------|------------|------|
| `get_design_context` | Primary tool. Returns reference code + screenshot + metadata for a node. Call this once per relevant node during Architect / Implementer phases. | Highest — pull selectively. |
| `get_metadata` | Cheap structural overview (XML of node ids / types / sizes). Use during Requirements to confirm scope. | Low. |
| `get_screenshot` | Just the rendered PNG (URL + curl by default). Use when the agent only needs the visual. Pass `maxDimension` to control size. | Low. |
| `get_variable_defs` | Dumps Figma variables (colours, typography, spacing) for a node. Use during Architect / Implementer to map design tokens to RP CSS custom properties. | Medium. |
| `search_design_system`, `get_libraries` | Inspect the design system the file relies on. Useful when the design references an unfamiliar component. | Low. |

### Mapping design tokens to RP styles

Per `service-ui/AGENTS.md`:

- Colours come from UI-kit CSS custom properties; do **not** introduce hex literals or new global CSS variables.
- Typography comes from global font variables; do **not** set raw `font-weight` or `font-family`.
- Spacing follows the project's existing scale (typically 4/8 px multiples).

When `get_variable_defs` returns a token that does not have an obvious RP equivalent, surface it as a fork (`design conformance`) at Gate 1 rather than silently using the closest match. Adding or modifying global CSS variables requires UX + UI-team approval (see AGENTS.md).

### Reference-code disclaimer

`get_design_context` returns React+Tailwind reference code. RP does NOT use Tailwind — treat that code as a layout reference only. Reuse:

- existing UI-kit components and project-internal components first;
- existing SCSS modules + CSS Custom Properties second;
- bespoke styles last, scoped to the component module.

## Anti-patterns (do not)

- Do not put plugin-specific data probes in core selectors (e.g. inspecting `MBID` attributes). Visibility logic that depends on plugin data must live inside the plugin component.
- Do not bypass `ExtensionLoaderWrapper`; raw `<extension.component .../>` skips the error boundary.
- Do not import host modules with absolute aliases from inside the plugin — only the props delivered by `createImportProps` (the non-deprecated keys) are guaranteed.
- Do not consume external libraries through `props.lib.*` in new code. Import `react`, `react-redux`, `react-intl`, `redux-form`, `moment`, `classnames`, `html-react-parser`, `react-tracking` directly; the federation `shared: { ..., singleton: true }` config makes the import resolve to the host's singleton.
- Do not declare local versions of `react`/`react-redux`/`react-intl`/etc. in `plugin-*/ui/package.json` that drift from `service-ui/app/package.json`. Mismatched `requiredVersion` in the federation `shared` block silently breaks singleton resolution at runtime.
- Do not invent new `shared` singletons in `webpack.config.js` without bumping the same entry on every plugin that already shares it.
- Do not hand-edit `localization/translated/*.json` for keys other than the ones the current ticket introduces.
- Do not skip the Figma node referenced in the user story. The Figma design is a normative input; if the link is missing, request it before Phase 1 completes.
- Do not pixel-translate Figma reference code (Tailwind, absolute-positioned divs, raw hex colours) into RP source. Reuse UI-kit components and CSS custom properties; treat the reference code as a layout hint only.
