import { pageNames, NO_PAGE } from './constants';

export const pageSelector = (state) => pageNames[state.location.type] || NO_PAGE;

export const pagePropertiesSelector = ({ location: { query } }, mapping = undefined) => {
  if (!query) {
    return {};
  }

  if (!mapping) {
    return query;
  }

  const result = {};
  Object.keys(mapping).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const propertyName = mapping[key];
      result[propertyName] = query[key];
    }
  });
  return result;
};
