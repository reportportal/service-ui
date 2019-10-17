import moment from 'moment';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { getLaunchAxisTicks, getTimelineAxisTicks } from 'components/widgets/common/utils';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { getConfigData, calculateTooltipParams } from './utils';

export const getConfig = ({
  content,
  isPreview,
  formatMessage,
  positionCallback,
  size,
  isFullscreen,
  defectTypes,
  orderedContentFields,
  isTimeline,
  widgetViewMode,
  isZoomEnabled,
  isCustomTooltipNeeded,
  isSingleColumn,
  contentFields,
  onChartClick,
  onZoomEnd,
}) => {
  const configData = getConfigData(content, {
    defectTypes,
    orderedContentFields,
    contentFields,
    isTimeline,
  });
  const { itemNames, itemsData, colors, chartDataOrdered } = configData;
  return {
    customData: {
      itemsData,
      colors,
      legendItems: itemNames,
    },
    data: {
      columns: chartDataOrdered,
      type: widgetViewMode,
      onclick: !isPreview && !isCustomTooltipNeeded ? onChartClick : null,
      order: null,
      colors,
      groups: [itemNames],
    },
    point: {
      show: isSingleColumn && widgetViewMode === MODES_VALUES[CHART_MODES.AREA_VIEW],
      r: 5,
      focus: {
        expand: {
          r: 5,
        },
      },
    },
    axis: {
      x: {
        show: !isPreview,
        type: 'category',
        categories: itemsData.map((item) => {
          if (isTimeline) {
            const day = moment(item.date)
              .format('dddd')
              .substring(0, 3);
            return `${day}, ${item.date}`;
          }
          return `#${item.number}`;
        }),
        tick: {
          values: isTimeline
            ? getTimelineAxisTicks(itemsData.length)
            : getLaunchAxisTicks(itemsData.length),
          width: 60,
          centered: true,
          inner: true,
          multiline: isTimeline,
          outer: false,
        },
      },
      y: {
        show: !isPreview && isFullscreen,
        padding: {
          top: widgetViewMode === MODES_VALUES[CHART_MODES.AREA_VIEW] ? 16 : 3,
        },
      },
    },
    interaction: {
      enabled: !isPreview,
    },
    zoom: {
      enabled: !isPreview && isZoomEnabled,
      rescale: !isPreview && isZoomEnabled,
      onzoomend: onZoomEnd,
    },
    subchart: {
      show: !isPreview && isZoomEnabled,
      size: {
        height: 30,
      },
    },
    padding: {
      top: isPreview ? 0 : 85,
      left: isPreview ? 0 : 40,
      right: isPreview ? 0 : 20,
      bottom: isPreview || !isTimeline ? 0 : 10,
    },
    legend: {
      show: false,
    },
    tooltip: {
      show: !isPreview && !isCustomTooltipNeeded,
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        isTimeline,
        formatMessage,
        defectTypes,
      }),
    },
    size,
  };
};
