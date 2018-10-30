import * as COLORS from 'common/constants/colors';

// demo sample
// var chart = c3.generate({
//   data: {
//       columns: [
//           ['data1', 30, 200, 200, 400, 150, 250],
//           ['data2', 130, 100, 180, 200, 130, 50],
//           ['data3', 230, 200, 200, 300, 250, 450]
//       ],
//       type: 'bar',
//   },
//   axis: {
//       x: {
//           type: 'category',
//           categories: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'],
//       },
//   },
// });

const getTypeSum = (items, type) =>
  items.map((item) => Number(item.values[type])).reduce((acc, item) => acc + item);

export const generateChartDataParams = (widget) => {
  const chartDataColumns = [];
  const dataGroupNames = [];
  const contentFields = widget.contentParameters.contentFields;

  contentFields.forEach((field) => {
    chartDataColumns.push([field]);
  });

  Object.keys(widget.content.result).forEach((resultId) => {
    dataGroupNames.push(resultId);
    const items = widget.content.result[resultId];
    contentFields.forEach((field) => {
      const totals = getTypeSum(items, field);
      const column = chartDataColumns.find((entry) => entry[0] === field);
      column.push(totals);
    });
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
