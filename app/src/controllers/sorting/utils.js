import { SORTING_ASC, SORTING_DESC } from './constants';

const isDirection = (value) => value === SORTING_ASC || value === SORTING_DESC;

export const parseSortingString = (sortingString = '') => {
  const fields = sortingString.length > 0 ? sortingString.split(',') : [];
  const direction = isDirection(fields[fields.length - 1]) ? fields.pop() : null;
  return {
    fields,
    direction,
  };
};

export const formatSortingString = (fields = [], direction) => {
  const items = direction ? [...fields, direction] : fields;
  return items.join(',');
};
