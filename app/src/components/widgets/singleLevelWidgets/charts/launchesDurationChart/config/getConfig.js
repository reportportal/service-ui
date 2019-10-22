import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { COLOR_CHART_DURATION, COLOR_INTERRUPTED } from 'common/constants/colors';
import {
  getLaunchAxisTicks,
  transformCategoryLabelByDefault,
} from 'components/widgets/common/utils';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { DURATION, isValueInterrupted, prepareChartData, calculateTooltipParams } from './utils';
import { LaunchesDurationTooltip } from './launchesDurationTooltip';

export const getConfig = ({
  content,
  isPreview,
  formatMessage,
  positionCallback,
  size,
  onChartClick,
}) => {
  const { timeType, chartData, itemsData = [] } = prepareChartData(content);

  return {
    data: {
      columns: [chartData],
      type: 'bar',
      groups: [[DURATION]],
      color: (color, d) => {
        const item = itemsData[d.index];
        if (item && isValueInterrupted(item)) {
          return COLOR_INTERRUPTED;
        }
        return COLOR_CHART_DURATION;
      },
      onclick: isPreview ? null : onChartClick,
    },
    grid: {
      y: {
        show: !isPreview,
      },
    },
    axis: {
      rotated: true,
      x: {
        show: !isPreview,
        type: 'category',
        categories: itemsData.map(transformCategoryLabelByDefault),
        tick: {
          values: getLaunchAxisTicks(itemsData.length),
          width: 60,
          centered: true,
          inner: true,
          multiline: false,
          outer: false,
        },
      },
      y: {
        show: !isPreview,
        tick: {
          format: (d) => (parseInt(d, 10) / timeType.value).toFixed(2),
        },
        padding: {
          top: 0,
          bottom: 0,
        },
        label: {
          text: formatMessage(COMMON_LOCALE_KEYS.SECONDS),
          position: 'outer-center',
        },
      },
    },
    interaction: {
      enabled: !isPreview,
    },
    padding: {
      top: isPreview ? 0 : 20,
      left: isPreview ? 0 : 40,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 10,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: true,
      position: positionCallback,
      contents: createTooltipRenderer(LaunchesDurationTooltip, calculateTooltipParams, {
        itemsData,
        timeType,
        formatMessage,
      }),
    },
    size,
  };
};
