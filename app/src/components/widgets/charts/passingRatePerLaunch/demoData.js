export const passingRateBarData = {
  share: false,
  id: 2,
  name: 'test widget1',
  appliedFilters: [],
  content: {
    result: {
      passed: 10,
      total: 36,
    },
  },
  contentParameters: {
    widgetType: 'passing_rate_per_launch',
    contentFields: [],
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
  appliedFilters: [],
  content: {
    result: {
      passed: 10,
      total: 36,
    },
  },
  contentParameters: {
    widgetType: 'passing_rate_per_launch',
    contentFields: [],
    itemsCount: 100,
    widgetOptions: {
      launchNameFilter: 'test launch',
      viewMode: 'pieChartMode',
    },
  },
};
