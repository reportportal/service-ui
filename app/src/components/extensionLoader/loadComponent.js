// https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
export function loadComponent(scope, moduleName) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // eslint-disable-next-line
    await __webpack_init_sharing__("default");

    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // eslint-disable-next-line
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(moduleName);
    const Module = factory();
    return Module;
  };
}
