export const appInfoSelector = (state) => state.appInfo || {};
export const buildVersionSelector = (state) => {
  const appInfo = appInfoSelector(state);
  return appInfo.UI && appInfo.UI.build ? appInfo.UI.build.version : '';
};
const UATInfoSelector = (state) => appInfoSelector(state).UAT || {};
const APIInfoSelector = (state) => appInfoSelector(state).API || {};
const APIInfoExtensionsSelector = (state) => APIInfoSelector(state).extensions || {};
const analyticsSelector = (state) => APIInfoExtensionsSelector(state).analytics || {};
export const authExtensionsSelector = (state) => UATInfoSelector(state).auth_extensions || {};
export const instanceIdSelector = (state) => APIInfoExtensionsSelector(state).instanceId || '';
export const analyticsEnabledSelector = (state) =>
  analyticsSelector(state).all ? analyticsSelector(state).all.enabled : false;
