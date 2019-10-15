import { defineMessages } from 'react-intl';
import { getItemColor, transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams } from './utils';

const messages = defineMessages({
  ofTestCases: {
    id: 'Widgets.ofTestCases',
    defaultMessage: 'of test cases',
  },
});

export const getConfig = ({
  content,
  contentParameters,
  isPreview,
  formatMessage,
  positionCallback,
  size,
  defectTypes,
  onChartClick,
}) => {
  const chartData = {};
  const chartDataOrdered = [];
  const colors = {};
  const contentFields = contentParameters.contentFields;

  const itemsData = [];

  contentFields.forEach((key) => {
    chartData[key] = [key];
    colors[key] = getItemColor(key, defectTypes);
  });

  content.forEach((item) => {
    itemsData.push({
      id: item.id,
      name: item.name,
      number: item.number,
      startTime: item.startTime,
    });
    contentFields.forEach((key) => {
      const val = item.values[key] || 0;
      chartData[key].push(val);
    });
  });

  contentFields.forEach((key) => {
    if (key === 'statistics$executions$total') {
      return;
    }
    chartDataOrdered.push(chartData[key]);
  });
  chartDataOrdered.reverse();

  const legendItems = chartDataOrdered.map((item) => item[0]);

  return {
    legendItems,
    data: {
      columns: chartDataOrdered,
      type: 'bar',
      order: null,
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
          centered: true,
          inner: true,
          outer: false,
        },
        lines: [{ value: 5, text: 'Label', class: 'color-grid' }],
      },
      y: {
        show: !isPreview,
        padding: {
          top: 0,
        },
        max: 100,
        label: {
          text: `% ${formatMessage(messages.ofTestCases)}`,
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
      bottom: 0,
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
        defectTypes,
      }),
    },
    size,
  };
};
