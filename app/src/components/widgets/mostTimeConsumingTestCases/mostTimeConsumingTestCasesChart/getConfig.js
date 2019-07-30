import { PERIOD_VALUES } from 'common/constants/statusPeriodValues';
import {
  COLOR_TIMECONSUMING_BAR_RED,
  COLOR_TIMECONSUMING_BAR_GREEN,
} from 'common/constants/colors';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { MostTimeConsumingTooltip } from '../mostTimeConsumingTooltip/index';

export const getConfig = ({
  content,
  intl,
  positionCallback,
  size: { height },
  interval,
  messages: MESSAGES,
  chartType = MODES_VALUES[CHART_MODES.BAR_VIEW],
  isPointsShow = true,
  testCaseClickHandler,
}) => {
  const data = [...content.result]
    .sort((a, b) => b.duration - a.duration)
    .map((item, index) => ({ ...item, tickIndex: 30 - index, index }));

  const getItemColor = (color, { index }) =>
    index % 2 ? COLOR_TIMECONSUMING_BAR_GREEN : COLOR_TIMECONSUMING_BAR_RED;

  const dataClickHandler = (d) => {
    const targetItem = data.filter((item) => item.index === d.index)[0] || {};

    testCaseClickHandler(targetItem.id);
  };

  return {
    data: {
      json: data,
      keys: {
        x: 'tickIndex',
        value: ['duration'],
      },
      type: chartType,
      order: null,
      color: getItemColor,
      onclick: dataClickHandler,
    },
    grid: {
      y: {
        show: true,
      },
    },
    axis: {
      rotated: true,
      x: {
        show: true,
        type: 'category',
        tick: {
          culling: {
            max: 6,
          },
          centered: true,
          inner: true,
          multiline: true,
          outer: false,
        },
        label: {
          text:
            interval === PERIOD_VALUES.ONE_MONTH
              ? intl.formatMessage(MESSAGES.xAxisDaysTitle)
              : intl.formatMessage(MESSAGES.xAxisWeeksTitle),
          position: 'outer-center',
        },
      },
      y: {
        show: true,
        padding: {
          top: 0,
        },
      },
    },
    interaction: {
      enabled: true,
    },
    padding: {
      top: 40,
      left: 35,
      right: 10,
      bottom: 10,
    },
    legend: {
      show: false,
    },
    tooltip: {
      show: true,
      grouped: false,
      position: positionCallback,
      contents: MostTimeConsumingTooltip(data),
    },
    size: {
      height,
    },
    point: {
      show: isPointsShow,
    },
  };
};
