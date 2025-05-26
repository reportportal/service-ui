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
