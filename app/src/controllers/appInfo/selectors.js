export const getAppInfo = state => state.appInfo || {};

const getUATInfo = state => getAppInfo(state).UAT || {};
export const getAuthExtensions = state => getUATInfo(state).auth_extensions;
