import { CUMULATIVE_TREND } from 'common/constants/widgetTypes';
import { DEFAULT_WIDGET_CONFIG, CUMULATIVE_TREND_CHART_WIDGET_CONFIG } from './constants';

export const isWidgetDataAvailable = (data) => data.content && Object.keys(data.content).length;

export const prepareWidgetDataForSubmit = (data) => ({
  ...data,
  filterIds: (data.filters || []).map((item) => item.value),
});

export const getDefaultWidgetConfig = (widgetType) =>
  widgetType === CUMULATIVE_TREND ? CUMULATIVE_TREND_CHART_WIDGET_CONFIG : DEFAULT_WIDGET_CONFIG;

export const getUpdatedWidgetsList = (oldWidgets, newWidget) => {
  const {
    widgetSize: { width: newWidgetWidth, height: newWidgetHeight },
  } = newWidget;
  const newWidgets = oldWidgets.map((item) => {
    const {
      widgetPosition: { positionY, positionX },
    } = item;

    return {
      ...item,
      widgetPosition: {
        ...item.widgetPosition,
        positionY: positionX < newWidgetWidth ? positionY + newWidgetHeight : positionY,
      },
    };
  });
  newWidgets.unshift(newWidget);

  return newWidgets;
};
