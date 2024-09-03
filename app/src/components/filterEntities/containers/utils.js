/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isEmptyValue } from 'common/utils/isEmptyValue';

const FILTER_PREFIX = 'filter.';
const PREDEFINED_FILTER_PREFIX = 'predefinedFilter.';

const getFilterKey = (entity, key, predefinedPrefixKey = PREDEFINED_FILTER_PREFIX) =>
  entity.condition ? `${FILTER_PREFIX}${entity.condition}.${key}` : `${predefinedPrefixKey}${key}`;

export const resetOldCondition = (entity, oldEntity, key, predefinedPrefixKey) => {
  if (entity && oldEntity) {
    if (entity.condition !== oldEntity.condition) {
      return { [getFilterKey(oldEntity, key, predefinedPrefixKey)]: null };
    }
  }
  return {};
};

export const collectFilterEntities = (query = {}, predefinedPrefixKey = PREDEFINED_FILTER_PREFIX) =>
  Object.keys(query).reduce((result, key) => {
    if (key.startsWith(predefinedPrefixKey)) {
      const [, filterName] = key.split('.');
      return {
        ...result,
        [filterName]: { value: query[key] || null },
      };
    }
    if (!key.startsWith(FILTER_PREFIX)) {
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

const isConditionChangeWithEmptyValue = (entity = {}, oldEntity = {}) => {
  const entityValue = entity.value || null;
  const oldEntityValue = oldEntity.value || null;
  return isEmptyValue(entityValue) && isEmptyValue(oldEntityValue);
};

export const createFilterQuery = (
  entities = {},
  oldEntities = {},
  predefinedPrefixKey = PREDEFINED_FILTER_PREFIX,
) => {
  const mergedEntities = { ...oldEntities, ...entities };
  const keys = Object.keys(mergedEntities);
  const initialQuery = {};
  return keys.reduce((res, key) => {
    const entity = entities[key];
    const oldEntity = oldEntities[key];
    if (isConditionChangeWithEmptyValue(entity, oldEntity)) {
      return res;
    }
    if (!entity && oldEntity) {
      return { ...res, [getFilterKey(oldEntity, key, predefinedPrefixKey)]: null };
    }

    const resetOldConditions = resetOldCondition(entity, oldEntity, key);
    const filterValue = !isEmptyValue(entity.value) ? entity.value : null;
    return {
      ...res,
      [getFilterKey(entity, key, predefinedPrefixKey)]: filterValue,
      ...resetOldConditions,
    };
  }, initialQuery);
};
