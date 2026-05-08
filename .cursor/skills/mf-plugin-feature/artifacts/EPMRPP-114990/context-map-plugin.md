# Context map (plugin): EPMRPP-114990

## Repo and entry surface
- **Repo:** plugin-mobitru/ui
- **Entry surface:** new federated component exposed for the `uiExtension:logRemoteDeviceTab` slot in core.

## Plugin manifest and federation
- **`scope` in metadata.json:** `mobitru_plugin` (matches `ModuleFederationPlugin.name` in `webpack.config.js`).
- **Currently registered extensions:**
  - `mobitruFormFields` → `uiExtension:integrationFormFields` → `./mobitruFormFields`
  - `mobitruSettings` → `uiExtension:integrationSettings` → `./mobitruSettings`
- **Currently exposed modules:**
  - `./mobitruFormFields` → `./src/components/mobitruFormFields/index.ts`
  - `./mobitruSettings` → `./src/components/mobitruSettings/index.ts`
- **`shared` singletons:** `react`, `react/jsx-runtime`, `react-dom`, `react-redux`, `redux-form`, `moment`, `react-tracking`, `html-react-parser`, `classnames`, `react-intl` (all `singleton: true`). No additions needed for this ticket.

## Files to touch
- `plugin-mobitru/ui/src/components/remoteDeviceTab/remoteDeviceTab.tsx` — new component; reads `logItem` host prop; imports `useSelector` directly from `react-redux` and `useIntl`/`defineMessages` directly from `react-intl`; consumes `selectors.activeProjectKeySelector`, `components.SystemMessage`, `utils.fetch`, `utils.URLS` from the injected `createImportProps` (non-deprecated keys).
- `plugin-mobitru/ui/src/components/remoteDeviceTab/index.ts` — exports.
- `plugin-mobitru/ui/src/components/remoteDeviceTab/remoteDeviceTab.scss` — styles.
- `plugin-mobitru/ui/src/metadata.json` — append entry `{ name: 'mobitruRemoteDeviceTab', type: 'uiExtension:logRemoteDeviceTab', moduleName: './remoteDeviceTab' }`.
- `plugin-mobitru/ui/webpack.config.js` — append `'./remoteDeviceTab': './src/components/remoteDeviceTab/index.ts'` to `ModuleFederationPlugin.exposes`.
- Optional: `plugin-mobitru/ui/src/types/extensionProps/componentsTypes.ts` — add typing for `SystemMessage` if not yet aliased.

## Component precedents
- **Component:** `plugin-mobitru/ui/src/components/mobitruFormFields/mobitruFormFields.tsx`.
- **What it consumes via createImportProps:** `components.FieldElement`, `components.FieldErrorHint`, `components.FieldText`, `validators.requiredField`. Demonstrates: typed prop bag using `extensionProps/components` and `extensionProps/validators` aliases; pure functional component, no class decorators.
- **Type aliases used:** `extensionProps/components`, `extensionProps/validators`, plus `extensionProps/common`, `extensionProps/utils`, `extensionProps/actions` available via webpack `resolve.alias`.

## Data-fetching conventions
- The plugin currently has no direct API calls (form-only components). For this ticket the plugin will use `utils.fetch` + `utils.URLS` from `createImportProps` to reuse RP's standard HTTP client and URL helpers; the exact endpoint depends on the US-LOG-MOB-002 backend contract.

## Localisation
- Plugin does not maintain its own translation JSONs. English defaults via `react-intl` `defineMessages` are sufficient inside the component. The user-visible **tab label** is owned by core (so its translations live in `service-ui/app/localization/translated/*.json`); strings rendered **inside** the tab content (empty state, error state) are owned by the plugin and ship as English defaults until a multi-language story exists for the plugin.

## Design references
- **Figma node (from `task-brief.md#design`):** `PxNk9h6CS9Y4Mxcl2fS9HF` / `18979:26245`
- **Local screenshot:** `artifacts/EPMRPP-114990/design/18979-26245.png`
- **Reuse opportunities:** the MEDIA / METADATA two-column layout can use a thin internal SCSS module; key/value rows mirror existing form-row styling already shipped in `mobitruFormFields`. The play-circle tab icon already exists in core's icon registry as a generic glyph in some other tabs — confirm; otherwise register a new `service-ui/app/src/common/img/remote-device-inline.svg`.
- **Tokens that need attention:** Figma file has no design variables for this node (`get_variable_defs` empty). Map all visible greys, the active-tab teal, and the player-controls bar dark-grey by inspection to existing UI-kit CSS Custom Properties; surface anything unmapped at Gate 3.

## Notes / surprises
- The plugin builds with TypeScript 4.9 and Webpack 5; no React 18 strict-mode concerns observed in existing components.
- `react-redux` is shared as singleton in `webpack.config.js#shared`; the plugin imports `useSelector`/`useDispatch` directly from `react-redux` and they resolve to the host's instance at runtime. The deprecated `lib.*` re-exports from `createImportProps` are not used.
- The plugin's `output.publicPath: 'auto'` means federation chunks resolve relative to the manifest URL — no extra config needed for the new exposed module.
- **Design demands custom video controls** (play/mute+volume/scrubber+time/fullscreen). Browser-default `<video controls>` does NOT match. The Architect's revised recommendation is to add `plyr-react` as a `NEW` external dependency at Gate 1; if approved, this context map's "no new shared singletons" assumption holds (`plyr-react` is plugin-only; not added to `shared`).
