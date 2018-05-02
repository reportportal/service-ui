export const appInfoSelector = state => state.appInfo || {};
export const buildVersionSelector = state => appInfoSelector(state).UI.build.version || {};
const UATInfoSelector = state => appInfoSelector(state).UAT || {};
export const authExtensionsSelector = state => UATInfoSelector(state).auth_extensions;
