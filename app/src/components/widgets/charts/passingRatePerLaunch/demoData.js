export const passingRateBarData = {
  share: false,
  id: 2,
  name: 'test widget1',
  applied_filters: [],
  content: {
    result: {
      passed: 10,
      total: 36,
    },
  },
  content_parameters: {
    widget_type: 'passing_rate_per_launch',
    content_fields: [],
    itemsCount: 100,
    widgetOptions: {
      launchNameFilter: 'test launch',
      viewMode: 'barMode',
    },
  },
};

export const passingRatePieData = {
  share: false,
  id: 2,
  name: 'test widget1',
  applied_filters: [],
  content: {
    result: {
      passed: 10,
      total: 36,
    },
  },
  content_parameters: {
    widget_type: 'passing_rate_per_launch',
    content_fields: [],
    itemsCount: 100,
    widgetOptions: {
      launchNameFilter: 'test launch',
      viewMode: 'pieChartMode',
    },
  },
};
