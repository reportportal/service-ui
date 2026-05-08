# Decomposition: <TICKET-ID>

> Owner: Architect Agent — **Phase 3b only** (after Gate 1 approval).
> Do NOT fill this file during Phase 3a. Branch slugs, commit subjects and file names depend on Gate-1 forks (label spelling, slot name, vendor scope); writing them before the human picks an option produces ripple-rewrites in this file, the contract, both context maps and the Gate 1 marker.
> One PR per repo. Branch and commit names per user rules. No `<<G1: …>>` placeholders may survive in this file once Phase 3b finishes — they are an automatic FAIL at Gate 3.

## Branch (same in every repo)
`feature/EPMRPP-<id>-<kebab-slug-of-ticket-name>`

## Commit subject (same in every repo)
`EPMRPP-<id> || <Ticket name with team labels stripped>`

## PR #1 — Core (`service-ui/app`)
- **Repo:** service-ui
- **Files:**
  - `service-ui/app/src/controllers/plugins/uiExtensions/constants.js` — add `EXTENSION_TYPE_<...>`.
  - `service-ui/app/src/controllers/plugins/uiExtensions/selectors.js` — add `uiExtension<...>Selector`.
  - `service-ui/app/src/controllers/plugins/uiExtensions/index.js` — re-export the new selector.
  - `<host component path>` — render the slot via `ExtensionLoaderWrapper`.
  - `service-ui/app/src/common/img/<name>-inline.svg` — new icon (if any).
  - `service-ui/app/localization/translated/{be,ru,uk}.json` — new i18n keys only.
- **Tests:** <unit tests added or "n/a">.

## PR #2 — Plugin (`plugin-*/ui`)
- **Repo:** plugin-<name>
- **Files:**
  - `plugin-*/ui/src/components/<componentName>/<componentName>.tsx` — new component.
  - `plugin-*/ui/src/components/<componentName>/index.ts` — exports.
  - `plugin-*/ui/src/components/<componentName>/<componentName>.scss` — styles.
  - `plugin-*/ui/src/metadata.json` — register the new extension.
  - `plugin-*/ui/webpack.config.js` — `exposes` entry.
- **Tests:** <unit tests added or "n/a">.

## Cross-links
- PR #1 description must link to PR #2 and to `artifacts/<TICKET>/contract.md`.
- PR #2 description must link to PR #1 and to `artifacts/<TICKET>/contract.md`.
