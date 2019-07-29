import { ANALYICS_INSTANCE_KEY, ANALYTICS_ALL_KEY } from './constants';

const appInfoSelector = (state) => state.appInfo || {};
const apiInfoSelector = (state) => appInfoSelector(state).apiInfo;
export const compositeInfoSelector = (state) => appInfoSelector(state).compositeInfo;

export const buildVersionSelector = (state) => {
  const appInfo = apiInfoSelector(state);
  return appInfo.build ? appInfo.build.version : '';
};
const extensionsSelector = (state) => apiInfoSelector(state).extensions || {};
const extensionConfigSelector = (state) => extensionsSelector(state).result || {};
export const instanceIdSelector = (state) => extensionsSelector(state)[ANALYICS_INSTANCE_KEY] || '';
export const analyticsEnabledSelector = (state) =>
  extensionConfigSelector(state)[ANALYTICS_ALL_KEY] === 'true';
export const analyzerExtensionsSelector = (state) => extensionsSelector(state).analyzer || [];
const uatInfoSelector = (state) => compositeInfoSelector(state).uat || {};
export const authExtensionsSelector = (state) => uatInfoSelector(state).authExtensions || {};
