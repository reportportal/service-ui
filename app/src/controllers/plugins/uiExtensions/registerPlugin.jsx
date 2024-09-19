import { createExtensionOverrider } from './overrideExtension';

window.RP = {};

export const initPluginRegistration = (store) => {
  // allows overriding plugin UI extensions in favor of separately hosted files (e.g. locally hosted plugin files)
  const overrideExtension = createExtensionOverrider(store);
  window.RP = {
    overrideExtension,
  };
};
