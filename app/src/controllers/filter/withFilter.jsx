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
import { PAGE_KEY } from 'controllers/pagination';
import { connectRouter, debounce } from 'common/utils';

const FILTER_KEY = 'filter.cnt.name';

export const withFilter = ({ filterKey = FILTER_KEY, namespace } = {}) => (WrappedComponent) =>
  connectRouter(
    (query) => ({
      filter: query[filterKey],
    }),
    {
      updateFilter: (filter) => ({ [filterKey]: filter, [PAGE_KEY]: 1 }),
    },
    { namespace },
  )(
    class FilterWrapper extends Component {
      static displayName = `withFilter(${WrappedComponent.displayName || WrappedComponent.name})`;

      static propTypes = {
        filter: PropTypes.string,
        updateFilter: PropTypes.func,
      };

      static defaultProps = {
        filter: null,
        updateFilter: () => {},
      };

      handleFilterChange = debounce((value) => {
        this.props.updateFilter(value || undefined);
      }, 300);

      render() {
        const { filter, updateFilter, ...rest } = this.props;
        return (
          <WrappedComponent filter={filter} onFilterChange={this.handleFilterChange} {...rest} />
        );
      }
    },
  );
