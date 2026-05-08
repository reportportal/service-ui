# Extension-point contract: <TICKET-ID>

> Owner: Architect Agent. The single source of truth between Core and Plugin Implementers.
>
> **Placeholder convention** (see `SKILL.md#placeholder-convention`). During Phase 3a, every value below that depends on a Gate-1 blocking fork is written as `<<G1: <fork-key>>>` (e.g. `<<G1: slot-name>>`, `<<G1: video-player>>`). Phase 3b replaces each placeholder with the human-picked value after Gate 1 is approved. No `<<G1: …>>` may survive in this file after Phase 3b — Reviewer fails Gate 3 if any do.

## Identity
- **extensionPointId:** `uiExtension:<slotCamelCase>` (use `<<G1: slot-name>>` if the slot name is a Gate-1 fork)
- **Constant in core:** `EXTENSION_TYPE_<SLOT_SCREAMING_SNAKE>`
- **Selector:** `uiExtension<Slot>Selector`
- **Host component:** <path>
- **Insertion site:** <1-line description of where in the host>

## Design source
- **Figma URL:** <full URL>
- **fileKey:** <parsed>
- **nodeId:** <parsed>
- **Screenshot:** <URL or local path>
- **Reference-code disclaimer:** Figma reference code is React+Tailwind; treat it as a layout hint only. RP uses SCSS modules + UI-kit CSS Custom Properties.

### Design tokens (mapped from `get_variable_defs`)

| Figma token | Value in design | RP equivalent (UI-kit CSS var or font var) | Notes |
|-------------|-----------------|--------------------------------------------|-------|
| `<token>`   | `<#hex / px / family>` | `var(--rp-...)`                       | <if no equivalent, mark as Gate-1 fork> |

Tokens with no RP equivalent MUST be surfaced as forks in `decision-sheet.md` (`design conformance — missing token`). New global CSS variables require UX + UI-team approval (per `service-ui/AGENTS.md`).

### Visible states covered by Figma
- [ ] default
- [ ] empty
- [ ] loading
- [ ] error
- [ ] no permission

States the plugin must render but Figma does not show MUST appear in `open-questions.md`.

## Visibility
- **visibilityOwner:** `core` | `plugin`
- **Rule:**
  ```
  <plain-English rule. Must NOT contain plugin-specific data probes
   (attribute names, plugin names) when visibilityOwner=core.>
  ```
- **Empty / disabled / null behaviour:** <which path the plugin renders>

## Props contract

```ts
type <Slot>ExtensionProps = {
  // host-supplied
  <fieldName>: <type>; // why this field is needed
};
```

Fields the plugin gets via `createImportProps(pluginName)` are **not** listed here.

## Shared API the plugin will rely on

Declared dependency on `service-ui/app/src/controllers/plugins/uiExtensions/createImportProps.js` (RP-internal surface, non-deprecated keys only):

- `selectors.*` — <list, e.g. activeProjectKeySelector, activeProjectRoleSelector, userRolesSelector>
- `actions.*` — <list, e.g. showDefaultErrorNotification, showSuccessNotification>
- `components.*` — <list, e.g. SystemMessage, SpinningPreloader>
- `utils.*` — <list, e.g. fetch, URLS, downloadFile>
- `validators.*` — <list>
- `constants.*` — <list>

If a needed RP-internal key is missing from `createImportProps`, raise it as an open question instead of bypassing the shared API.

External libraries the plugin will import directly (resolved at runtime to host singletons via `webpack.config.js#shared`):

- <list, e.g. react, react-redux (useSelector/useDispatch), react-intl (useIntl/defineMessages), classnames, moment, redux-form>

Do **not** list `lib.*` here — it is deprecated; new plugins import these libraries directly.

## External dependencies (audit)

The Architect MUST classify every external library the plugin will use. Each row is one library.

| Library | Used for | In `service-ui/app` package.json | In plugin package.json | In federation `shared` block | Status |
|---------|----------|----------------------------------|------------------------|------------------------------|--------|
| `<lib>` | <purpose> | <version or "no"> | <version or "no"> | <yes singleton / yes / no> | <reuse / NEW / VERSION DRIFT> |

Status meanings:
- **reuse** — already present in both host and plugin (or in `shared`), no action needed.
- **NEW** — the plugin must add the library to its `package.json`. MUST be surfaced as a fork in `decision-sheet.md` with at least one alternative (including the "do without" option) and trade-offs (bundle size, license, A11y, format support, mobile, security audit). Approval required at Gate 1.
- **VERSION DRIFT** — the plugin's declared version differs from `service-ui/app`'s. MUST be surfaced as a fork; default resolution is to align the plugin's version to the host's.

If the audit reveals a library is missing from the host as well (e.g. the plugin needs an HLS adapter the host does not ship), record it as a Gate-1 fork too. Implementers MUST stop on any "NEW" or "VERSION DRIFT" row that is not approved.

## Error UX
- **Boundary:** `ExtensionLoaderWrapper` (silent / non-silent — pick).
- **Plugin-rendered failure state:** <description, e.g. inline `SystemMessage` with retry CTA>.

## Analytics
- **In scope:** <constant names + analytics-spec link, or "none">.
- **Out of scope:** <link to the owning ticket, e.g. EPMRPP-115112>.

## i18n keys

| Key | en (default) | be | ru | uk |
|-----|--------------|----|----|----|
| <Component>.<element> | "<English>" | "<be>" | "<ru>" | "<uk>" |

## Slot ownership
- **Label / icon:** owned by `core` | `plugin` (justify in 1 line).
- **Default tab id:** <stable id used by the host>

## nonGoals / outOfScope
- <bullet>
- <bullet>

## Versioning
- **Initial version:** v1.
- **Breaking-change policy:** any change to `extensionPointId`, `propsContract`, or `visibilityOwner` is a new contract version requiring all consumer plugins to migrate.
