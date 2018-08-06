import { SORTING_ASC, SORTING_DESC } from './constants';

export const parseSortingString = (sortingString) => {
  const fields = sortingString.split(',');
  const lastItem = fields.pop();
  if (lastItem === SORTING_DESC || lastItem === SORTING_ASC) {
    return {
      fields,
      direction: lastItem,
    };
  }
  return {
    fields: [...fields, lastItem],
  };
};

export const createSortingString = (fields, direction) => {
  if (!fields) {
    return null;
  }
  const fieldsString = fields.join(',');
  if (direction) {
    return [fieldsString, direction].join(',');
  }
  return fieldsString;
};
