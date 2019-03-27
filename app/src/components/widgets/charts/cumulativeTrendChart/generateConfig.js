import * as COLORS from 'common/constants/colors';

const getTypeSum = (items, type) =>
  items.map((item) => Number(item.values[type])).reduce((acc, item) => acc + item);

export const generateChartDataParams = (widget) => {
  const contentFields = widget.contentParameters.contentFields;
  const chartDataColumns = contentFields.map((field) => [field]);
  const dataGroupNames = Object.keys(widget.content.result)
    .sort()
    .map((resultId) => {
      const items = widget.content.result[resultId];
      contentFields.forEach((field) => {
        const totals = getTypeSum(items, field);
        const column = chartDataColumns.find((entry) => entry[0] === field);
        column.push(totals);
      });
      return resultId;
    });

  return {
    chartDataColumns,
    dataGroupNames,
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
