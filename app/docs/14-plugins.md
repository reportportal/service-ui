# Plugins

From version 5 Report Portal supports custom plugins that can be uploaded to the system as `.jar` files on _plugins_ page (_https://your_server/ui/#administrate/plugins_) or via API.

## UI plugin engine

This guide contains information about the UI part of plugin engine and explains how it works on the UI side.<br/>
Information on how to create the entire plugin and integrate it with the API can be found [here]().

### How the core UI and plugin UI are linked during application run

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

### Use dependencies in plugin

Since the plugin is written in a separate codebase, it requires some dependencies from the core [UI](https://github.com/reportportal/service-ui).<br/>
Since the Report Portal UI does not currently have an independent component library, the required dependencies are provided to the plugin extension via props for the highest component in the hierarchy.<br/>
With the same approach, the plugin is also provided with other useful stuff from the core UI.<br/>
This achieves by the function [createImportProps](https://github.com/reportportal/service-ui/blob/master/app/src/controllers/plugins/uiExtensions/createImportProps.js) that returns the object with the things from the core UI described above.

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

Sample plugin to demonstrate how it can be written.
_Link will be provided later_
