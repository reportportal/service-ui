import { uiExtensionMap } from './uiExtensionStorage';
import { createImportProps } from './createImportProps';

window.RP = {};

// TODO store will be used later to add new routes
// eslint-disable-next-line no-unused-vars
const createPluginRegistrationFunction = (store) => (plugin) => {
  const { name, extensions } = plugin;
  const wrappedExtensions = extensions.map((extension, i) => ({
    name: `${plugin.name}__${i}`,
    ...extension,
    component: <extension.component {...createImportProps(plugin.name)} />,
  }));
  uiExtensionMap.set(name, wrappedExtensions);
};

export const initPluginRegistration = (store) => {
  const registerPlugin = createPluginRegistrationFunction(store);
  window.RP = {
    registerPlugin,
  };
};
