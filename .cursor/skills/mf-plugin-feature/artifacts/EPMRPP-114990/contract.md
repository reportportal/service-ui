# Extension-point contract: EPMRPP-114990

## Identity
- **extensionPointId:** `uiExtension:logRemoteDeviceTab`
- **Constant in core:** `EXTENSION_TYPE_LOG_REMOTE_DEVICE_TAB`
- **Selector:** `uiExtensionRemoteDeviceTabSelector`
- **Host component:** `service-ui/app/src/pages/inside/logsPage/logItemInfo/logItemInfoTabs/logItemInfoTabs.jsx`
- **Insertion site:** `makeTabs()` — append one tab descriptor per matching extension after the existing `details` tab and before the optional `history` tab.

> **Naming policy.** The slot uses the **singular** "remote device" form everywhere (constant, selector, extension id, file names, label, i18n key, tab id) to match the design and the locked v1 label. The user story title in the requirements repo is plural ("Remote devices") — that is treated as a stale label; the team has confirmed the singular form for code and UI.

## Design source
- **Figma URL:** https://www.figma.com/design/PxNk9h6CS9Y4Mxcl2fS9HF/%F0%9F%9F%A9--RP5-Project-Level?node-id=18979-26245
- **fileKey:** `PxNk9h6CS9Y4Mxcl2fS9HF`
- **nodeId:** `18979:26245` (frame `Microseconds extension V3 64`)
- **Screenshot:** `artifacts/EPMRPP-114990/design/18979-26245.png` (1600 px wide; original 1920×1024)
- **Reference-code disclaimer:** Figma reference code is React+Tailwind; treat it as a layout hint only. RP uses SCSS modules + UI-kit CSS Custom Properties.

### Design tokens (mapped from `get_variable_defs`)

`get_variable_defs` returned an empty set for this node — the Figma file does not declare design variables. Token resolution must therefore rely on direct inspection of the screenshot against existing RP CSS Custom Properties. Until a UX-confirmed token mapping exists, treat every visible colour / typography choice as **"map to closest UI-kit token"**, and surface mismatches as a Gate-1 fork (`design conformance — missing token mapping`).

| Figma token | Value in design | RP equivalent (UI-kit CSS var or font var) | Notes |
|-------------|-----------------|--------------------------------------------|-------|
| (none — no Figma variables in node) | — | — | Use existing log-page tokens for the tab strip; reuse `componentLibrary` button/icon tokens for the player controls. Any case where no equivalent exists MUST go to `decision-sheet.md` (`design conformance`). |

### Visible states covered by Figma
- [x] default (Mobitru evidence present, single video, single device session)
- [ ] empty (no Mobitru evidence)
- [ ] loading (federation / fetch in progress)
- [ ] error (video unavailable / fetch failed)
- [ ] no permission (out of scope per AC, but worth confirming)

**Multi-video case is out of v1 scope** (see `decision-sheet.md` Fork 7). If the BE returns more than one video, the plugin renders the first and ignores the rest.

States the plugin MUST render but Figma omits are tracked in `open-questions.md`.

### Layout summary (from screenshot)
- The **tab strip** in the design lists `STACK TRACE / ALL LOGS / ATTACHMENTS / ITEM DETAILS / HISTORY OF ACTIONS / REMOTE DEVICE`. The new tab carries a play-circle icon to the left of its label and uses the existing active-tab teal styling.
- Tab content is a **two-column panel** at 100 % of the page width: `METADATA` (left, ~435 px wide, 8 read-only key/value rows) and `VIDEO RECORD` (right, ~720 px wide).
- The video player has **custom controls**: play/pause, mute + volume slider, scrubber with current/total time (`29:12 / 41:00`), fullscreen toggle. Browser-default `<video controls>` does NOT match.
- **Tab label spelling — resolved:** v1 uses the **singular** form "Remote device" everywhere (matches the design). The user story uses the plural; treated as a stale label. Localisation Agent must request **singular** be/ru/uk translations in Phase 5.

## Visibility
- **visibilityOwner:** `plugin`
- **Rule:**
  ```
  Core appends a tab to the strip iff `uiExtensionRemoteDeviceTabSelector(state).length > 0`.
  Core does NOT inspect logItem attributes, plugin name, integration state,
  or any other plugin-specific signal. The decision to render the tab
  contents (videos / empty state / disabled / null) is made entirely
  inside the plugin component using `logItem` and shared selectors.
  ```
- **Empty / disabled / null behaviour:** plugin returns one of: real video player content, an inline empty/disabled state with a brief message, or `null`. A `null` render leaves the tab in place but empty; the "hide vs disable" UX decision in the user story is intentionally deferred to the plugin so that core stays slot-agnostic.

## Props contract

```ts
type LogRemoteDeviceTabExtensionProps = {
  // host-supplied: the active log item the user is currently viewing
  logItem: LogItem;
  // host-supplied: the test-item retry the log row belongs to
  // (already in scope in logItemInfoTabs; useful when video evidence
  // is associated with the retry rather than the individual log row)
  activeRetry: TestItem;
};
```

Fields the plugin gets via `createImportProps('mobitru_plugin')` are NOT listed here.

## Shared API the plugin will rely on

Declared dependency on `service-ui/app/src/controllers/plugins/uiExtensions/createImportProps.js` (RP-internal surface, non-deprecated keys only):

- `selectors.activeProjectKeySelector` (project key for any video/attachment endpoint call)
- `selectors.userRolesSelector`, `selectors.activeProjectRoleSelector` (read-only access semantics)
- `components.SystemMessage` (inline empty / error UI)
- `components.SpinningPreloader` or `components.BubblesPreloader` (loading state)
- `actions.showDefaultErrorNotification` (only if the design wants a global toast on hard failure; not required by AC)
- `utils.fetch`, `utils.URLS` (HTTP client + URL helpers; concrete endpoint TBD per US-LOG-MOB-002)
- `utils.downloadFile` (only if the design adds a download CTA; not required by AC)

If a needed RP-internal key is missing from `createImportProps`, raise it in `open-questions.md` instead of bypassing the shared API.

External libraries the plugin imports directly (resolved at runtime to host singletons via `webpack.config.js#shared`):

- `react` — component runtime, hooks (`useEffect`, `useMemo`, `useState`, ...)
- `react-redux` — `useSelector`, `useDispatch`
- `react-intl` — `useIntl`, `defineMessages`, `FormattedMessage`
- `classnames` (`classnames/bind`) — class composition
- `moment` — only if a date/time formatting need appears in the final UX

Do not destructure `props.lib.*`; the `lib` key in `createImportProps` is deprecated and kept only for legacy plugins.

## External dependencies (audit)

| Library | Used for | In `service-ui/app` package.json | In plugin package.json | In federation `shared` block | Status |
|---------|----------|----------------------------------|------------------------|------------------------------|--------|
| `react` | component runtime, hooks | `18.3.1` | `18.3.1` | yes singleton | reuse |
| `react-redux` | `useSelector`, `useDispatch` for shared selectors | `8.1.3` | `8.1.3` | yes singleton | reuse |
| `react-intl` | `defineMessages`, `useIntl`, `FormattedMessage` for plugin-internal strings (empty/error states) | `5.25.1` | `^5.25.1` | yes singleton | reuse |
| `classnames` | class composition | `2.3.1` | `2.3.1` | yes singleton | reuse |
| `moment` | optional, only if a duration/timestamp display is added to the final UX | `^2.30.1` | `^2.30.1` | yes singleton | reuse |
| **video player** | render Mobitru videos with the custom controls bar shown in the design | n/a | n/a | n/a | **GATE-1 FORK** — see decision sheet (revised) |

**Revised recommendation for the video-player row.** Earlier the default was the native HTML `<video>` element with its built-in controls. The design renders a fully **custom controls bar** (play/pause, mute + volume slider, scrubber with current/total time, fullscreen toggle) — the browser-default skin does NOT satisfy this. The Architect MUST therefore pick between (A) `<video>` element with hand-rolled custom controls (no new dependency, more code), or (B) a small skinnable wrapper such as `react-player` or `plyr-react` (one new dependency, less custom CSS). See `decision-sheet.md` Fork 6 for the full trade-off matrix; no `npm install` may happen before Gate 1 approves a row.

## Error UX
- **Boundary:** `ExtensionLoaderWrapper` with the default silent fallback. The wrapper guarantees the rest of the page stays interactive even on a federation load failure (AC: "non-blocking error state").
- **Plugin-rendered failure state:** inline `SystemMessage` (variant = error) inside the tab content, with a short message and an optional retry CTA. Plugin handles network/parse errors locally so the user sees a meaningful message instead of an empty tab.

## Analytics
- **In scope:** none.
- **Out of scope:** GA4 Log events #7 ("Remote device" tab) and #46 ("play Mobitru video") — owned by EPMRPP-115112. Note: the GA4 spec uses the singular form to align with the locked v1 label.

## i18n keys

| Key | en (default) | be | ru | uk |
|-----|--------------|----|----|----|
| `LogItemInfoTabs.remoteDeviceTab` | `Remote device` | _TBD by Localization Agent_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadataTitle` | `METADATA` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.videoRecordTitle` | `VIDEO RECORD` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.id` | `ID` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.device` | `Device` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.browser` | `Browser` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.os` | `OS` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.automationBackend` | `Automation Backend` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.owner` | `Owner` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.startTime` | `Start Time` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.metadata.endTime` | `End Time` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.empty` | `No Mobitru video evidence is available for this test item.` | _TBD_ | _TBD_ | _TBD_ |
| `RemoteDeviceTab.error` | `Failed to load Mobitru video. Try again later.` | _TBD_ | _TBD_ | _TBD_ |

All keys live in the **plugin's** `defineMessages` except `LogItemInfoTabs.remoteDeviceTab`, which is core-owned (see `## Slot ownership`). The user story originally supplied **plural** translations for the tab label (`Remote devices` / `Удалённые устройства` / `Аддаленыя прылады` / `Віддалені пристрої`); since v1 uses the **singular** label, the Localisation Agent must request **singular** be/ru/uk translations from the story owner before Phase 5 can land. Until then `manage:translations` will surface the new keys as missing.

## Slot ownership
- **Label / icon:** owned by **core**. The slot semantics ("remote device" — kept singular to match the design and the locked v1 label; still generic enough to host other vendors later) are core-defined; the plugin only contributes content. Icon file: `service-ui/app/src/common/img/remote-device-inline.svg`.
- **Default tab id:** `remote-device` (one tab per extension when multiple plugins register; current scope = single plugin so the simple id is fine; if multi-plugin support becomes a requirement, switch to `remote-device:${pluginName}`).

## nonGoals / outOfScope
- MBID ingestion, recording persistence, and Mobitru log creation (US-LOG-MOB-002).
- GA4 events #7 and #46 (EPMRPP-115112).
- Write actions on Mobitru videos (this story is read-only).
- Multi-plugin contribution to the same tab strip — the contract supports it (one tab per extension) but the UX for it is not designed in this story.
- **Multiple Mobitru videos per test item** — v1 renders a single video. If the BE response contains more than one video for the same item, the plugin picks `[0]` and ignores the rest. A future story will add picker UX (see `decision-sheet.md` Fork 7).

## Versioning
- **Initial version:** v1.
- **Breaking-change policy:** any change to `extensionPointId`, `propsContract`, or `visibilityOwner` is a new contract version requiring all consumer plugins to migrate.
