import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import * as COLORS from 'common/constants/colors';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { MostTimeConsumingTestCasesTooltip } from './mostTimeConsumingTestCasesTooltip';
import { calculateTooltipParams } from './utils';

export const getConfig = ({ content, positionCallback, size: { height }, onChartClick }) => {
  const itemsData = [...content]
    .sort((a, b) => b.duration - a.duration)
    .map((item, index) => ({ ...item, tickIndex: 30 - index, index }));

  const getItemColor = (color, { index }) => {
    const status = itemsData[index] && itemsData[index].status;

    return COLORS[`COLOR_${status}`];
  };

  const dataClickHandler = (d) => {
    const targetItem = itemsData.find((item) => item.index === d.index) || {};

    onChartClick(targetItem.id);
  };

  return {
    data: {
      json: itemsData,
      keys: {
        x: 'tickIndex',
        value: ['duration'],
      },
      type: MODES_VALUES[CHART_MODES.BAR_VIEW],
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
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(MostTimeConsumingTestCasesTooltip, calculateTooltipParams, {
        itemsData,
      }),
    },
    size: {
      height,
    },
    point: {
      show: false,
    },
  };
};
