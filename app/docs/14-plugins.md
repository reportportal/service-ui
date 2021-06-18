# Plugins

From version 5 Report Portal supports custom plugins that can be uploaded to the system as `.jar` files on _plugins_ page (_https://your_server/ui/#administrate/plugins_) or via API.

## UI plugin engine

This guide contains information about the UI part of plugin engine and explains how it works on the UI side.<br/>
Information on how to create the entire plugin and integrate it with the API can be found [here](https://github.com/reportportal/plugin-example).

### How the core UI and plugin UI are linked during application run

**Preconditions**: The `.jar` plugin file must be uploaded to the Report Portal.

**Note:** It's important to keep all the assembled UI code in the `main.js` file on the plugin side.

When accessing the application through a browser, the core UI sends a request to the API to get the `main.js` file with the UI from the plugin.
This action is performed by sagas inside `fetchUiExtensions` in [sagas.js](https://github.com/reportportal/service-ui/blob/master/app/src/controllers/plugins/uiExtensions/sagas.js).<br/>
The UI code from the `main.js` files will be loaded for all enabled plugins that provides information about `binaryData` and supports the _getFile_ command.<br/>
During the app initialization will be created `window.RP` special object with `registerPlugin` function ([source](https://github.com/reportportal/service-ui/blob/master/app/src/controllers/plugins/uiExtensions/registerPlugin.jsx)).<br/>
This function must be used **in plugin** to define necessary extensions.<br/>
The supported extension types can be found [here](https://github.com/reportportal/service-ui/blob/master/app/src/controllers/plugins/uiExtensions/constants.js).

**Example:**

```javascript
window.RP.registerPlugin({
  name: 'My greeting plugin',
  extensions: [
    {
      name: 'greeting',
      title: 'Greeting',
      type: 'uiExtension:settingsTab',
      component: GreetingTabComponent,
    },
    {
      name: 'createGreetingModal',
      title: 'Create Greeting',
      type: 'uiExtension:modal',
      component: GreetingModal,
    },
  ],
});
```

The `component` property should contain a regular React component.

All loaded extensions can be used in application core via [selectors](https://github.com/reportportal/service-ui/blob/master/app/src/controllers/plugins/uiExtensions/selectors.js) by corresponding extension type.

#### Extension types description

**Note:** Every extension type is prefixed by `:uiExtension`, f.e. `uiExtension:modal`.

| Extension type        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| settingsTab           | Adds the new tab on project settings page (_https://your_server/ui/#{projectName}/settings/{tabName}_).                                                                                                                                                                                                                                                                                                                                                                  |
| modal                 | Adds the new modal component to the system (can be shown by calling `showModalAction` with corresponding modal `name`).                                                                                                                                                                                                                                                                                                                                                  |
| adminPage             | Adds the new page to the _administrate_ section.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| integrationFormFields | Provides the fields to the integration creation modal on project integrations page (_https://your_server/ui/#{projectName}/settings/integrations_).<br/>`IntegrationFormField` component from Core UI can be used here to simplify form building process.<br/>**Note:** Integration settings for the plugin will be available only if plugin provides `embedded` property in its `details`.                                                                              |
| integrationSettings   | Provides the integration settings component on project integrations page (_https://your_server/ui/#{projectName}/settings/integrations_).<br/> `IntegrationSettings` component from Core UI can be used here to reduce the time for building communication with API and follow common design and UX patterns as in other integrations.<br/>**Note:** Integration settings for the plugin will be available only if plugin provides `embedded` property in its `details`. |
| sidebarComponent      | Adds a component to the application sidebar.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| launchItemComponent   | Adds a component to the every launch entity on launches page (component will be displayed under the launch name).                                                                                                                                                                                                                                                                                                                                                        |

#### Permissions

For `integrations` page permissions are applied according to permission map (PM and Admin can edit settings on this page, other users have readonly access).<br/>
For all other extensions, permissions can be controlled by checking the appropriate user role (can be accessed through `activeProjectRoleSelector` and `isAdminSelector` selectors in plugin).

### Use dependencies in plugin

Since the plugin is written in a separate codebase, it requires some dependencies from the core [UI](https://github.com/reportportal/service-ui).<br/>
Since the Report Portal UI does not currently have an independent component library, the required dependencies are provided to the plugin extension via props for the highest component in the hierarchy.<br/>
With the same approach, the plugin is also provided with other useful stuff from the core UI.<br/>
This achieves by the function [createImportProps](https://github.com/reportportal/service-ui/blob/master/app/src/controllers/plugins/uiExtensions/createImportProps.js) that returns the object with the things from the core UI described above, including common things like buttons, inputs etc.

**Example:**

```jsx harmony
export const GreetingTabComponent = (props) => {
  const { userName, ...extensionProps } = props;
  const {
    lib: { React },
  } = extensionProps; // all other props come from `createImportProps` during plugin registration

  return <span style={{ color: 'gray' }>Hello, {userName}!</span>;
};
```

When using subcomponents, you need to pass `extensionProps` to those components in order to access the functionality from the core UI.

## Plugin sample

Sample [plugin](https://github.com/reportportal/plugin-example) to demonstrate how it can be written.
