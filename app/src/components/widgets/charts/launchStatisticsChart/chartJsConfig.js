import * as COLORS from 'common/constants/colors';
import { messages } from 'components/widgets/charts/launchExecutionAndIssueStatistics/messages';

const EXECUTIONS = 'executions';
const getColorForKey = (key) => COLORS[`COLOR_${key.split('$')[2].toUpperCase()}`];
const isTotalDataset = (field) => /executions\$total/.test(field);
const createDataSet = (field, group, result, options) => ({
  label: field,
  hidden: options.disabledFields.includes(field),
  backgroundColor: getColorForKey(field),
  stack: isTotalDataset(field) ? 'total' : group,
  datalabels: {
    display: false,
    align: 'end',
    anchor: 'end',
    offset: -5,
  },
  data: options.isTimeLine
    ? Object.keys(result).map((item) => result[item].values[field] || 0)
    : result.map((item) => item.values[field] || 0),
  pointRadius: 1,
});
const getChartOptions = (result, options) => {
  const { percentage, formatMessage, isTimeLine, isPreview } = options;
  return {
    legend: {
      display: false,
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 50,
        bottom: 0,
      },
    },
    scales: {
      yAxes: [
        {
          stacked: true,
          ticks: {
            max: percentage ? 100 : undefined,
            callback: (value) => `${value}${percentage ? '%' : ''}`,
          },
        },
      ],
      xAxes: [
        {
          id: EXECUTIONS,
          categoryPercentage: 0.4,
          gridLines: {
            display: false,
            offsetGridLines: true,
          },
        },
      ],
    },
    tooltips: {
      enabled: !isPreview,
      intersect: true,
      mode: 'x',
      backgroundColor: '#FFF',
      titleFontSize: 14,
      titleFontColor: '#464547',
      bodyFontColor: '#464547',
      bodyFontSize: 13,
      displayColors: true,
      borderColor: '#d4d4d4',
      borderWidth: 1,
      bodySpacing: 5,
      callbacks: {
        title: (tooltipItem) =>
          isTimeLine
            ? tooltipItem[0].label
            : `${result[tooltipItem[0].index].name} ${tooltipItem[0].label}`,

        label(tooltipItem, data) {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const label = messages[dataset.label]
            ? formatMessage(messages[dataset.label])
            : dataset.label;
          const value = Number(dataset.data[tooltipItem.index]);

          return ` ${label}: ${value}`;
        },
      },
    },
  };
};
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

export const getChartData = (widget, options) => {
  const { result } = widget.content;
  const { isTimeLine } = options;
  const sortedResult = isTimeLine ? result : result.sort((a, b) => a.number - b.number);
  const labels = isTimeLine ? Object.keys(sortedResult) : sortedResult.map((item) => item.number);
  const legendItems = isTimeLine
    ? Object.keys(sortedResult).reduce(
        (acc, item) => acc.concat(Object.keys(sortedResult[item].values)).filter(onlyUnique),
        [],
      )
    : sortedResult.reduce(
        (acc, item) => acc.concat(Object.keys(item.values)).filter(onlyUnique),
        [],
      );
  const datasets = legendItems.map((field) =>
    createDataSet(field, EXECUTIONS, sortedResult, options),
  );
  const chartOptions = getChartOptions(sortedResult, options);
  return { labels, datasets, chartOptions, legendItems };
};
