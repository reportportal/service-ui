export const appInfoSelector = (state) => state.appInfo || {};
export const buildVersionSelector = (state) => {
  const appInfo = appInfoSelector(state);
  return appInfo.UI && appInfo.UI.build ? appInfo.UI.build.version : '';
};
const UATInfoSelector = (state) => appInfoSelector(state).UAT || {};
export const authExtensionsSelector = (state) => UATInfoSelector(state).auth_extensions || {};
