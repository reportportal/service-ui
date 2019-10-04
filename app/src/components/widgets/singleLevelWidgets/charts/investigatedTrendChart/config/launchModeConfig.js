import {
  getLaunchAxisTicks,
  transformCategoryLabelByDefault,
} from 'components/widgets/common/utils';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { COLORS } from 'components/widgets/common/constants';
import { calculateTooltipParams, localMessages } from './utils';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';

export const getLaunchModeConfig = ({
  content,
  isPreview,
  formatMessage,
  positionCallback,
  size,
  onChartClick,
}) => {
  const colors = {};
  const columns = [];

  const sortedResult = content.sort((item) => -item.number);
  const itemsData = sortedResult.map((item) => ({
    id: item.id,
    name: item.name,
    number: item.number,
    startTime: item.startTime,
  }));
  const groups = Object.keys(sortedResult[0].values);

  groups.forEach((type) => {
    const values = sortedResult.map((item) => item.values[type] || 0);
    colors[type] = COLORS[type];
    columns.push([type, ...values]);
  });

  return {
    legendItems: groups,
    data: {
      columns,
      type: 'bar',
      order: null,
      groups: [groups],
      colors,
      onclick: isPreview ? null : onChartClick,
    },
    grid: {
      y: {
        show: !isPreview,
      },
    },
    axis: {
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
        show: true,
        max: 100,
        padding: {
          top: 0,
        },
        label: {
          text: formatMessage(localMessages.yAxisInvestigationsTitle),
          position: 'outer-middle',
        },
      },
    },
    interaction: {
      enabled: !isPreview,
    },
    padding: {
      top: isPreview ? 0 : 85,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 10,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
      }),
    },
    size,
  };
};
