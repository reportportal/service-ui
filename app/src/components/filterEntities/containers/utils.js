const FILTER_PREFIX = 'filter.';
const PREDEFINED_FILTER_PREFIX = 'predefinedFilter.';

const isEmptyValue = (value) => value === '' || value === null || value === undefined;

const getFilterKey = (entity, key) =>
  entity.condition
    ? `${FILTER_PREFIX}${entity.condition}.${key}`
    : `${PREDEFINED_FILTER_PREFIX}${key}`;

export const collectFilterEntities = (query = {}) =>
  Object.keys(query).reduce((result, key) => {
    if (key.indexOf(PREDEFINED_FILTER_PREFIX) === 0) {
      const [, filterName] = key.split('.');
      return {
        ...result,
        [filterName]: { value: query[key] || null },
      };
    }
    if (key.indexOf(FILTER_PREFIX) !== 0) {
      return result;
    }
    const [, condition, filterName] = key.split('.');
    return {
      ...result,
      [filterName]: {
        condition,
        value: query[key] || null,
      },
    };
  }, {});

export const createFilterQuery = (entities = {}, oldEntities = {}) => {
  const mergedEntities = { ...oldEntities, ...entities };
  return Object.keys(mergedEntities).reduce((res, key) => {
    const entity = entities[key];
    const oldEntity = oldEntities[key];
    if (!entity && oldEntity) {
      return { ...res, [getFilterKey(oldEntity, key)]: null };
    }
    const filterValue = !isEmptyValue(entity.value) ? entity.value : null;
    return {
      ...res,
      [getFilterKey(entity, key)]: filterValue,
    };
  }, {});
};
