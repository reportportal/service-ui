export const appInfoSelector = state => state.appInfo || {};

const UATInfoSelector = state => appInfoSelector(state).UAT || {};
export const authExtensionsSelector = state => UATInfoSelector(state).auth_extensions;
