# Context map (core): EPMRPP-114990

## Repo and entry surface
- **Repo:** service-ui/app
- **Entry surface:** Test item logs page — the tab strip inside the active log item info panel.
- **Host component file:** `service-ui/app/src/pages/inside/logsPage/logItemInfo/logItemInfoTabs/logItemInfoTabs.jsx`
- **Insertion site:** `makeTabs()` builds the `tabs` array (`stack`, `logs`, `attachments`, `details`, optional `history`); a new tab descriptor is appended for each registered Remote-device extension.

## Extension-point precedents

| Constant | Selector | Host file | Pattern |
|----------|----------|-----------|---------|
| `EXTENSION_TYPE_LOG_STACKTRACE_ADDON` | `logStackTraceAddonSelector` | `service-ui/app/src/pages/inside/common/stackTrace/stackTrace.jsx` | per-item `<ExtensionLoader>` inside an existing tab |
| `EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON` | `testItemDetailsAddonSelector` | `service-ui/app/src/pages/inside/stepPage/modals/testItemDetailsModal/testItemDetailsModal.jsx` | rendered into a section of an existing modal |

Both are consumed via the unified `service-ui/app/src/components/extensionLoader/` (`ExtensionLoaderWrapper`, which wraps in `ErrorBoundary`).

## Files to touch
- `service-ui/app/src/controllers/plugins/uiExtensions/constants.js` — add `EXTENSION_TYPE_LOG_REMOTE_DEVICE_TAB = 'uiExtension:logRemoteDeviceTab'`.
- `service-ui/app/src/controllers/plugins/uiExtensions/selectors.js` — add `uiExtensionRemoteDeviceTabSelector` via `createExtensionSelectorByExtensionPoints([EXTENSION_TYPE_LOG_REMOTE_DEVICE_TAB])`.
- `service-ui/app/src/controllers/plugins/uiExtensions/index.js` — re-export the new selector.
- `service-ui/app/src/pages/inside/logsPage/logItemInfo/logItemInfoTabs/logItemInfoTabs.jsx` — `connect()` to the new selector; in `makeTabs()` append one tab per extension; component is `ExtensionLoaderWrapper` bound to the extension; `componentProps` = `{ logItem, activeRetry }`.
- `service-ui/app/src/common/img/remote-device-inline.svg` — new icon for the tab strip.
- `service-ui/app/localization/translated/{be,ru,uk}.json` — single new key `LogItemInfoTabs.remoteDeviceTab` (singular; awaiting singular translations from the story owner).

## Existing host context
- **Selectors already used by host:** `lastLogActivitySelector`, `activeRetrySelector`, `activeLogIdSelector`, `activeRetryIdSelector`, `activeLogSelector`, `activeTabIdSelector`, `availableIntegrationsByPluginNameSelector(SAUCE_LABS)`, `attachmentItemsSelector`, `noLogsCollapsingSelector`. Adding `uiExtensionRemoteDeviceTabSelector` extends this list.
- **i18n namespace:** `LogItemInfoTabs.*` (`stackTab`, `logsTab`, `attachmentsTab`, `detailsTab`, `historyTab`).
- **Icon registry:** `service-ui/app/src/common/img/` — existing `*-inline.svg` files (e.g. `stack-trace-inline.svg`, `attachment-inline.svg`).
- **Analytics events file:** `service-ui/app/src/components/main/analytics/events/` — `LOG_PAGE_EVENTS` already used by sibling tabs. New analytics events are out of scope for this ticket (see EPMRPP-115112).

## Design references
- **Figma node (from `task-brief.md#design`):** `PxNk9h6CS9Y4Mxcl2fS9HF` / `18979:26245`
- **Local screenshot:** `artifacts/EPMRPP-114990/design/18979-26245.png`
- **Reuse opportunities:** the tab strip itself is unchanged in the design — the new tab adopts the existing `STACK TRACE / ALL LOGS / ATTACHMENTS / ITEM DETAILS / HISTORY OF ACTIONS` styling and the active-tab teal underline. The new icon is a play-circle glyph; check existing `service-ui/app/src/common/img/*-inline.svg` for a reusable play glyph before adding `remote-device-inline.svg`.
- **Tokens that need attention:** none in core; the tab strip uses the existing `LogItemInfoTabs.*` styling. Token mapping concerns live in the plugin (see `context-map-plugin.md#design-references`).

## Notes / surprises
- `logItemInfoTabs.jsx` is a class component decorated with `@injectIntl`, `@connect`, and `@track()`. New selector wiring goes through the existing `@connect` mapStateToProps.
- Host already exposes `activeTabId` / `setActiveTabId` actions, so the new tab participates in tab switching for free if its descriptor follows the `{ id, label, icon, component, componentProps, eventInfo }` shape.
- `ExtensionLoaderWrapper` is preferable over raw `<ExtensionLoader>`: it wraps in `ErrorBoundary` (silent fallback by default), so the AC "non-blocking error state" is satisfied at the boundary level even if the plugin does not implement its own inline error.
- **Tab label spelling — resolved**: v1 uses the **singular** form to match the design; the i18n key is `LogItemInfoTabs.remoteDeviceTab`. The plural form supplied by the story is treated as a stale label.
