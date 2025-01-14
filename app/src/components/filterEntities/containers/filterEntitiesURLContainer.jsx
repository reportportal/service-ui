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

import { useCallback } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connectRouter, debounce, isEmptyObject } from 'common/utils';
import { defaultPaginationSelector, PAGE_KEY } from 'controllers/pagination';
import { collectFilterEntities, createFilterQuery } from './utils';

const FilterEntitiesURL = ({
  entities = {},
  updateFilters = () => {},
  debounced = true,
  debounceTime = 1000,
  defaultPagination,
  prefixQueryKey,
  additionalFilter,
}) => {
  const handleChange = useCallback(
    (newEntities) => {
      if (isEqual(newEntities, entities)) {
        return;
      }
      const { [additionalFilter]: value } = entities;
      const filterQuery = createFilterQuery(
        additionalFilter && value ? { [additionalFilter]: value, ...newEntities } : newEntities,
        entities,
        prefixQueryKey,
      );
      if (!isEmptyObject(filterQuery)) {
        updateFilters(filterQuery, defaultPagination[PAGE_KEY]);
      }
    },
    [entities, defaultPagination, prefixQueryKey, updateFilters],
  );

  const debouncedHandleChange = useCallback(debounce(handleChange, debounceTime), [
    handleChange,
    debounceTime,
  ]);

  return {
    entities,
    onChange: debounced ? debouncedHandleChange : handleChange,
  };
};

FilterEntitiesURL.propTypes = {
  entities: PropTypes.object,
  updateFilters: PropTypes.func,
  debounced: PropTypes.bool,
  debounceTime: PropTypes.number,
  defaultPagination: PropTypes.any.isRequired,
  prefixQueryKey: PropTypes.string,
};

const filterEntitiesURLForContainer = ({
  entities = {},
  updateFilters = () => {},
  debounced = true,
  debounceTime = 1000,
  defaultPagination,
  prefixQueryKey,
  render,
}) => {
  const filterEntitiesURLParams = FilterEntitiesURL({
    entities,
    updateFilters,
    debounced,
    debounceTime,
    defaultPagination,
    prefixQueryKey,
  });
  return render(filterEntitiesURLParams);
};

export const withFilterEntitiesURL = (namespace, prefixQueryKey) => (WrappedComponent) => {
  const filterEntitiesURL = (props) => {
    const {
      entities,
      defaultPagination,
      updateFilters,
      debounced,
      debounceTime,
      ...restProps
    } = props;

    const { entities: filteredEntities, onChange } = FilterEntitiesURL({
      entities,
      updateFilters,
      debounced,
      debounceTime,
      defaultPagination,
      prefixQueryKey,
      additionalFilter: 'name',
    });

    const { name, ...entriesWithoutName } = filteredEntities;

    return (
      <WrappedComponent {...restProps} entities={entriesWithoutName} onFilterChange={onChange} />
    );
  };

  return connectRouter(
    (query) => ({
      entities: collectFilterEntities(query, prefixQueryKey),
      defaultPagination: defaultPaginationSelector(),
    }),
    {
      updateFilters: (query, page) => ({ ...query, [PAGE_KEY]: page }),
    },
    { namespace },
  )(filterEntitiesURL);
};

const createFilterEntitiesURLContainer = (prefixQueryKey) =>
  connectRouter(
    (query) => ({
      entities: collectFilterEntities(query, prefixQueryKey),
      defaultPagination: defaultPaginationSelector(),
    }),
    {
      updateFilters: (query, page) => ({ ...query, [PAGE_KEY]: page }),
    },
  )(filterEntitiesURLForContainer);

export const FilterEntitiesURLContainer = createFilterEntitiesURLContainer();
