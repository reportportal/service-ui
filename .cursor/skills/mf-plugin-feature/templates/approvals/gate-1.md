# Gate 1 — Contract approval marker: <TICKET-ID>

> Owner: Architect Agent. Embeds the decision sheet for the human reviewer.

## Decision sheet (embedded copy)
<paste content of artifacts/<TICKET>/decision-sheet.md here, or link to it>

## Blocking forks (the human MUST resolve each one to lift Gate 1)
List every fork tagged `blocking: yes` from the decision sheet. The Architect cannot proceed to Phase 3b until each row has a recorded human pick.

| Fork | fork-key | Recommended | Human pick |
|------|----------|-------------|------------|
| <Fork N name> | `<fork-key>` | <option> | _waiting on human_ |

## Contract summary (Phase 3a — values may contain `<<G1: ...>>` placeholders)
- **extensionPointId:** `<value or `<<G1: slot-name>>`>`
- **visibilityOwner:** `<core | plugin>`
- **propsContract keys:** <list>
- **i18n keys added:** <list, possibly using placeholders for fork-dependent labels>
- **External dependencies:** <reuse-only | "1 NEW row pending Gate 1 (`<dep-name>`, see Fork N)">
- **Open questions blocking nothing past Gate 1:** <list>

## Resolved during Phase 3b
> Filled by the Architect after Gate 1 is approved. Each entry: `Fork N (<fork-key>) → <human pick>`.

## Approval
- [ ] I (human) approve the contract as written. (Once approved, the Architect runs Phase 3b to replace placeholders, write decomposition.md, and finalise the "Files to touch" sections in the context maps.)

## Rejection
> If rejecting, replace this section with `## Rejected: <reason>` and the Architect Agent will re-enter Phase 3a.
