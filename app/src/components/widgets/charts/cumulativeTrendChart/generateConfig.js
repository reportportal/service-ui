import * as COLORS from 'common/constants/colors';

const getTypeSum = (items, type) =>
  items.map((item) => Number(item.values[type] || 0)).reduce((acc, item) => acc + item);

const getDefects = (fields) => fields.filter((item) => /defects/.test(item));

const getExecutions = (fields) => fields.filter((item) => /executions/.test(item));

const getColumnGroups = (fields, defectTypes) => [
  defectTypes ? getDefects(fields) : getExecutions(fields),
];

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

export const generateChartDataParams = (widget, options) => {
  const { defectTypes, separate, percentage } = options;
  const contentFields = widget.contentParameters.contentFields;
  const columnGroups = separate ? [] : getColumnGroups(contentFields, defectTypes);
  const filteredContentFields = defectTypes
    ? getDefects(contentFields)
    : getExecutions(contentFields);
  let chartDataColumns = filteredContentFields.map((field) => [field]);
  const categoryNames = Object.keys(widget.content.result)
    .sort()
    .map((resultId) => {
      const items = widget.content.result[resultId];

      filteredContentFields.forEach((field) => {
        const totals = getTypeSum(items, field);
        const column = chartDataColumns.find((entry) => entry[0] === field);

        column.push(totals);
      });

      return resultId;
    });

  if (percentage) {
    chartDataColumns = convertIntoPercents(chartDataColumns);
  }

  return {
    chartDataColumns,
    categoryNames,
    columnGroups,
  };
};

export const getColorForKey = (key) => COLORS[`COLOR_${key.split('$')[2].toUpperCase()}`];

export const generateChartColors = (widget) => {
  const colors = {};
  widget.contentParameters.contentFields.forEach((key) => {
    // gets colors for items
    colors[key] = getColorForKey(key);
  });
  return colors;
};
