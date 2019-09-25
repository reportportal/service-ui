import * as COLORS from 'common/constants/colors';

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

/** *
 *
 * @param height - element height
 * @param width - current element width
 * @returns {boolean} - if Donut chart becomes so small that % and title start overlap chart - returns true, else returns false
 */
export const isSmallDonutChartView = (height, width) => height <= 326 || width <= 474;
