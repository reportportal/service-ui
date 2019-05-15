import { FETCH_PLUGINS, FETCH_GLOBAL_INTEGRATIONS } from './constants';

export const fetchPluginsAction = () => ({
  type: FETCH_PLUGINS,
});

export const fetchGlobalIntegrationsAction = () => ({
  type: FETCH_GLOBAL_INTEGRATIONS,
});
