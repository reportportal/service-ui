# Task brief: EPMRPP-114990

## Identity
- **Jira id:** EPMRPP-114990
- **Title:** Manager, Editor, or Viewer can view Mobitru videos in a separate Remote devices tab
- **Source:** `domains/projects/logs/stories/US-LOG-MOB-003-manager-editor-viewer-can-view-mobitru-videos-in-remote-devices-tab.md` (EPM-RPP/reportportal-requirements, ref `main`)
- **Release:** RP-26.1
- **Status:** draft
- **Owner:** unassigned
- **Depends on:** US-LOG-MOB-002 (MBID correlation, recording persistence, Mobitru log creation)
- **See also:** EPMRPP-115112 (GA4 events #7 and #46)

## Summary
On the test item view, **Manager**, **Editor**, and **Viewer** can open a separate **Remote devices** tab to view Mobitru videos linked to that item. This story defines tab visibility and video viewing behavior; MBID ingestion, recording persistence, and Mobitru log creation remain in **US-LOG-MOB-002**. **GA4** (**Log** events **#7** and **#46** — **Remote devices** tab and **play Mobitru video**) is implemented under **EPMRPP-115112**.

## Story
**As a** Manager, Editor, or Viewer
**I want** to view Mobitru execution videos in a separate **Remote devices** tab on the test item surface
**So that** I can review remote-device evidence without mixing it with regular log rows.

## Acceptance criteria
- [ ] **Tab visibility:** show **Remote devices** only when Mobitru video evidence exists for the current test item (source produced by **US-LOG-MOB-002** flow).
- [ ] **Tab hidden state:** when no Mobitru video evidence exists for the item, **Remote devices** is hidden (or disabled if design decides so; finalize one behavior in Jira).
- [ ] **Video view:** opening **Remote devices** shows all Mobitru videos available for the current test item.
- [ ] **Permissions:** **Manager**, **Editor**, and **Viewer** can open the tab and view videos (read-only in this story).
- [ ] **Failure state:** if a video cannot be loaded, the user sees a non-blocking error state/message and can continue using the page.

> Implementation deviations from the verbatim AC wording (locked at Phase 3, recorded in `decision-sheet.md`):
> - **Label spelling:** v1 ships the **singular** form **"Remote device"** to match the design (`decision-sheet.md` Fork 2). All AC bullets above remain quoted in plural form for traceability with the source story.
> - **Multi-video:** AC says "all Mobitru videos available"; v1 renders **one** video per test item — the Mobitru integration currently emits one session = one recording. Multi-video UX is a follow-up story (`decision-sheet.md` Fork 7).

## Other requirements
- Reuse existing data retrieval and attachment/media loading contracts from the Mobitru evidence flow; do not duplicate MBID ingestion logic here.
- Keep the story focused on tab visibility and viewing UX, not log-row creation or integration setup.

## Out of scope
- Re-defining MBID processing, retention behaviour, or project log-type creation (owned by US-LOG-MOB-002).
- GA4 events #7 and #46 (owned by EPMRPP-115112).

## Localisation

The user story originally supplied **plural** translations; v1 uses the **singular** label per the design and the locked team decision. The plural forms below are kept for traceability — the Localisation Agent must request the corresponding **singular** translations from the story owner before Phase 5 can land.

| Component | English (v1, singular) | Russian (TBD) | Belarussian (TBD) | Ukrainian (TBD) | Original (plural, deprecated) |
|---|---|---|---|---|---|
| Tab — Remote device | `Remote device` | _TBD_ | _TBD_ | _TBD_ | en `Remote devices` / ru `Удалённые устройства` / be `Аддаленыя прылады` / uk `Віддалені пристрої` |

## Design
- **Figma URL:** https://www.figma.com/design/PxNk9h6CS9Y4Mxcl2fS9HF/%F0%9F%9F%A9--RP5-Project-Level?node-id=18979-26245&t=Si1XqCpD6fkBDmYl-0
- **fileKey:** `PxNk9h6CS9Y4Mxcl2fS9HF`
- **nodeId:** `18979:26245` (frame name in the file: `Microseconds extension V3 64`)
- **Screenshot:** `artifacts/EPMRPP-114990/design/18979-26245.png` (rendered via `get_screenshot`, 1600 px wide; original 1920×1024)
- **Visible scope:** the test-item Logs page after the user selects a step that has Mobitru evidence — the new tab is rendered in the existing `STACK TRACE / ALL LOGS / ATTACHMENTS / ITEM DETAILS / HISTORY OF ACTIONS` tab strip. The active tab content is a two-column panel: `METADATA` (left) and `VIDEO RECORD` (right).
- **Notable elements:**
  - **Tab label in design:** **REMOTE DEVICE** (singular). v1 adopts the singular form everywhere (label, constant, selector, file paths, i18n key, tab id); the user-story title remains plural but is treated as a stale label. Translations be/ru/uk must be re-requested in singular form (see Localisation table).
  - **Tab icon:** play-circle glyph rendered to the left of the label (teal stroke when active).
  - **Left column — METADATA panel:** 8 read-only key/value rows (`ID`, `Device`, `Browser`, `OS`, `Automation Backend`, `Owner`, `Start Time`, `End Time`).
  - **Right column — VIDEO RECORD panel:** video player rendering the device screen with custom controls bar — play/pause, mute + volume slider, scrubber, current/total time (`29:12 / 41:00`), fullscreen toggle. Controls are NOT browser-default — they are custom-skinned per the design.
- **Missing states (Architect to confirm):**
  - empty (no Mobitru evidence) — design only shows the "data present" state.
  - loading — not depicted.
  - error / video-unavailable — not depicted; AC requires a non-blocking error state.
  - no permission — not depicted (the AC scopes Manager / Editor / Viewer, all of whom can view).
  - ~~multiple videos~~ — out of scope for v1; the tab renders exactly one Mobitru video per test item (see `decision-sheet.md` Fork 7).

## References
- Jira (this story): [EPMRPP-114990](https://jiraeu.epam.com/browse/EPMRPP-114990)
- Jira (GA4 #7, #46): [EPMRPP-115112](https://jiraeu.epam.com/browse/EPMRPP-115112)
- KB / GA4: [GA4 - Log](https://kb.epam.com/spaces/EPMRPP/pages/1922486858/GA4+-+Log)
- Parent epic: `domains/projects/logs/epics/EPIC-LOG-002-mobitru-logs.md`
- Parent feature: `domains/projects/logs/features/FEATURE-LOG-MOB-001-mobitru-log-with-video-attachment.md`
- Glossary: `glossary.md`

## Open questions surfaced by Requirements Agent
- AC says "show only when Mobitru video evidence exists" but also leaves "hidden vs disabled" empty-state to be finalised in Jira.
- The exact data signal that constitutes "Mobitru video evidence" depends on the final shape of US-LOG-MOB-002 (MBID attribute on test item, attachments with `mobitru` log type, or a dedicated endpoint).
- The video source API for the tab is not stated explicitly — likely the same flow used by Mobitru attachments under US-LOG-MOB-002.
- ~~**Design vs story label mismatch:**~~ Resolved — v1 uses the **singular** form ("Remote device") to match the design. The plural form supplied by the story is retained only in the localisation table for traceability; new singular translations must be requested in Phase 5.
- ~~**Multi-video layout not in design:**~~ Resolved — v1 renders a single video; see `decision-sheet.md` Fork 7.
- **Metadata panel data source:** the design shows 8 metadata rows (Device, Browser, OS, Automation Backend, Owner, Start/End Time). These almost certainly come from Mobitru session metadata, not the test-item attributes — confirm the data source.
