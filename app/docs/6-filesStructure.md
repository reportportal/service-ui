# Files structure

`/.storybook/` - storybook config.<br>

`/docs/` - developers guide.<br>

`/localization/` - localization config.<br>

`/src/` - application sources:

- `/src/common/` - common constants, common css, css variables, fonts, images, icons, utils, polyfils, urls.
- `/src/components/` - common, reusable components base.
- `/src/controllers/` - stuff related to Redux(reducers, sagas, action creators, selectors and ect.).
- `/src/layouts/` - application layouts.
- `/src/pages/` - main development area. Contains project pages.
- `/src/routes/` - router configuration.
- `/src/store/` - Redux store configuration.

> ##### All common components or presentational components should have following structure:
>
> ```
> ├── componentName
> │   ├── componentName.jsx
> │   ├── componentName.scss
> │   ├── index.js (with component's export)
> │   ├── constants.js (if component has local constants, which are used several times by sub components)
> │   └── subComponentFolder (if has)
> │       └── ...
> ```
