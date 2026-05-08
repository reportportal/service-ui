# Gate 1 decision sheet: <TICKET-ID>

> Owner: Architect Agent. One page. Goal: a 5-minute human decision.
>
> **Each fork is tagged `blocking: yes|no`.** A `blocking: yes` fork affects naming, scope, dependency choice, or wording that downstream artifacts depend on; the Architect parks its outcome in `contract.md` as a `<<G1: <fork-key>>>` placeholder during Phase 3a and only resolves it in Phase 3b after the human picks. A `blocking: no` fork has a recommended option that may stand if the human approves; it does not require a placeholder.

## Forks

### 1. <Fork name (e.g. Visibility ownership)>  `blocking: yes|no`  `fork-key: <slot-name | tab-label | video-player | ...>`
- **Recommended:** <option> — <one-line reasoning>
- **Alternative:** <option> — <one-line trade-off>

### 2. <Fork name (e.g. Label / icon ownership)>  `blocking: yes|no`  `fork-key: <...>`
- **Recommended:** <option> — <reasoning>
- **Alternative:** <option> — <trade-off>

### 3. <Fork name (e.g. Error UX placement)>  `blocking: yes|no`  `fork-key: <...>`
- **Recommended:** <option>
- **Alternative:** <option>

<add more forks as needed; do not invent forks where there is only one obvious option>

## Risks the human should weigh
- <bullet>
- <bullet>

## Reversibility
- **Cheap to undo:** <list>
- **Expensive to undo:** <list>

## Open questions deferred past Gate 1
- <bullet — only if approving with open items>

## Approval prompt
- [ ] I (human) approve the contract as written.
