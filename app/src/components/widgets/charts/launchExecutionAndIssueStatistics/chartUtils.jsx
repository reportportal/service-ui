import * as COLORS from 'common/constants/colors';
import * as d3 from 'd3-selection';

const unique = (array, propName) =>
  array.filter((e, i) => array.findIndex((a) => a[propName] === e[propName]) === i);

const getItemName = (item) => item.split('$')[2].toUpperCase();

export const getPercentage = (value) => (value * 100).toFixed(2);
export const getDefectItems = (items) =>
  unique(
    items.map((item) => ({
      id: item[0],
      count: item[1],
      name: item[0]
        .split('$')
        .slice(0, 3)
        .join('$'),
    })),
    'name',
  );

export const toggleResponsiveClasses = (height, chart) => {
  if (height > 440) {
    chart.element.classList.remove('fs-medium', 'fs-small');
    chart.element.classList.add('fs-large');
  } else if (height <= 440 && height >= 295) {
    chart.element.classList.remove('fs-large', 'fs-small');
    chart.element.classList.add('fs-medium');
  } else {
    chart.element.classList.remove('fs-medium', 'fs-large');
    chart.element.classList.add('fs-small');
  }
};

export const getChartData = (data, filter) => {
  const itemTypes = [];
  const itemColors = [];
  Object.keys(data).forEach((key) => {
    if (key.includes(filter)) {
      const itemName = getItemName(key);
      itemTypes[key] = +data[key];
      itemColors[key] = COLORS[`COLOR_${itemName}`];
    }
  });
  return { itemTypes, itemColors };
};

export const resizeChart = (height, newHeight, width, newWidth, chart) => {
  if (height !== newHeight) {
    chart.resize({
      height: newHeight,
    });
    toggleResponsiveClasses(newHeight, chart);
  } else if (width !== newWidth) {
    chart.flush();
    toggleResponsiveClasses(newHeight, this.issuesChart);
  }
  return { newHeight, newWidth };
};

export const addChartTitle = (chart, title) => {
  const totalCount = chart.internal.data.targets.reduce(
    (acc, item) => acc + item.values[0].value,
    0,
  );
  d3
    .select(chart.element)
    .select('.c3-chart-arcs-title')
    .append('tspan')
    .attr('dy', '-0.5em')
    .attr('fill', '#000')
    .text(totalCount);
  d3
    .select(chart.element)
    .select('.c3-chart-arcs-title')
    .append('tspan')
    .attr('x', 0)
    .attr('dy', '1.2em')
    .attr('fill', '#666')
    .text(title);
};
