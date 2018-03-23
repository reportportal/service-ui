export const dashboardItemsSelector = state =>
  state.dashboard.dashboardItems.sort((a, b) => a.name.localeCompare(b.name));

export const dashboardGridTypeSelector = state => state.dashboard.gridType;
