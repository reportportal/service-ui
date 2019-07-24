import { sauceLabsSelector } from 'controllers/log/selectors';

export const jobInfoSelector = (state) => sauceLabsSelector(state).jobInfo || {};

export const sauceLabsLogsSelector = (state) => sauceLabsSelector(state).logs || [];

export const sauceLabsAssetsSelector = (state) => sauceLabsSelector(state).assets || {};

export const sauceLabsLoadingSelector = (state) => sauceLabsSelector(state).loading || false;

export const sauceLabsAuthTokenSelector = (state) => sauceLabsSelector(state).authToken || '';
