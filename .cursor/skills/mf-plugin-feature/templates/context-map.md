# Context map (<core | plugin>): <TICKET-ID>

> Owner: Codebase Explorer Agent. Read-only.

## Repo and entry surface
- **Repo:** <service-ui/app | plugin-*/ui>
- **Entry surface:** <page/panel/modal/sidebar — 1 line>
- **Host component file:** <path>
- **Insertion site:** <function/JSX node — 1 line>

## Extension-point precedents (core only)
| Constant | Selector | Host file | Pattern |
|----------|----------|-----------|---------|
| EXTENSION_TYPE_<...> | uiExtension<...>Selector | <path> | per-item ExtensionLoader / single ExtensionLoaderWrapper |

## Plugin manifest and federation (plugin only)
- **`scope` in metadata.json:** <value>
- **Currently registered extensions:** <list>
- **Currently exposed modules:** <list>
- **`shared` singletons:** <highlights only>

## Files to touch (preliminary in Phase 2; finalised in Phase 3b)
> The Codebase Explorer fills this section with files / paths likely to change but does NOT pre-commit fork-dependent constant / selector / file / i18n / icon names. Use `<<G1: <fork-key>>>` placeholders for any value that depends on a Gate-1 blocking fork; the Architect rewrites the section in Phase 3b with the human-picked values. No `<<G1: …>>` placeholder may survive in this section once Phase 3b finishes.

- <path 1> — <change in 1 line, may use `<<G1: ...>>` for fork-dependent names>
- <path 2> — <change in 1 line>
- ...

## Existing host context (core only)
- **Selectors already used by host:** <list — informs what NOT to duplicate via componentProps>
- **i18n namespace:** <e.g. LogItemInfoTabs.*>
- **Icon registry:** <e.g. service-ui/app/src/common/img/>
- **Analytics events file:** <path or "n/a for this ticket">

## Component precedents (plugin only)
- **Component:** <path>
- **What it consumes via createImportProps (non-deprecated keys only):** <`components.*`, `selectors.*`, `actions.*`, `utils.*`, `validators.*`, `constants.*`, ...>
- **External libraries imported directly:** <e.g. `react`, `react-redux` (`useSelector`, `useDispatch`), `react-intl` (`useIntl`, `defineMessages`), `classnames`, `moment`, `redux-form`>
- **Uses deprecated `props.lib.*`?** <yes/no — flag as a migration candidate if yes>
- **Type aliases used:** <e.g. extensionProps/components, extensionProps/validators>

## Data-fetching conventions (plugin only)
- <how the plugin currently calls APIs (utils.fetch, URLS, custom client, ...)>

## Design references
- **Figma node (from `task-brief.md#design`):** <fileKey> / <nodeId>
- **Local screenshot (if persisted):** <path>
- **Reuse opportunities:** <existing UI-kit components / SCSS modules that already render parts of this design>
- **Tokens that need attention:** <design tokens that may not have an obvious RP CSS Custom Property equivalent>

## Notes / surprises
<anything the Architect should know, e.g. legacy class component, custom error boundary, atypical naming>
