import { getModal, addModal } from 'controllers/modal';
import { uiExtensionMap } from './uiExtensionStorage';
import { createImportProps } from './createImportProps';
import { EXTENSION_TYPE_MODAL } from './constants';

window.RP = {};

// TODO store will be used later to add new routes
// eslint-disable-next-line no-unused-vars
const createPluginRegistrationFunction = (store) => (plugin) => {
  const { name, extensions } = plugin;
  const wrappedExtensions = extensions.map((extension, i) => ({
    name: `${plugin.name}__${i}`,
    ...extension,
    component: (props) => <extension.component {...createImportProps(plugin.name)} {...props} />,
  }));
  wrappedExtensions.forEach((ex) => {
    if (ex.type === EXTENSION_TYPE_MODAL && !getModal({ id: ex.name })) {
      addModal(ex.name, ex.component);
    }
  });
  uiExtensionMap.set(name, wrappedExtensions);
};

export const initPluginRegistration = (store) => {
  const registerPlugin = createPluginRegistrationFunction(store);
  window.RP = {
    registerPlugin,
  };
};
