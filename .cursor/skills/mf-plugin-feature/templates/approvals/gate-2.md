# Gate 2 — Build approval marker: <TICKET-ID>

> Owner: Quality Gate Agent. Embeds the tail of each command's log per repo.

## service-ui/app
### `npm run type-check`
```
<last ~30 lines of output, including exit-code line>
```
### `npm run format`
```
<last ~30 lines of output>
```
### `npm run build`
```
<last ~80 lines of output>
```

## plugin-<name>/ui
### `npm run type-check`
```
<last ~30 lines of output>
```
### `npm run format`
```
<last ~30 lines of output>
```
### `npm run build`
```
<last ~80 lines of output>
```

## Scope check
- [ ] No repo skipped.
- [ ] No silenced lint, no unrelated files reformatted.
- [ ] No new dependencies added without contract approval.

## Local-only check (Gate 2 mirror of "defer-don't-pre-commit")
- [ ] No `git push` happened during Phase 6.
- [ ] No PR / MR was drafted, opened, or commented on.
- [ ] No `report-portal` (or any other) remote was hit beyond `git fetch`.
- [ ] No commit was created on a branch that already has a PR open.
- [ ] No Reviewer Agent or PR / Babysit Agent was invoked.

## Approval
- [ ] I (human) approve Gate 2.

## Rejection
> Replace this section with `## Rejected: <reason>`; Quality Gate Agent re-iterates locally.
