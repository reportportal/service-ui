import * as COLORS from 'common/constants/colors';
import { messages } from 'components/widgets/charts/launchExecutionAndIssueStatistics/messages';

const Color = require('color');

const EXECUTIONS = 'executions';
const DEFECTS = 'defects';

const getDefects = (fields) => fields.filter((item) => /defects/.test(item));

const getExecutions = () => [
  'statistics$executions$passed',
  'statistics$executions$failed',
  'statistics$executions$skipped',
];

const getTotal = () => ['statistics$executions$total'];

const convertIntoPercents = (datasets) => {
  const totalDataset = Object.assign({}, datasets[0]);

  return datasets.map((dataset) =>
    Object.assign(
      {
        absData: dataset.data,
      },
      dataset,
      {
        data: dataset.data.map(
          (value, index) => -(-value / totalDataset.data[index] * 100).toFixed(2),
        ),
      },
    ),
  );
};

const firstCapital = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const getColorForKey = (key) => COLORS[`COLOR_${key.split('$')[2].toUpperCase()}`];

export const generateChartColors = (widget) => {
  const colors = {};
  widget.contentParameters.contentFields.forEach((key) => {
    // gets colors for items
    colors[key] = getColorForKey(key);
  });
  return colors;
};
/* eslint func-names: ["error", "never" ] */
const createDataSet = (field, group, options) => {
  const { defectTypes, separate, showTotal, uncheckedLegendItems } = options;
  const isTotalDataset = /executions\$total/.test(field);
  const color = isTotalDataset ? 'transparent' : getColorForKey(field);

  return {
    label: field,
    hidden: uncheckedLegendItems.includes(field) || (isTotalDataset && !showTotal),
    data: [],
    borderColor: isTotalDataset ? '#000000' : color,
    borderWidth: isTotalDataset ? { left: 0, top: 0, right: 1, bottom: 0 } : 0,
    backgroundColor:
      group === DEFECTS && !defectTypes
        ? Color(color)
            .alpha(0.3)
            .string()
        : color,
    stack: separate ? field : group,
    datalabels: {
      display: isTotalDataset,
      align: 'end',
      anchor: 'end',
      offset: -5,
    },
  };
};

const getScaleName = (widget, options) => {
  const { attributes } = widget.contentParameters.widgetOptions;
  const { activeAttribute } = options;
  return activeAttribute ? attributes[1] : attributes[0];
};

const getChartOptions = (widget, options) => {
  const { percentage, formatMessage, tooltipContents, showTotal } = options;

  return {
    legend: {
      display: false,
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 30,
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
          id: DEFECTS,
          categoryPercentage: 0.4,
          gridLines: {
            display: false,
            offsetGridLines: true,
          },
          scaleLabel: {
            display: true,
            labelString: firstCapital(getScaleName(widget, options)),
            fontSize: 15,
          },
        },
      ],
    },
    tooltips: {
      intersect: true,
      mode: 'x',
      callbacks: {
        title(tooltipItem, data) {
          const titleName = getScaleName(widget, options);
          return `${firstCapital(titleName)}: ${data.labels[tooltipItem[0].index]}`;
        },
        afterTitle(tooltipItem, data) {
          const dataset = data.datasets[tooltipItem[0].index];
          if (!dataset) {
            return '';
          }
          return tooltipContents[tooltipItem[0].index];
        },
        label(tooltipItem, data) {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const totalDataset = data.datasets[0];
          const label = messages[dataset.label]
            ? formatMessage(messages[dataset.label])
            : dataset.label;
          const value = dataset.data[tooltipItem.index];
          if (!value) {
            return '';
          }
          const totalValue = totalDataset.data[tooltipItem.index];
          const percentageValue = -(-value / totalValue * 100).toFixed(2);
          if (percentage) {
            return ` ${label}: ${percentageValue}%`;
          }
          return ` ${label}: ${value}  (${percentageValue}%)`;
        },
      },
      backgroundColor: '#FFF',
      titleFontSize: 14,
      titleFontColor: '#464547',
      bodyFontColor: '#464547',
      bodyFontSize: 13,
      displayColors: true,
      borderColor: '#d4d4d4',
      borderWidth: 1,
      bodySpacing: 5,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    plugins: {
      datalabels: {
        formatter: (value, context) =>
          showTotal && percentage ? context.dataset.absData[context.dataIndex] : value,
      },
    },
  };
};

export const getChartData = (widget, options) => {
  const { percentage, defectTypes } = options;
  const labels = widget.content.result
    ? widget.content.result.map((item) => item.attributeValue)
    : [];
  const contentFields = widget.contentParameters.contentFields;
  const executions = getExecutions(contentFields);
  const defects = getDefects(contentFields);
  const total = getTotal();
  const legendItems = defectTypes ? defects : executions;
  const filteredContentFields = Array.prototype.concat(
    total,
    defects,
    defectTypes ? [] : executions,
  );
  const tooltipContents = [];

  let datasets = Array.prototype.concat(
    total.map((field) => createDataSet(field, null, options)),
    executions.map((field) => createDataSet(field, EXECUTIONS, options)),
    defects.map((field) => createDataSet(field, DEFECTS, options)),
  );

  if (widget.content.result) {
    Object.keys(widget.content.result)
      .sort()
      .map((resultId) => {
        const items = widget.content.result[resultId];
        tooltipContents.push(items.content.tooltipContent);

        filteredContentFields.forEach((field) => {
          const totals = items.content.statistics[field] || 0;

          const column = datasets.find((entry) => entry.label === field);

          column.data.push(totals);
        });

        return resultId;
      });
  }

  if (percentage) {
    datasets = convertIntoPercents(datasets);
  }

  const chartOptions = getChartOptions(widget, { tooltipContents, ...options });

  return { labels, datasets, chartOptions, legendItems };
};
