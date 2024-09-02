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
  render,
  debounceTime = 1000,
  defaultPagination,
  prefixQueryKey,
}) => {
  const handleChange = useCallback(
    (newEntities) => {
      if (isEqual(newEntities, entities)) {
        return;
      }
      const filterQuery = createFilterQuery(newEntities, entities, prefixQueryKey);
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

  return render({
    entities,
    onChange: debounceTime ? debouncedHandleChange : handleChange,
  });
};

FilterEntitiesURL.propTypes = {
  entities: PropTypes.object,
  updateFilters: PropTypes.func,
  render: PropTypes.func.isRequired,
  debounceTime: PropTypes.number,
  defaultPagination: PropTypes.any.isRequired,
  prefixQueryKey: PropTypes.string,
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
  )(FilterEntitiesURL);

export const FilterEntitiesURLContainer = createFilterEntitiesURLContainer();
