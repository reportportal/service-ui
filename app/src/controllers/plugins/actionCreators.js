import { URLS } from 'common/urls';
import { fetchDataAction } from 'controllers/fetch';
import { NAMESPACE, GLOBAL_INTEGRATIONS_NAMESPACE } from './constants';

export const fetchPluginsAction = () => fetchDataAction(NAMESPACE)(URLS.plugin());

export const fetchGlobalIntegrationsAction = () =>
  fetchDataAction(GLOBAL_INTEGRATIONS_NAMESPACE)(URLS.globalIntegrationsByPluginName());
