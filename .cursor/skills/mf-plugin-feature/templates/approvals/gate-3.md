# Gate 3 — Review approval marker: <TICKET-ID>

> Owner: Reviewer Agent. PASS/FAIL per checklist item with one-line comment.

## Contract conformance
- [PASS|FAIL] Core registers the constant and selector named in the contract — <comment>
- [PASS|FAIL] Host renders the slot via `ExtensionLoaderWrapper` only — <comment>
- [PASS|FAIL] `componentProps` equals `propsContract` — <comment>
- [PASS|FAIL] No plugin-specific data probes in core — <comment>
- [PASS|FAIL] Plugin owns the empty / disabled / null path — <comment>
- [PASS|FAIL] Plugin `metadata.json` registers the new extension correctly — <comment>
- [PASS|FAIL] Plugin `webpack.config.js` exposes the matching module — <comment>
- [PASS|FAIL] Plugin imports external libraries directly (no `props.lib.*` destructure) — <comment>
- [PASS|FAIL] `plugin-*/ui/package.json#dependencies` diff matches `contract.md#external-dependencies` (no silent adds/upgrades) — <comment>
- [PASS|FAIL] Every `import` in plugin source corresponds to a library listed in the contract or to a non-deprecated `createImportProps` key — <comment>
- [PASS|FAIL] No undocumented entries added to `webpack.config.js#shared` — <comment>

## AGENTS.md and user rules
- [PASS|FAIL] Branch naming — <comment>
- [PASS|FAIL] Commit subject naming (no team labels) — <comment>
- [PASS|FAIL] No `React.FC` / `defaultProps` in new TS components — <comment>
- [PASS|FAIL] No new global SCSS vars / hex colours — <comment>
- [PASS|FAIL] CSS classes `kebab-case` matching component names — <comment>

## Design conformance
- [PASS|FAIL] Visible UI matches the Figma node referenced by the contract — <comment>
- [PASS|FAIL] Every used design token maps to an RP CSS Custom Property or a contract-approved exception — <comment>
- [PASS|FAIL] No raw hex literals or new global CSS variables introduced — <comment>
- [PASS|FAIL] All required plugin states (default / empty / loading / error) match the design or have an open question — <comment>
- [PASS|FAIL] All design-only strings appear in `i18n keys` and are wired through `react-intl` — <comment>

## Localisation
- [PASS|FAIL] Only new keys touched in `localization/translated/*.json` — <comment>
- [PASS|FAIL] English defaults match the contract — <comment>
- [PASS|FAIL] be/ru/uk values match the user story — <comment>

## Quality gates
- [PASS|FAIL] Gate 2 evidence is present and approved — <comment>

## Open questions
- [PASS|FAIL] All `open-questions.md` items reflected in PR descriptions — <comment>

## Placeholder hygiene (Gate 3 mirror of "defer-don't-pre-commit")
- [PASS|FAIL] No `<<G1: ...>>`, `<<G2: ...>>`, or `<<G3: ...>>` placeholder survives in any artifact under `artifacts/<TICKET>/` (`grep -RnE '<<G[0-9]+: ' artifacts/<TICKET>/`) — <comment>
- [PASS|FAIL] No gate placeholder appears in the source-code diff of either repo — <comment>

## Pre-PR hygiene (Gate 3 mirror)
- [PASS|FAIL] No PR was created on remote before this gate is approved — <comment>
- [PASS|FAIL] No Babysit loop was started before this gate is approved — <comment>

## Recommended next phase if any FAIL
<e.g. Phase 4a (Core impl), Phase 5 (Localisation)>

## Approval
- [ ] I (human) approve PR creation.

## Rejection
> Replace this section with `## Rejected: <reason>`; Reviewer Agent loops back to the recommended phase.
