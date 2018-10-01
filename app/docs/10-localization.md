# Localization

For localization needs Report Portal uses [react-intl](https://github.com/yahoo/react-intl) library, which is a part of [FormatJS](https://formatjs.io/).

[Documentation](https://github.com/yahoo/react-intl/wiki)

All text content of application should be controlled by localization system.
At the moment Report Portal supports English (default), Russian and Belorussian languages.

Localization message id format: `ComponentsName.elementName` (for example FiltersPage.addFilterButton)

Localization of currently implemented (Backbone) version you can find [here](https://github.com/reportportal/service-ui/tree/localization_by/src/main/resources/public/js/src/localizations).
If you can't find some keys required for your developing component please contact [Yauheniya Labanava](https://telescope.epam.com/who/Yauheniya_Labanava).

> Please use `localization_by` branch only for getting BY localization keys. For other languages use `develop` branch. It's caused that `localization_by` branch is not up-to-date.

Localization workflow is:

1. Develop component and define default (English) translations using `<FormattedMessage>` component or `intl.formatMessage` function.
2. Execute npm script `manage:translations`.
3. Find keys, related to developing component, in `be.json` and `ru.json` files placed in `/localization/translated/` folder, and define translations for corresponding languages.
4. **IMPORTANT!** Make sure that only related to your component keys have been changed, and there is no deleted lines related to other existing components.
   If you see such case, please discuss it with [Maxim Tumas](https://telescope.epam.com/who/Maxim_Tumas).
