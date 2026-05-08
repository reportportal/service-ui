# Decomposition: EPMRPP-114990

## Branch (same in every repo)
`feature/EPMRPP-114990-manager-editor-viewer-can-view-mobitru-videos-in-remote-device-tab`

## Commit subject (same in every repo)
`EPMRPP-114990 || Manager, Editor, or Viewer can view Mobitru videos in a separate Remote device tab`

> Note: branch and commit subject use the **singular** "remote device" form (matches the design and the locked v1 label). The user-story title in the requirements repo is plural but the team has confirmed the singular form for the implementation; the PR description must call this out.

## PR #1 — Core (`service-ui/app`)
- **Repo:** service-ui
- **Files:**
  - `service-ui/app/src/controllers/plugins/uiExtensions/constants.js` — add `EXTENSION_TYPE_LOG_REMOTE_DEVICE_TAB = 'uiExtension:logRemoteDeviceTab'`.
  - `service-ui/app/src/controllers/plugins/uiExtensions/selectors.js` — add `uiExtensionRemoteDeviceTabSelector` via `createExtensionSelectorByExtensionPoints([...])`.
  - `service-ui/app/src/controllers/plugins/uiExtensions/index.js` — re-export the new selector.
  - `service-ui/app/src/pages/inside/logsPage/logItemInfo/logItemInfoTabs/logItemInfoTabs.jsx` — `connect()` to the new selector, add `defineMessages` entry, append a tab descriptor per matching extension in `makeTabs()`, render via `ExtensionLoaderWrapper` with `componentProps={{ logItem, activeRetry }}`.
  - `service-ui/app/src/common/img/remote-device-inline.svg` — new SVG icon for the tab strip.
  - `service-ui/app/localization/translated/{be,ru,uk}.json` — single new key `LogItemInfoTabs.remoteDeviceTab`.
- **Tests:** none added in this story (the host is a class component without existing unit-test coverage in the same file; defer to a follow-up).

## PR #2 — Plugin (`plugin-mobitru/ui`)
- **Repo:** plugin-mobitru
- **Files:**
  - `plugin-mobitru/ui/src/components/remoteDeviceTab/remoteDeviceTab.tsx` — new component; receives `{ logItem, activeRetry }` as host props plus the standard `createImportProps` injection.
  - `plugin-mobitru/ui/src/components/remoteDeviceTab/index.ts` — exports.
  - `plugin-mobitru/ui/src/components/remoteDeviceTab/remoteDeviceTab.scss` — styles.
  - `plugin-mobitru/ui/src/metadata.json` — append `{ name: 'mobitruRemoteDeviceTab', type: 'uiExtension:logRemoteDeviceTab', moduleName: './remoteDeviceTab' }`.
  - `plugin-mobitru/ui/webpack.config.js` — append `'./remoteDeviceTab': './src/components/remoteDeviceTab/index.ts'` to `ModuleFederationPlugin.exposes`.
  - Optional: extend `plugin-mobitru/ui/src/types/extensionProps/componentsTypes.ts` if `SystemMessage`/`SpinningPreloader` aliases are missing.
- **Tests:** none added in this story (no existing unit tests in the plugin); defer to a follow-up once the data flow stabilises with US-LOG-MOB-002.

## Cross-links
- PR #1 description must link to PR #2 and to `service-ui/.cursor/skills/mf-plugin-feature/artifacts/EPMRPP-114990/contract.md`.
- PR #2 description must link to PR #1 and to the same contract artifact.
