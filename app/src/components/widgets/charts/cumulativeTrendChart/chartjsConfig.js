import * as COLORS from 'common/constants/colors';
// import { injectIntl } from 'react-intl';
// import { messages as commonMessages } from '../common/messages';

const Color = require('color');

const EXECUTIONS = 'executions';
const DEFECTS = 'defects';

const getDefects = (fields) => fields.filter((item) => /defects/.test(item));

const getExecutions = () => [
  'statistics$executions$failed',
  'statistics$executions$skipped',
  'statistics$executions$passed',
];

// const messages = {
//   statistics$executions$failed: commonMessages.failed,
//   statistics$executions$skipped: commonMessages.skipped,
//   statistics$executions$passed: commonMessages.passed,
//   statistics$defects$product_bug$total: commonMessages.pb,
//   statistics$defects$automation_bug$total: commonMessages.ab,
//   statistics$defects$system_issue$total: commonMessages.si,
//   statistics$defects$no_defect$total: commonMessages.nd,
//   statistics$defects$to_investigate$total: commonMessages.ti,
// };

const convertIntoPercents = (columns) => {
  const percentageColumns = [];

  columns.forEach((column) => {
    const newColumn = [];

    newColumn.push(column[0]);

    for (let i = 1; i < column.length; i += 1) {
      const total = columns.reduce((acc, item) => acc + item[i], 0);

      newColumn[i] = -(-column[i] / total * 100).toFixed(2);
    }

    percentageColumns.push(newColumn);
  });

  return percentageColumns;
};

// const getColumnGroups = (fields, defectTypes) => [
//   defectTypes ? getDefects(fields) : getExecutions(fields),
// ];

// const getTypeSum = (items) =>
//   Object.values(items.content.statistics).reduce((acc, item) => acc + item);

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
const DataSet = function(label, group) {
  this.label = label;
  this.data = [];
  const color = getColorForKey(label);
  this.borderColor = color;
  this.backgroundColor =
    group === DEFECTS
      ? Color(color)
          .alpha(0.3)
          .string()
      : color;
  this.stack = group;
  this.datalabels = {
    display: /passed/.test(label),
    // align: 90,
    align: 'end',
    anchor: 'end',
    offset: -5,
  };
  // this.xAxisID = group;
  // this.type = 'bar';
};

const getChartOptions = () => ({
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
          // max: 160,
        },
      },
    ],
    xAxes: [
      {
        // display: false,
        id: DEFECTS,
        // type: 'category',
        categoryPercentage: 0.4,
        // barPercentage: 1,
        // barThickness: 6,
        gridLines: {
          display: false,
          offsetGridLines: true,
        },
        // stacked: true,
      },
      // {
      //   id: EXECUTIONS,
      //   // type: 'category',
      //   // stacked: true,
      //   // categoryPercentage: 0.4,
      //   // barPercentage: 1,
      //   // barThickness: 12,
      //   // gridLines: {
      //   //   display: true,
      //   //   offsetGridLines: true,
      //   // },
      // },
    ],
  },
  // tooltips: {
  //   callbacks: {
  //     label(tooltipItem, data) {
  //       console.log(tooltipItem);
  //       console.log(data);

  //       let label = data.datasets[tooltipItem.datasetIndex].label || '';

  //       if (label) {
  //         const message = messages[label];
  //         label = injectIntl(({ intl }) => intl.formatMessage(message));
  //         debugger;
  //         console.log(label);

  //         label = `${label} :  ${tooltipItem.value}`;
  //       }
  //       // label += Math.round(tooltipItem.yLabel * 100) / 100;
  //       return label;
  //     },
  //   },
  // },
});

const setTotalLabels = (result, executions, datasets) => {
  const targetDataset = datasets.find((entry) => /passed/.test(entry.label));

  targetDataset.datalabels.formatter = (value, context) =>
    executions.reduce((acc, field) => {
      const dataset = datasets.find((entry) => entry.label === field);
      return acc + dataset.data[context.dataIndex];
    }, 0);
};

export const getChartData = (widget, options) => {
  const { percentage } = options;
  const labels = widget.content.result.map((item) => item.attributeValue);

  const contentFields = widget.contentParameters.contentFields;
  // const columnGroups = separate ? [] : getColumnGroups(contentFields, defectTypes);
  const executions = getExecutions(contentFields);

  const defects = getDefects(contentFields);
  const filteredContentFields = Array.prototype.concat(defects, executions);

  let datasets = Array.prototype.concat(
    executions.map((field) => new DataSet(field, EXECUTIONS)),
    defects.map((field) => new DataSet(field, DEFECTS)),
  );

  Object.keys(widget.content.result)
    .sort()
    .map((resultId) => {
      const items = widget.content.result[resultId];

      filteredContentFields.forEach((field) => {
        const totals = items.content.statistics[field] || 0;

        const column = datasets.find((entry) => entry.label === field);

        column.data.push(totals);
      });

      setTotalLabels(widget.content.result, executions, datasets);

      return resultId;
    });

  if (percentage) {
    datasets = convertIntoPercents(datasets);
  }

  const chartOptions = getChartOptions();
  return { labels, datasets, chartOptions };
};
