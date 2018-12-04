const unique = (array, propName) =>
  array.filter((e, i) => array.findIndex((a) => a[propName] === e[propName]) === i);

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
