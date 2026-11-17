# Localization

For localization needs Report Portal uses [react-intl](https://www.npmjs.com/package/react-intl) library, which is a part of [FormatJS](https://formatjs.io/).

[Documentation](https://formatjs.github.io/docs/react-intl#the-react-intl-module)

All text content of application should be controlled by localization system.
At the moment Report Portal supports English (default), Russian, Belorussian, Ukrainian, Spanish and Chineese (simplified) languages.

Localization message id format: `ComponentsName.elementName` (for example FiltersPage.addFilterButton)

If you can't find some keys required for you developing component please contact Business Analyst.

Localization workflow is:

1. Develop component and define default (English) translations using `intl.formatMessage` function (preferrable) or `<FormattedMessage>` component.
2. Execute npm script `manage:translations`.
3. Find keys, related to developing component, in `be.json`, `ru.json` and `uk.json` files placed in `/localization/translated/` folder, and define translations for corresponding languages.
4. **IMPORTANT!** Make sure that only related to your component keys have been changed, and there is no deleted lines related to other existing components.
   If you see such case, please discuss it with UI Team Lead.

## Plugin localization (runtime merge)

UI plugins (`PLUGIN_TYPE_EXTENSION`, loaded by `FederatedExtensionLoader`) ship their
own translations inside the plugin artifact instead of storing them in `service-ui`.
The host merges them into the root `IntlProvider` at runtime.

### Data flow

- Core catalog stays in `service-ui` (`localization/translated/*.json`, exposed via
  `common/constants/coreMessages.js`).
- Extension messages for the current language are kept in Redux slice
  `controllers/plugins/uiExtensions/localization` as a flat `pluginName -> messages` map
  (state key `extensionMessages`).
- `mergedMessagesSelector` returns `{ ...core[lang], ...extensionMessages }`;
  `LocalizationContainer` feeds it to `IntlProvider`.
- `useExtensionLocalization` (called inside `FederatedExtensionLoader`) fetches
  `locale-{lang}.json` from the same base URL as the MF entry and registers the
  extension's messages. The slice reducer clears entries on `CHANGE_LANG_ACTION` (all) and
  `UPDATE_EXTENSION_MANIFEST` (that plugin), so a re-fetch happens under the new
  language / source; nothing is unregistered on unmount (including plugin disable/removal —
  a stale entry only costs a few KB until the next language change or manifest update;
  see "Potential improvements" if this needs tightening later).

### Manifest contract (`metadata.json`)

```json
"localization": {
  "messages": "locale-{lang}.json"
}
```

- `messages` is a flat file-name template: exactly one `{lang}` placeholder, no `/`
  (served as a flat `fileKey` via `plugin/public/{pluginName}/file/{fileKey}`).
- `{lang}` must match `state.lang` (`ru`, `be`, `uk`, `zh`, `es`). For `en` the host does
  **not** fetch `locale-en.json` at all (English is the reference language, already covered
  by `defaultMessage`); plugins are not required to ship it.
- No `localization` section, or an invalid `messages`, means **legacy**: the host does
  not fetch plugin locales and uses core strings + `defaultMessage` (backward compatible).
- On `fetch` error (404/network) the host falls back to core strings + `defaultMessage`;
  it does **not** request a fallback language file.
- Message ids use a plugin namespace prefix (e.g. `PluginTemplate.Component.element`).
  The prefix is a free namespace to avoid collisions — it does **not** have to equal the
  real `pluginName`; only `metadata.json` / URL resolution use the real name.

### Migration runbook (per plugin, expand/contract)

1. **Expand** — in the plugin repo: add `locale-*.json` sources, generate them from
   `defineMessages` (do not hand-maintain ids), add the `localization` section to
   `metadata.json`, release so the JSON lands on the same base URL as the MF entry.
   Keys may still exist in core (duplicates; the plugin's messages overlay on match).
2. **Verify** — locally `window.RP.overrideExtension('<pluginName>', '<devUrl>')`; on stage
   switch languages and mount all extension points at once (validates the plugin's
   translations stay registered while any of its extension points are mounted).
3. **Contract** — a `service-ui` MR removes only the migrated keys from
   `localization/translated/*.json` (never host-only keys or other plugins' keys), in the
   same release window as the host/plugin rollout.

Until migration completes it is acceptable to edit `localization/translated/*.json`
manually and **not** run `manage:translations` in `service-ui`, so plugin keys are not
pruned as "unused".

### Potential improvement (not implemented)

Disabling or removing a plugin does not currently clear its `extensionManifests` /
`extensionMessages` entries — they stay until the next language change or manifest
override. This is harmless today (rendering is driven by the enabled-plugins list, not
by these caches; the stale entry only costs a few KB), but could be tightened by also
clearing on `UPDATE_PLUGIN_SUCCESS` (disabled) and `REMOVE_PLUGIN_SUCCESS` in
`uiExtensions/reducer.js` and `uiExtensions/localization/reducer.js` if it ever becomes
a real problem (e.g. message id collisions between a stale and an active plugin).
