import { defineMessages } from 'react-intl';

const messages = defineMessages({
  launchMode: {
    id: 'WidgetModes.launchMode',
    defaultMessage: 'Launch mode',
  },
  timelineMode: {
    id: 'WidgetModes.timelineMode',
    defaultMessage: 'Timeline mode',
  },
  allLaunches: {
    id: 'WidgetModes.allLaunches',
    defaultMessage: 'All launches',
  },
  latestLaunches: {
    id: 'WidgetModes.latestLaunches',
    defaultMessage: 'Latest launches',
  },
  areaView: {
    id: 'WidgetModes.areaViewMode',
    defaultMessage: 'Area view',
  },
  barView: {
    id: 'WidgetModes.barViewMode',
    defaultMessage: 'Bar view',
  },
  donutView: {
    id: 'WidgetModes.donutView',
    defaultMessage: 'Donut view',
  },
  panelView: {
    id: 'WidgetModes.panelView',
    defaultMessage: 'Panel view',
  },
  pieView: {
    id: 'WidgetModes.pieView',
    defaultMessage: 'Pie view',
  },
  tableView: {
    id: 'WidgetModes.tableView',
    defaultMessage: 'Table view',
  },
});

export const getWidgetModeOptions = (viewModes, formatMessage) =>
  viewModes.map((viewMode) => ({
    value: viewMode,
    label: formatMessage(messages[`${viewMode}`]),
  }));
