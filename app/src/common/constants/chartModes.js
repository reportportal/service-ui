export const CHART_MODES = {
  LAUNCH_MODE: 'launchMode',
  TIMELINE_MODE: 'timelineMode',

  ALL_LAUNCHES: 'allLaunches',
  LATEST_LAUNCHES: 'latestLaunches',

  AREA_VIEW: 'areaView',
  BAR_VIEW: 'barView',
  TABLE_VIEW: 'tableView',
  PANEL_VIEW: 'panelView',
  DONUT_VIEW: 'donutView',
  PIE_VIEW: 'pieView',
};

export const MODES_VALUES = {
  [CHART_MODES.ALL_LAUNCHES]: false,
  [CHART_MODES.LATEST_LAUNCHES]: true,
  [CHART_MODES.AREA_VIEW]: 'area-spline',
  [CHART_MODES.PIE_VIEW]: 'pie',
  [CHART_MODES.BAR_VIEW]: 'bar',
  [CHART_MODES.LAUNCH_MODE]: 'launch',
  [CHART_MODES.TABLE_VIEW]: 'table',
  [CHART_MODES.DONUT_VIEW]: 'donut',
  [CHART_MODES.PANEL_VIEW]: 'panel',
};
