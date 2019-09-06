import { defineMessages } from 'react-intl';
import { COLOR_FAILED } from 'common/constants/colors';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { getLaunchAxisTicks } from 'components/widgets/common/utils';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { getTicks, calculateTooltipParams } from './utils';

const localMessages = defineMessages({
  failedCasesLabel: {
    id: 'FailedCasesTrendChart.failedCases',
    defaultMessage: 'failed cases',
  },
});

export const getConfig = ({ content, isPreview, formatMessage, positionCallback, size }) => {
  const chartData = ['failed'];
  const itemsData = [];
  let topExtremum = 0;
  let bottomExtremum = Infinity;

  content.result.forEach((item) => {
    if (+item.values.total > topExtremum) {
      topExtremum = +item.values.total;
    }
    if (+item.values.total < bottomExtremum) {
      bottomExtremum = +item.values.total;
    }
    itemsData.push({
      id: item.id,
      name: item.name,
      number: item.number,
      startTime: item.startTime,
    });
    chartData.push(item.values.total);
  });

  return {
    data: {
      columns: [chartData],
      colors: {
        failed: COLOR_FAILED,
      },
    },
    point: {
      sensitivity: 1000,
      r: itemsData.length === 1 ? 5 : 1,
      focus: {
        expand: {
          r: 5,
        },
      },
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
        categories: itemsData.map((item) => `# ${item.number}`),
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
          values: getTicks(bottomExtremum, topExtremum),
          outer: false,
        },
        padding: {
          top: 5,
          bottom: 0,
        },
        label: {
          text: formatMessage(localMessages.failedCasesLabel),
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
      show: false, // we use custom legend
    },
    tooltip: {
      grouped: true,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
      }),
    },
    size,
  };
};
