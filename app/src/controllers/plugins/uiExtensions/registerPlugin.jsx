import { createExtensionOverrider } from './overrideExtension';

window.RP = {};

export const initPluginRegistration = (store) => {
  const overrideExtension = createExtensionOverrider(store);
  window.RP = {
    overrideExtension,
  };
};
