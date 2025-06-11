import { createExtensionOverrider, createExtensionAppender } from './overrideExtension';

window.RP = {};

export const initPluginRegistration = (store) => {
  window.RP = {
    // allows overriding plugin UI extensions in favor of separately hosted files (e.g. locally hosted plugin files)
    overrideExtension: createExtensionOverrider(store),
    // allows appending UI extensions (e.g. locally or somewhere hosted files)
    appendExtension: createExtensionAppender(store),
  };
};
