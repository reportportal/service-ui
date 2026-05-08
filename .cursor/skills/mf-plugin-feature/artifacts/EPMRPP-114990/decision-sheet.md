# Gate 1 decision sheet: EPMRPP-114990

## Forks

### 1. Visibility ownership (core vs plugin)
- **Recommended:** plugin owns visibility — core renders the tab whenever any extension is registered for the slot. Aligns with the playbook principle "plugin-owned domain logic"; future plugins can reuse the slot without core changes.
- **Alternative:** core owns visibility by inspecting `logItem.attributes` for `MBID`. Slightly tighter UX (no empty tab strip entry) but couples core to a Mobitru-specific signal and breaks the moment a second remote-device vendor lands.

### 2. Tab label and icon ownership (label spelling RESOLVED)
- **Decision (label spelling):** v1 adopts the **singular** form **"Remote device"** to match the Figma design. The singular cascades through the constant (`EXTENSION_TYPE_LOG_REMOTE_DEVICE_TAB`), the selector (`uiExtensionRemoteDeviceTabSelector`), the extension id (`uiExtension:logRemoteDeviceTab`), the icon file (`remote-device-inline.svg`), the i18n key (`LogItemInfoTabs.remoteDeviceTab`), the tab id (`remote-device`), and the plugin component path (`remoteDeviceTab/`). The user story title and the original be/ru/uk translations are plural; they are treated as a stale label, and the Localisation Agent re-requests the singular translations in Phase 5.
- **Recommended (ownership):** core owns label + icon. The slot is a generic "Remote device" surface; localisation lives naturally with other `LogItemInfoTabs.*` messages in core. Icon is the play-circle glyph visible in the design — register as `service-ui/app/src/common/img/remote-device-inline.svg`.
- **Alternative (ownership):** plugin owns label + icon (delivered via metadata). More flexible but moves translations out of `service-ui/app/localization/translated/*.json`, which the team tooling (`manage:translations`) is built around.

### 3. Error UX placement
- **Recommended:** dual layer — `ExtensionLoaderWrapper` provides a silent error boundary as backstop; plugin renders an inline `SystemMessage` for known network/parse failures.
- **Alternative:** rely solely on the boundary (silent fallback). Simpler but produces a blank tab on partial failures; arguably violates the AC "user sees a non-blocking error state/message".

### 4. Props contract scope
- **Recommended:** `{ logItem, activeRetry }` only. Project key, user role, intl, dispatch and shared components come via `createImportProps`. Keeps the host props minimal and forces plugins through the documented shared API.
- **Alternative:** also pass `projectKey` explicitly. Marginal convenience but creates two ways to read the same value, which is exactly what `createImportProps` exists to prevent.

### 5. Tab id when multiple extensions register
- **Recommended:** start with the simple `remote-device` id (single-plugin scope today); promote to `remote-device:${pluginName}` only when a second plugin registers. The contract documents the upgrade path.
- **Alternative:** ship the namespaced id from day one. Cleaner long-term but adds friction to the only current consumer (Mobitru) for a multi-plugin scenario that is not yet on the roadmap.

### 6. Video player implementation (revised after design review)
The Figma design shows a **fully custom controls bar** — play/pause, mute + volume slider, scrubber with current/total time (`29:12 / 41:00`), fullscreen toggle. Browser-default `<video controls>` does NOT match. Bundle-size figures below are gzipped runtime cost only (transitive deps such as `hls.js` are not included).

- **Recommended (revised): `plyr-react` (~30–40 kB).** Lightweight skinnable wrapper around HTML5 `<video>`; provides exactly the control set the design requires (play / mute+volume / scrubber+time / fullscreen). MIT-licensed. Smaller than `react-player`; smaller than hand-rolling and maintaining custom controls + A11y over the long term.
- **Alternative A — `<video>` element with hand-rolled custom controls (no new dependency).** Zero install, full control over markup/styles. Cost: ~200 LOC + a non-trivial A11y surface (keyboard, ARIA roles, focus management for fullscreen) that the team would own forever; harder to keep in sync with the design system.
- **Alternative B — `react-player` (~50 kB).** Wider format/source support (HLS via `hls.js`, YouTube/Vimeo) but uses its own UI; matching the Figma controls exactly requires significant CSS overrides. Pick this only if open questions confirm HLS or non-MP4 sources.
- **Alternative C — `video.js` (~150 kB).** Full-featured player. Overkill for read-only evidence viewing. Rejected unless an unexpected requirement appears (DRM, multi-language captions, etc.).

Trade-off summary: bundle size grows along the list; UX customisation effort drops as we move from "no dep" toward "skinnable wrapper". Given the design demands custom controls, the previous "native default" recommendation no longer satisfies the design AC; `plyr-react` is the cheapest way to ship a faithful UI without owning a custom player. Final say belongs to the human at Gate 1.

### 7. Tab content layout — single video for v1 (RESOLVED after design review)
- **Decision:** v1 renders **exactly one Mobitru video per test item**, in the two-column "METADATA (left) + VIDEO RECORD (right)" layout shown in the design. The plugin assumes the BE returns at most one video for a single test item (matches the current Mobitru integration where one session ↔ one recording). No selector / list / carousel UI in v1.
- **AC interpretation:** the AC phrase "all Mobitru videos available for the current test item" is read as "the Mobitru video associated with the test item". If the BE later starts returning multiple videos per item, that becomes a follow-up story (multi-video UX, video picker), not a v1 contract change.
- **Implication for the contract:** the plugin's component renders a single `<video>`/`plyr-react` instance. If the BE response is an array, the plugin picks `[0]` and ignores the rest — no UI for the additional items. A telemetry log line is acceptable so we notice the case in production.
- **Reversibility:** cheap. Adding a selector later is plugin-only work; it does not require changing `extensionPointId`, `propsContract`, or `visibilityOwner`.

### 8. Metadata panel data source (added after design review)
- **Recommended:** read the metadata fields shown in the design (`Device`, `Browser`, `OS`, `Automation Backend`, `Owner`, `Start Time`, `End Time`) from the **same Mobitru session payload** that supplies the video URL — one fetch produces both the video list and the session metadata, so the plugin component does not need a second endpoint. Field labels (left column) come from the plugin's own `defineMessages`; values (right column) come from the API response and are rendered as plain strings.
- **Alternative:** read the metadata from `logItem.attributes` (e.g. `MBID`, `device`, `os` keys). Couples the design to a particular tagging convention and breaks if the BE changes attribute names.
- **Open question:** the exact API and response shape is owned by US-LOG-MOB-002 and is not yet finalised. Plugin Implementer ships a thin adapter and an open question for the BE contract.

### 9. Design conformance — missing token mapping (added after design review)
The Figma file does not declare design variables for this node (`get_variable_defs` returned an empty set). All visible colours / spacings are inline values in Figma.
- **Recommended:** map every visible style to the closest existing UI-kit CSS Custom Property by inspection; do NOT introduce hex literals or new global variables. If a style cannot be mapped, surface it during Gate 3 review and request a UX/UI-team confirmation rather than freezing a hex into SCSS.
- **Alternative:** request a token pass from UX before implementation (cleaner long-term, slows the story).
- **Reversibility:** cheap — token mappings can be adjusted in a follow-up commit without contract impact.

## Risks the human should weigh
- AC literally says "show only when Mobitru video evidence exists"; plugin-owned visibility achieves the same observable outcome (the plugin renders nothing when there is no evidence) but moves the responsibility into the plugin runtime. If product expects a hidden tab strip entry rather than an empty one, the plugin must return `null` AND the host needs to drop empty children — confirm the desired UX with UX/PO.
- The exact "Mobitru video evidence" signal is undefined until US-LOG-MOB-002 is finalised. The plugin will inevitably ship a placeholder probe that needs revisiting.
- Because the contract supports "one tab per extension", a second plugin registering the same slot today would render two "Remote device" tabs. Mitigated by the recommended naming policy but worth noting.
- Video format from Mobitru is not documented in either user story. If the recording API returns HLS or other streaming format, both `plyr-react` (with `hls.js`) and `react-player` are viable; the Plugin Implementer must STOP and request a contract update rather than installing the lib unilaterally.
- The design shows only the "everything works" state; empty / loading / error / multi-video / no-permission states are inferred from AC. The plugin must implement the inferred states; product/UX MUST review them before Gate 3.

## Reversibility
- **Cheap to undo:** label/icon source (move from core to plugin — tooling-only change), tab id naming policy, video player choice when staying within the alternatives that do not introduce new BE contracts.
- **Expensive to undo:** `extensionPointId`, `propsContract` shape, `visibilityOwner`. Any of these changes is a new contract version requiring plugin re-publish.
- **Sticky once installed:** a new runtime dependency (`react-player`, `plyr-react`, `video.js`) is harder to back out — bundle-size budget, security audit, transitive deps. Defer the install until product confirms streaming/custom-controls needs.

## Open questions deferred past Gate 1
- Plugin's authoritative source for "Mobitru video evidence" once US-LOG-MOB-002 is final.
- "Hidden vs disabled vs empty" final UX decision (AC explicitly defers this to Jira).
- Whether the host should hide empty extension tabs (would require a small post-render visibility hook in `InfoTabs`).
- Mobitru video container/codec and delivery scheme (plain MP4 file vs HLS manifest vs signed CDN URL) — directly affects the video-player choice.
- Mobitru session-metadata response shape — exact field names for the `METADATA` panel (bound to the BE contract owned by US-LOG-MOB-002).
- Token mapping pass — Figma file has no variables; UX confirmation needed before SCSS lands.

## Approval prompt
- [ ] I (human) approve the contract as written.
