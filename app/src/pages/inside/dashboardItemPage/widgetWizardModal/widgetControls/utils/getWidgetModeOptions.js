import { defineMessages } from 'react-intl';
import { CHART_MODES } from 'common/constants/chartModes';

const messages = defineMessages({
  [CHART_MODES.LAUNCH_MODE]: {
    id: 'WidgetModes.launchMode',
    defaultMessage: 'Launch mode',
  },
  [CHART_MODES.TIMELINE_MODE]: {
    id: 'WidgetModes.timelineMode',
    defaultMessage: 'Timeline mode',
  },
  [CHART_MODES.ALL_LAUNCHES]: {
    id: 'WidgetModes.allLaunches',
    defaultMessage: 'All launches',
  },
  [CHART_MODES.LATEST_LAUNCHES]: {
    id: 'WidgetModes.latestLaunches',
    defaultMessage: 'Latest launches',
  },
  [CHART_MODES.AREA_VIEW]: {
    id: 'WidgetModes.areaViewMode',
    defaultMessage: 'Area view',
  },
  [CHART_MODES.BAR_VIEW]: {
    id: 'WidgetModes.barViewMode',
    defaultMessage: 'Bar view',
  },
  [CHART_MODES.DONUT_VIEW]: {
    id: 'WidgetModes.donutView',
    defaultMessage: 'Donut view',
  },
  [CHART_MODES.PANEL_VIEW]: {
    id: 'WidgetModes.panelView',
    defaultMessage: 'Panel view',
  },
  [CHART_MODES.PIE_VIEW]: {
    id: 'WidgetModes.pieView',
    defaultMessage: 'Pie view',
  },
  [CHART_MODES.TABLE_VIEW]: {
    id: 'WidgetModes.tableView',
    defaultMessage: 'Table view',
  },
});

export const getWidgetModeOptions = (viewModes, formatMessage) =>
  viewModes.map((viewMode) => ({
    value: viewMode,
    label: formatMessage(messages[`${viewMode}`]),
  }));
