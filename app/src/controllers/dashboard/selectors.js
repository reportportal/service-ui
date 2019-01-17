import { createSelector } from 'reselect';
import { activeDashboardIdSelector } from 'controllers/pages';

const domainSelector = (state) => state.dashboard || {};

export const dashboardItemsUnsortedSelector = (state) => domainSelector(state).dashboardItems;

export const dashboardItemsSelector = (state) =>
  dashboardItemsUnsortedSelector(state).sort((a, b) => a.name.localeCompare(b.name));

export const dashboardGridTypeSelector = (state) => domainSelector(state).gridType;

export const activeDashboardItemSelector = createSelector(
  dashboardItemsUnsortedSelector,
  activeDashboardIdSelector,
  (dashboardItems, activeDashboardId) =>
    dashboardItems.find((item) => item.id === activeDashboardId) || {},
);
