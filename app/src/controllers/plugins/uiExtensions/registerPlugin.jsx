import { getModal, addModal } from 'controllers/modal';
import { uiExtensionMap } from './uiExtensionStorage';
import { createImportProps } from './createImportProps';
import { createExtensionOverrider } from './overrideExtension';
import { EXTENSION_TYPE_MODAL } from './constants';

window.RP = {};

// TODO: remove legacy extensions when all existing plugins will be migrated to the new engine
// TODO: store will be used later to add new routes
// eslint-disable-next-line no-unused-vars
const createPluginRegistrationFunction = (store) => (plugin) => {
  const { name, extensions } = plugin;
  const importProps = createImportProps(name);
  const wrappedExtensions = extensions.map((extension, i) => ({
    name: `${name}__${i}`,
    pluginName: name,
    ...extension,
    component: (props) => <extension.component {...importProps} {...props} />,
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
  const overrideExtension = createExtensionOverrider(store);
  window.RP = {
    registerPlugin,
    overrideExtension,
  };
};
