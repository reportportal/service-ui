import { isEmptyValue } from 'common/utils/isEmptyValue';
import { ENTITY_ATTRIBUTE_KEYS, ENTITY_ATTRIBUTE_VALUES, CONDITION_EQ } from '../constants';

const FILTER_PREFIX = 'filter.';
const PREDEFINED_FILTER_PREFIX = 'predefinedFilter.';
const SYSTEM_ATTRIBUTE = 'attributeSystem';
const SYSTEM_ATTRIBUTE_FILTER_KEY = `${FILTER_PREFIX}${CONDITION_EQ}.${SYSTEM_ATTRIBUTE}`;

const getFilterKey = (entity, key) =>
  entity.condition
    ? `${FILTER_PREFIX}${entity.condition}.${key}`
    : `${PREDEFINED_FILTER_PREFIX}${key}`;

export const resetOldCondition = (entity, oldEntity, key) => {
  if (entity && oldEntity) {
    if (entity.condition !== oldEntity.condition) {
      return { [getFilterKey(oldEntity, key)]: null };
    }
  }
  return {};
};

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

const isAttributeFilterApplied = (entities) =>
  ENTITY_ATTRIBUTE_KEYS in entities || ENTITY_ATTRIBUTE_VALUES in entities;

const createEmptyAttributesQuery = (newEntities, oldEntities) => {
  const result = {};
  const newKey = newEntities[ENTITY_ATTRIBUTE_KEYS];
  const oldKey = oldEntities[ENTITY_ATTRIBUTE_KEYS];
  const newValue = newEntities[ENTITY_ATTRIBUTE_VALUES];
  const oldValue = oldEntities[ENTITY_ATTRIBUTE_VALUES];

  const attributeKey = !newKey && oldKey ? null : (newKey || {}).value;
  const attributeValue = !newValue && oldValue ? null : (newValue || {}).value;

  if (isEmptyValue(attributeKey) && isEmptyValue(attributeValue)) {
    result[SYSTEM_ATTRIBUTE_FILTER_KEY] = null;
  } else {
    result[SYSTEM_ATTRIBUTE_FILTER_KEY] = false;
  }
  return result;
};

const isConditionChangeWithEmptyValue = (entity = {}, oldEntity = {}) => {
  const entityValue = entity.value || null;
  const oldEntityValue = oldEntity.value || null;
  return isEmptyValue(entityValue) && isEmptyValue(oldEntityValue);
};

export const createFilterQuery = (entities = {}, oldEntities = {}) => {
  const mergedEntities = { ...oldEntities, ...entities };
  const keys = Object.keys(mergedEntities);
  const initialQuery = isAttributeFilterApplied(mergedEntities)
    ? createEmptyAttributesQuery(entities, oldEntities)
    : {};
  return keys.reduce((res, key) => {
    if (key === SYSTEM_ATTRIBUTE) {
      return res;
    }
    const entity = entities[key];
    const oldEntity = oldEntities[key];
    if (isConditionChangeWithEmptyValue(entity, oldEntity)) {
      return res;
    }
    if (!entity && oldEntity) {
      return { ...res, [getFilterKey(oldEntity, key)]: null };
    }

    const resetOldConditions = resetOldCondition(entity, oldEntity, key);
    const filterValue = !isEmptyValue(entity.value) ? entity.value : null;
    return {
      ...res,
      [getFilterKey(entity, key)]: filterValue,
      ...resetOldConditions,
    };
  }, initialQuery);
};
