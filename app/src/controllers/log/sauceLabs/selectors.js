import { sauceLabsSelector } from 'controllers/log/selectors';

export const jobInfoSelector = (state) => sauceLabsSelector(state).jobInfo || {};

export const sauceLabsLogsSelector = (state) => sauceLabsSelector(state).logs || [];

export const sauceLabsLoadingSelector = (state) => sauceLabsSelector(state).loading || false;

export const sauceLabsIntegrationDataSelector = (state) =>
  sauceLabsSelector(state).integrationData || {};
