import { apiTokenSelector } from 'controllers/user';
import { dashboardFullScreenModeSelector } from 'controllers/dashboard';

const authSelector = (state) => state.auth || {};

export const isAuthorizedSelector = (state) => !!authSelector(state).authorized;
export const tokenSelector = (state) =>
  dashboardFullScreenModeSelector(state) ? apiTokenSelector(state) : authSelector(state).token;
