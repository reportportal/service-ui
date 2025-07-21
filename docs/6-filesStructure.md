# Files structure

`/localization/` - localization config.<br>

`/src/` - application sources:

- `/src/common/` - common constants, common css, css variables, fonts, images, icons, utils, polyfills, urls, hooks.
- `/src/components/` - common, reusable components base that are not included in the ui-kit.
- `/src/controllers/` - stuff related to Redux (reducers, sagas, action creators, selectors and ect.).
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
> │   ├── utils.js (if component has local utilities, which are used several times by sub components)
> │   └── subComponentFolder (if has)
> │       └── ...
> ```

## Creating New Routes

The application uses Redux First Router for routing. To create a new route, follow these steps:

### 1. Define Route Constants

Add your route constant to `/src/controllers/pages/constants.js`:

```javascript
export const MY_NEW_PAGE = 'MY_NEW_PAGE';
```

Add it to the `pageNames` object in the same file as it used in `PageSwitcher` component:

```javascript
export const pageNames = {
  // ... existing pages
  MY_NEW_PAGE,
};
```

### 2. Export Route Constant

Add the route constant to the exports in `/src/controllers/pages/index.js`:

```javascript
export {
  // ... existing exports
  MY_NEW_PAGE,
} from './constants';
```

### 3. Create Page Component

Create your page component in `/src/pages/inside/myNewPage/`:

```typescript
// myNewPage.tsx
import React from 'react';
import { useIntl } from 'react-intl';
import { SettingsLayout } from 'layouts/settingsLayout';

export const MyNewPage = () => {
  const { formatMessage } = useIntl();
  
  return (
    <SettingsLayout>
      <div>My New Page Content</div>
    </SettingsLayout>
  );
};
```

### 4. Define Route URL

Add the route URL mapping to `/src/routes/routesMap.js`:

```javascript
import { MY_NEW_PAGE } from 'controllers/pages';

const routesMap = {
  // ... existing routes
  [MY_NEW_PAGE]: '/organizations/:organizationSlug/projects/:projectSlug/my-new-page',
};
```

For routes with thunks/sagas:

```javascript
[MY_NEW_PAGE]: {
  path: '/organizations/:organizationSlug/projects/:projectSlug/my-new-page',
  thunk: (dispatch, getState) => {
    // Optional: dispatch actions when route is loaded
    dispatch(fetchDataAction());
  },
},
```

### 5. Configure Page Rendering

Add page rendering configuration to `/src/routes/constants.js`:

Import your component:

```javascript
import { MyNewPage } from 'pages/inside/myNewPage';
```

Add to pageRendering object:

```javascript
export const pageRendering = {
  // ... existing pages
  [MY_NEW_PAGE]: {
    component: MyNewPage,
    layout: ProjectLayout, // or InstanceLayout, OrganizationLayout, EmptyLayout
    rawContent: true, // optional: bypass some layout processing
  },
};
```

### 6. Add Navigation

To navigate to your new route, dispatch router action.

```javascript
import { useDispatch } from 'react-redux';
import { MY_NEW_PAGE } from 'controllers/pages';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleNavigate = () => {
    dispatch({
      type: MY_NEW_PAGE,
      payload: {
        organizationSlug: 'my-org',
        projectSlug: 'my-project',
      },
    });
  };
  
  return <button onClick={handleNavigate}>Go to My New Page</button>;
};
```

### 7. Route Access Control (Optional)

Add access control to your page in `/src/routes/constants.js`:

```javascript
export const pageRendering = {
  [MY_NEW_PAGE]: {
    component: MyNewPage,
    layout: ProjectLayout,
    access: ADMIN_ACCESS, // or ANONYMOUS_ACCESS
  },
};
```

### Required Files Summary

When creating a new route, you need to modify these files:

1. `/src/controllers/pages/constants.js` - Add route constant and pageNames entry
2. `/src/controllers/pages/index.js` - Export the route constant  
3. `/src/routes/routesMap.js` - Define the URL pattern
4. `/src/routes/constants.js` - Configure page rendering and layout
5. `/src/pages/inside/yourPage/` - Create the page component

### Common Route Patterns

**Project-level routes:**
```
/organizations/:organizationSlug/projects/:projectSlug/your-page
```

**Organization-level routes:**
```
/organizations/:organizationSlug/your-page
```

**Instance-level routes:**
```
/your-page
```

**Routes with parameters:**
```
/organizations/:organizationSlug/projects/:projectSlug/items/:itemId
```
