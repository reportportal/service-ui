---
name: mf-plugin-feature
description: Runtime-agnostic AI-agent playbook for shipping features that span the ReportPortal core (`service-ui/app`, webpack ModuleFederation host) and a remote plugin (`plugin-*`, ModuleFederation remote). Use when implementing a user story that requires both a new extension point in core and a federated component in a plugin, when a story explicitly mentions an existing extension point and a plugin, or when adding/modifying any `uiExtension:*` slot. Defines roles, phases, contracts, file-based artifacts and human-in-the-loop gates that work in Cursor IDE today and in Background Agents / SDK / CI later.
---

# AI Agent Playbook: Core + Module-Federation Plugin

> All playbook content, templates and artifacts MUST be authored in English, regardless of the chat language.

This skill is invoked when a feature requires coordinated changes in `service-ui/app` (core) and one or more `plugin-*` repos via webpack Module Federation. It encodes a single workflow that any runtime can drive (Cursor Task tool, Background Agents, Cursor SDK, or a CI script) by reading the prompt files and reading/writing the markdown artifacts described below.

## Quick start

1. Identify the Jira ticket id (e.g. `EPMRPP-114990`) and the affected plugin repo(s).
2. Create the artifact folder: `service-ui/.cursor/skills/mf-plugin-feature/artifacts/<TICKET>/` and copy the template files into it (`task-brief.md`, `context-map-core.md`, `context-map-plugin.md`, `contract.md`, `decision-sheet.md`, `decomposition.md`, `open-questions.md`, `change-log.md`, `approvals/gate-{1,2,3}.md`).
3. Run the phases described in [Workflow](#workflow). Each role consumes a prompt from `prompts/` and writes the corresponding artifact.
4. Stop at every hard gate and wait for explicit human approval (see [Hard gates](#hard-gates)).

For RP-specific extension-point internals (constants, selectors, federated loader, plugin metadata, shared `createImportProps` API), read [reference.md](reference.md).

## Principles

- **Contract is the seam.** Core ↔ plugin sync exclusively through `contract.md`. Other communication is forbidden.
- **Read-only first.** Discovery phases never write source code; they only produce markdown artifacts.
- **Progressive disclosure.** This SKILL.md stays under 500 lines. Details live in `reference.md` and individual prompt/template files.
- **File-based artifacts, not memory.** Every phase writes a markdown artifact under `artifacts/<TICKET>/`. Artifacts move unchanged between runtimes.
- **Plugin-owned domain logic.** Core never hardcodes plugin-specific data probes (e.g. attribute names like `MBID`). Domain decisions belong to the plugin; core only owns the slot.
- **Small per-repo PRs.** One PR per repo, cross-linked. Branch names follow `feature/EPMRPP-{id}-{slug}`; commit message format is `EPMRPP-{id} || {Ticket name}` with team labels (`[UI]`, `[QA]`, etc.) stripped. See `service-ui/AGENTS.md`.
- **Quality gates from AGENTS.md.** Before any commit/PR run `npm run type-check && npm run format && npm run build` in each affected repo. Localisation goes through `npm run manage:translations`; never touch other plugins' or teams' keys.
- **Open questions are explicit.** Unresolved contract points go into `open-questions.md` and the MR description; never patched by guessing.
- **Babysit loop for PRs.** Keeping a PR merge-ready (CI, conflicts, review comments) is delegated to a dedicated role using the existing `babysit` skill.
- **Human-in-the-loop on every hard gate.** Gates 1, 2 and 3 are not considered passed until a human explicitly approves. Agents may *propose* "ready for gate" by writing the corresponding marker file but may not advance to the next phase autonomously.
- **Defer decisions, don't pre-commit them.** No agent may bake into downstream artifacts a value whose outcome is still parked in an unresolved gate-blocking fork. Concretely: while a fork that affects naming, scope, dependency choice, or wording is still listed in `decision-sheet.md` without a human-approved resolution, the value MUST appear in the artifact as a placeholder (see [Placeholder convention](#placeholder-convention)) — never as a guess. This avoids ripple-rewrites across many files when the human picks a different option than the agent's recommendation.
- **Design is a normative input.** When the user story links to a Figma node, that node is part of the contract — not a hint. Requirements, Architect and both Implementers MUST consult the design via the Figma MCP server (`get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`). A missing or broken Figma link blocks Phase 1 and surfaces an open question. See [reference.md#design-source-figma-mcp](reference.md#design-source-figma-mcp).

## Roles

Each role is described by a prompt file under `prompts/`. The orchestrator (Cursor parent agent, SDK script, or CI step) feeds the prompt to a sub-agent and ensures it reads/writes the right artifacts.

- **Requirements Agent** (read-only). Pulls the user story and its dependencies via the GitLab MCP `get_file_contents` tool and normalises them into `task-brief.md`. Prompt: [prompts/requirements.md](prompts/requirements.md).
- **Codebase Explorer Agent** (read-only, two parallel instances — one per repo). Finds precedents (existing extension points, similar tabs/widgets, selectors, tests). Prompts: [prompts/explorer-core.md](prompts/explorer-core.md), [prompts/explorer-plugin.md](prompts/explorer-plugin.md).
- **Architect Agent.** Two-phase role:
  - **Phase 3a (pre-Gate-1)** — takes `task-brief.md` plus both context maps and produces `contract.md` (with placeholders where gate-blocking forks are unresolved), `decision-sheet.md`, `open-questions.md`, `approvals/gate-1.md`. Does NOT write `decomposition.md` and does NOT bake fork-dependent names into context-maps' "Files to touch" section. Best-of-N is acceptable for this step.
  - **Phase 3b (post-Gate-1)** — re-runs after the human approves Gate 1: replaces all `<<G1: …>>` placeholders with the chosen values, writes `decomposition.md` (final branch / commit / file names), and finalises the "Files to touch" section in both context maps.
  Prompt: [prompts/architect.md](prompts/architect.md).
- **Core Implementer Agent.** Edits `service-ui/app` strictly per `contract.md`. Prompt: [prompts/implementer-core.md](prompts/implementer-core.md).
- **Plugin Implementer Agent.** Edits `plugin-*` strictly per `contract.md`. Runs in parallel with Core; the only sync point is the contract. Prompt: [prompts/implementer-plugin.md](prompts/implementer-plugin.md).
- **Localization Agent.** Runs `npm run manage:translations` and updates only its own keys in `localization/translated/{be,ru,uk}.json`. Prompt: [prompts/localization.md](prompts/localization.md).
- **Quality Gate Agent.** Runs `type-check`, `format`, `build` in both repos and fixes its own regressions; cannot change the contract. Prompt: [prompts/quality-gate.md](prompts/quality-gate.md).
- **Reviewer Agent** (read-only). Checks compliance with `service-ui/AGENTS.md`, user rules (branch/commit naming) and `contract.md`. Emits a checklist report. Prompt: [prompts/reviewer.md](prompts/reviewer.md).
- **PR / Babysit Agent.** Creates branches/commits/PRs per user rules, then keeps them green via the `babysit` skill. Prompt: [prompts/pr-babysit.md](prompts/pr-babysit.md).

## Workflow

```
Phase 0  Bootstrap          parent agent loads this skill, identifies ticket id, scaffolds artifacts/<TICKET>/
Phase 1  Requirements       Requirements Agent              -> task-brief.md
Phase 2  Explore (parallel) Explorer x2                     -> context-map-core.md + context-map-plugin.md
                                                              ("Files to touch" section is preliminary — final names land in 3b)
Phase 3a Architect (design) Architect Agent                 -> contract.md (with <<G1>> placeholders for unresolved forks),
                                                                 decision-sheet.md, open-questions.md, approvals/gate-1.md
                                                              Does NOT write decomposition.md.
         GATE 1: contract                                   -> wait for human approval (approvals/gate-1.md)
Phase 3b Architect (finalise) Architect Agent               -> replaces every <<G1>> placeholder with the human-picked value,
                                                                 writes decomposition.md, finalises "Files to touch" in context maps
Phase 4a Core impl          Core Implementer                -> changes in service-ui/app
Phase 4b Plugin impl        Plugin Implementer (parallel)   -> changes in plugin-*
Phase 5  Localization       Localization Agent              -> updated localization/translated/*.json
Phase 6  Quality gates      Quality Gate Agent              -> type-check, format, build green in both repos
                                                              (no PR drafts, no remote pushes until Gate 2 is approved)
         GATE 2: build                                      -> wait for human approval (approvals/gate-2.md)
Phase 7  Review             Reviewer Agent                  -> review-checklist in approvals/gate-3.md
                                                              (no PR creation, no Babysit loop until Gate 3 is approved)
         GATE 3: review                                     -> wait for human approval (approvals/gate-3.md)
Phase 8  PR + babysit       PR / Babysit Agent              -> two PRs, kept merge-ready until merge
```

Every transition between phases appends a one-line entry to `change-log.md` (UTC timestamp, role, action, artifact written).

## Hard gates

Every gate is HITL: not considered passed until a human explicitly approves it. The async-friendly approval mechanism is described in [Approvals](#approvals).

### Gate 1 — Contract

- **Agent precondition.** `contract.md`, `decision-sheet.md`, `open-questions.md` and `approvals/gate-1.md` are written. `decomposition.md` and the "Files to touch" sections of context maps are NOT yet finalised. Every value in `contract.md` that depends on an unresolved gate-blocking fork appears as a `<<G1: ...>>` placeholder, never as a guess (see [Placeholder convention](#placeholder-convention)). The marker `approvals/gate-1.md` is created with embedded decision sheet, an explicit list of "blocking forks" (those the human must resolve to lift Gate 1) and an unchecked approval box.
- **Human action.** Reviews the decision sheet + contract; for every blocking fork picks an option (or marks "needs more design / data"). Approves or rejects.
- **Failure mode.** Architect re-runs Phase 3a with the human's notes appended to `change-log.md`. No Phase 3b, 4, 5, 6, 7 or 8 work starts.
- **Post-approval action (Phase 3b).** Architect re-runs ONLY to: replace every `<<G1: ...>>` placeholder with the human-picked value, write `decomposition.md` with finalised branch / commit / file names, and finalise the "Files to touch" section in both context maps. After 3b, no other agent may start Phase 4 until both context-maps and `decomposition.md` are placeholder-free.

### Gate 2 — Build

- **Agent precondition.** In each affected repo `npm run type-check`, `npm run format`, `npm run build` exit zero. Quality Gate Agent attaches the command logs (or their tail) to `approvals/gate-2.md`. **No remote pushes**, **no PR drafts** and **no commits to the feature branch** happen during Phase 6 — those belong to Phase 8.
- **Human action.** Confirms the logs cover the expected scope (no skipped repo, no silenced lint, no unrelated files reformatted) and approves.
- **Failure mode.** Quality Gate Agent re-iterates locally; no PR is created.

### Gate 3 — Review

- **Agent precondition.** Reviewer Agent emits a checklist report covering AGENTS.md compliance, branch/commit naming, contract conformance (diff vs `contract.md`), localisation hygiene (own keys only), design conformance, and any flagged anti-patterns. The report lands in `approvals/gate-3.md`. Reviewer also verifies that no `<<G1: ...>>` (or other gate placeholder) survives in any artifact under `artifacts/<TICKET>/` — leftover placeholders are an automatic FAIL. **No PR creation, no Babysit loop, no remote interaction** happens during Phase 7 — those belong to Phase 8.
- **Human action.** Reads the checklist + skims the two PR drafts; approves PR creation.
- **Failure mode.** Routed back to whichever phase produced the regression (usually Phase 4a/4b or Phase 5); never auto-merged.

## Placeholder convention

Used by the Architect Agent during Phase 3a to mark every value whose final form depends on a gate-blocking fork still listed in `decision-sheet.md`. The convention is intentionally noisy so it survives diff review and is trivially greppable.

- **Syntax.** `<<G1: <fork-key>>>` — three angle brackets on each side, the gate id, a colon, and a short fork key that matches the corresponding `### N. <name>` heading in `decision-sheet.md`.
- **Where it appears.**
  - `contract.md`: any naming decision (constant, selector, extension id, file path, i18n key, tab id, icon name) that depends on an unresolved fork; any dependency row whose status (`reuse` / `NEW` / `VERSION DRIFT`) is conditional on a fork choice; any visible state count or label that depends on a fork.
  - Never in `task-brief.md`, `context-map-*.md`, `decision-sheet.md`, `open-questions.md`, `approvals/gate-1.md` body, or in source code. Decomposition and the context-maps' "Files to touch" section are simply absent until Phase 3b instead of being filled with placeholders.
- **Lifecycle.** Architect plants placeholders during Phase 3a; replaces every placeholder during Phase 3b after Gate 1 approval. Reviewer fails Gate 3 if any placeholder survives anywhere under `artifacts/<TICKET>/` or in the code diff.
- **Example.** Before Gate 1 the contract may declare `**Constant in core:** EXTENSION_TYPE_LOG_<<G1: slot-name>>_TAB`; after Gate 1 (human picked "remote-device"), Phase 3b rewrites it to `EXTENSION_TYPE_LOG_REMOTE_DEVICE_TAB`.

## Approvals

A single mechanism that works in every runtime, with no shared state outside the repo.

- For each gate the agent writes `artifacts/<TICKET>/approvals/gate-<n>.md` containing gate-specific evidence (decision sheet for G1, build logs for G2, checklist for G3) plus a trailing `## Approval` section with an empty checkbox `- [ ] I (human) approve this gate.`.
- The human approves by either (a) checking the box and saving the file, (b) leaving an `approved` comment on the artifact PR, or (c) replying `approved` in the chat session driving the agent. Any one of these flips the gate.
- Agents MUST read the marker before continuing. If absent or unchecked, they stop and surface a "waiting on Gate <n> approval" status; they never advance on assumption.
- Rejection: the human replaces the checkbox section with `## Rejected: <reason>`. The agent appends the reason to `change-log.md` and re-enters the previous phase.

Runtime mapping of the same mechanism:

- **Cursor IDE.** Chat reply `approved` is the primary path; the parent agent updates the marker file before proceeding.
- **Background Agents.** Marker file commit on the feature branch is the primary path; the cloud agent reads it on its next iteration.
- **SDK / CI.** The orchestrator script gates each phase on the marker file being checked; CI can also expose a manual-approval step that flips it.

## Artifact layout

```
service-ui/.cursor/skills/mf-plugin-feature/
├── SKILL.md
├── reference.md
├── prompts/
│   ├── requirements.md
│   ├── explorer-core.md
│   ├── explorer-plugin.md
│   ├── architect.md
│   ├── implementer-core.md
│   ├── implementer-plugin.md
│   ├── localization.md
│   ├── quality-gate.md
│   ├── reviewer.md
│   └── pr-babysit.md
├── templates/
│   ├── task-brief.md
│   ├── context-map.md
│   ├── contract.md
│   ├── decomposition.md
│   ├── open-questions.md
│   ├── decision-sheet.md
│   ├── change-log.md
│   └── approvals/
│       ├── gate-1.md
│       ├── gate-2.md
│       └── gate-3.md
└── artifacts/
    └── EPMRPP-<id>/
        ├── task-brief.md
        ├── context-map-core.md
        ├── context-map-plugin.md
        ├── contract.md
        ├── decision-sheet.md
        ├── decomposition.md
        ├── open-questions.md
        ├── change-log.md
        └── approvals/
            ├── gate-1.md
            ├── gate-2.md
            └── gate-3.md
```

## Branch and commit naming

Per repo user rules:

- Branch: `feature/EPMRPP-{id}-{kebab-slug-of-ticket-name}` for stories/spikes, `bugfix/...` for bug fixes.
- Commit subject: `EPMRPP-{id} || {Ticket name}`. Strip team labels such as `[UI]`, `[QA]`, `[WS]`, `[PERF]`, `[DevOps]`, `[AGENT]`.

Both repos use the same branch name and the same commit subject.

## Runtime mapping

Same prompts and artifacts, different drivers:

- **Cursor IDE (today).** One parent agent in chat; roles are Task-tool calls. Use `subagent_type=explore` for read-only phases, `generalPurpose` for implementers, `shell` for the Quality Gate. Parallel implementers go into a single message with two Task calls.
- **Cursor Background Agents.** One cloud agent per role; artifacts are committed to the feature branch; sync via git.
- **Cursor SDK / CI.** An orchestrator script calls `Agent.create({ prompt: read('prompts/<role>.md'), context: read('artifacts/<id>/*') })`; gates become pipeline steps that block on the marker file being checked.

## Reference and examples

- [reference.md](reference.md) — RP extension-point pattern internals: constants, selectors, `ExtensionLoaderWrapper`, plugin `metadata.json`, webpack `exposes`, shared `createImportProps` API.
- `templates/` — copy-into-place starter files for every artifact.
- `artifacts/EPMRPP-114990/` — first applied run (US-LOG-MOB-003: "Remote device" tab with a Mobitru session video; v1 ships the singular form to match the design).
