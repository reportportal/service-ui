import { createSelector } from 'reselect';
import { activeDashboardIdSelector, createQueryParametersSelector } from 'controllers/pages';

const domainSelector = (state) => state.dashboards || {};

export const dashboardItemsUnsortedSelector = (state) => domainSelector(state).dashboards;

export const dashboardItemsSelector = createSelector(
  dashboardItemsUnsortedSelector,
  (dashboardItems) => dashboardItems.sort((a, b) => a.name.localeCompare(b.name)),
);

export const dashboardGridTypeSelector = (state) => domainSelector(state).gridType;

export const activeDashboardItemSelector = createSelector(
  dashboardItemsUnsortedSelector,
  activeDashboardIdSelector,
  (dashboardItems, activeDashboardId) =>
    dashboardItems.find((item) => item.id === activeDashboardId) || {},
);

export const dashboardFullScreenModeSelector = (state) => domainSelector(state).fullScreenMode;

export const querySelector = createQueryParametersSelector();
