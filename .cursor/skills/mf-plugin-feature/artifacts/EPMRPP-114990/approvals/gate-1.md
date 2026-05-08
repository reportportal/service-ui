# Gate 1 — Contract approval marker: EPMRPP-114990

## Design source consulted
- **Figma URL:** https://www.figma.com/design/PxNk9h6CS9Y4Mxcl2fS9HF/%F0%9F%9F%A9--RP5-Project-Level?node-id=18979-26245
- **fileKey / nodeId:** `PxNk9h6CS9Y4Mxcl2fS9HF` / `18979:26245`
- **Screenshot:** `artifacts/EPMRPP-114990/design/18979-26245.png` (rendered via `get_screenshot`, 1600 px wide; original 1920×1024)
- **Variables (`get_variable_defs`):** none — file does not declare design variables for this node; token mapping is by inspection.
- **Design vs story conflicts surfaced:** tab label spelling (singular vs plural) and number of videos visible (one in design vs "all" in AC). Both are open questions blocking Gate 1 sign-off.

## Decision sheet (embedded copy)

See [../decision-sheet.md](../decision-sheet.md). Summary of forks:
1. Visibility ownership → recommend **plugin** (alt: core probes `MBID`).
2. Tab label / icon ownership → **label spelling resolved**: v1 uses **singular "Remote device"** to match the design; ownership = **core** (alt: plugin via metadata). Icon = play-circle from design, registered as `service-ui/app/src/common/img/remote-device-inline.svg`.
3. Error UX placement → recommend **dual layer** (alt: boundary-only).
4. Props contract scope → recommend **`{ logItem, activeRetry }` only** (alt: also pass `projectKey`).
5. Tab id when multiple extensions register → recommend **`remote-device` now, `remote-device:${pluginName}` later** (alt: namespaced from day one).
6. **Video player implementation (revised after design review)** → recommend **`plyr-react` (~30–40 kB)** because the design demands custom controls (play / mute+volume / scrubber+time / fullscreen). Alts: A = `<video>` + hand-rolled controls (no new dep, ~200 LOC + A11y to maintain); B = `react-player` (~50 kB); C = `video.js` (~150 kB). Conditional on open question #5 (Mobitru video format).
7. **Tab content layout (resolved)** → **single video for v1**, two-column metadata + VIDEO RECORD layout per design. Multi-video UX is out of v1 scope.
8. **Metadata panel data source (added)** → recommend **single Mobitru session payload** that returns both video URLs and metadata fields (alt: `logItem.attributes`). Conditional on open question #3 (concrete video API).
9. **Design conformance — missing token mapping (added)** → recommend **map by inspection to existing UI-kit CSS Custom Properties** with UX/UI sign-off at Gate 3 (alt: request a token pass from UX before implementation).

## Contract summary
- **extensionPointId:** `uiExtension:logRemoteDeviceTab`
- **visibilityOwner:** `plugin`
- **propsContract keys:** `logItem`, `activeRetry`
- **i18n keys added:** `LogItemInfoTabs.remoteDeviceTab` (singular; en `Remote device`; be/ru/uk to be re-requested in singular form by the Localisation Agent) + 11 plugin-internal keys for the METADATA panel labels and empty/error copy (extracted from design + AC; be/ru/uk to be supplied by Localisation Agent).
- **External dependencies:** all base libs reused (`react`, `react-redux`, `react-intl`, `classnames`, `moment`). **One `NEW` row pending Gate 1 approval:** `plyr-react` for the custom video controls bar. If the human picks alt A (no new dep) the row drops; alts B/C produce different `NEW` rows. No `VERSION DRIFT` rows.
- **Open questions blocking Gate 1 approval (must be resolved before sign-off):**
  - _none_ — both previously-blocking questions (Q7 label spelling, Q9 multi-video UX) are resolved.
- **Open questions blocking nothing past Gate 1 (deferred to later phases):**
  - Q1 "Mobitru video evidence" signal (BE / Plugin, impacts Phase 4b only).
  - Q2 Hidden vs disabled vs empty UX (UX/PO, may add a host follow-up).
  - Q3 Concrete video API (BE / Plugin, impacts Phase 4b only).
  - Q5 Mobitru video format/delivery scheme (BE / Plugin / Architecture; if streaming, fork #6 must be re-decided before Phase 4b — implementer STOPs).
  - Q6 Bundle-size budget (UI lead / Architecture).
  - Q8 Mobitru session-metadata payload field names (BE / Plugin, impacts Phase 4b).
  - Q10 Token mapping pass (UX / UI lead, blocks Gate 3).
  - Q11 Empty / loading / error / no-permission states (UX / PO, blocks Gate 3).
- **Resolved during Phase 3:**
  - Q7 Tab label spelling → v1 uses **singular** "Remote device" everywhere (label, constant, selector, file paths, i18n key, tab id) to match the design (Fork 2). Singular be/ru/uk translations to be re-requested in Phase 5.
  - Q9 Multi-video UX → v1 scope is single video; multi-video is a follow-up story (Fork 7).

## Approval
- [ ] I (human) approve the contract as written.
