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

import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connectRouter, debounce, isEmptyObject } from 'common/utils';
import { defaultPaginationSelector, PAGE_KEY } from 'controllers/pagination';
import { collectFilterEntities, createFilterQuery } from './utils';

@connectRouter(
  (query) => ({
    entities: collectFilterEntities(query),
    defaultPagination: defaultPaginationSelector(),
  }),
  {
    updateFilters: (query, page) => ({ ...query, [PAGE_KEY]: page }),
  },
)
export class FilterEntitiesURLContainer extends Component {
  static propTypes = {
    entities: PropTypes.object,
    updateFilters: PropTypes.func,
    render: PropTypes.func.isRequired,
    debounced: PropTypes.bool,
    defaultPagination: PropTypes.any.isRequired,
  };

  static defaultProps = {
    entities: {},
    updateFilters: () => {},
    debounced: true,
  };
  handleChange = (entities) => {
    if (isEqual(entities, this.props.entities)) {
      return;
    }
    const { defaultPagination } = this.props;
    const filterQuery = createFilterQuery(entities, this.props.entities);
    if (!isEmptyObject(filterQuery)) {
      this.props.updateFilters(filterQuery, defaultPagination[PAGE_KEY]);
    }
  };

  debouncedHandleChange = debounce(this.handleChange, 1000);

  render() {
    const { render, entities, debounced } = this.props;
    return render({
      entities,
      onChange: debounced ? this.debouncedHandleChange : this.handleChange,
    });
  }
}
