import { ANALYICS_INSTANCE_KEY, ANALYTICS_ALL_KEY } from './constants';

export const appInfoSelector = (state) => state.appInfo || {};
const apiInfoSelector = (state) => appInfoSelector(state).api || {};
const uatInfoSelector = (state) => appInfoSelector(state).uat || {};
const uiInfoSelector = (state) => appInfoSelector(state).ui || {};

export const uiBuildVersionSelector = (state) => {
  const uiInfo = uiInfoSelector(state);
  return uiInfo.build ? uiInfo.build.version : '';
};
const extensionsSelector = (state) => apiInfoSelector(state).extensions || {};
const extensionsConfigSelector = (state) => extensionsSelector(state).result || {};
export const instanceIdSelector = (state) =>
  extensionsConfigSelector(state)[ANALYICS_INSTANCE_KEY] || '';
export const analyticsEnabledSelector = (state) =>
  extensionsConfigSelector(state)[ANALYTICS_ALL_KEY] === 'true';
export const analyzerExtensionsSelector = (state) => extensionsSelector(state).analyzers || [];
export const authExtensionsSelector = (state) => uatInfoSelector(state).authExtensions || {};
