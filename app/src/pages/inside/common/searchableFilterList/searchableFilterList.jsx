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

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { userIdSelector } from 'controllers/user/selectors';
import { FiltersActionPanel } from './filtersActionPanel';
import { ActiveFilter } from './activeFilter';
import { FiltersList } from './filtersList';

const messages = defineMessages({
  filtersNotFound: {
    id: 'FiltersControl.notFound',
    defaultMessage: `No filters found for "{filter}".`,
  },
  filtersNotFoundOnProject: {
    id: 'FiltersControl.notFoundOnProject',
    defaultMessage: `No filters on a project`,
  },
  filtersNotFoundAdditional: {
    id: 'FiltersControl.notFoundAdditionalInfo',
    defaultMessage: `Be the first to add a new filter`,
  },
});

@connect((state) => ({
  userId: userIdSelector(state),
}))
@injectIntl
export class SearchableFilterList extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    pagination: PropTypes.object.isRequired,
    searchValue: PropTypes.string,
    activeFilter: PropTypes.object,
    filters: PropTypes.array,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    touched: PropTypes.bool,
    editable: PropTypes.bool,
    filterListCustomClass: PropTypes.string,
    customActionBlock: PropTypes.node,
    onEditItem: PropTypes.func,
    onSearchChange: PropTypes.func,
    onChangeActiveFilter: PropTypes.func,
    onLazyLoad: PropTypes.func,
  };

  static defaultProps = {
    searchValue: '',
    activeFilter: null,
    filters: [],
    error: '',
    touched: false,
    editable: false,
    filterListCustomClass: '',
    customActionBlock: null,
    onChangeActiveFilter: () => {},
    onEditItem: () => {},
    onSearchChange: () => {},
    onLazyLoad: () => {},
  };

  render() {
    const {
      filters,
      loading,
      userId,
      touched,
      error,
      editable,
      customActionBlock,
      filterListCustomClass,
      onEditItem,
      searchValue,
      activeFilter,
      onSearchChange,
      onChangeActiveFilter,
      onLazyLoad,
    } = this.props;

    return (
      <Fragment>
        <FiltersActionPanel
          value={searchValue}
          onFilterChange={onSearchChange}
          customBlock={customActionBlock}
        />
        <ActiveFilter filter={activeFilter} touched={touched} error={error || null} />
        <FiltersList
          search={searchValue}
          userId={userId}
          filters={filters}
          loading={loading}
          activeId={activeFilter ? String(activeFilter.id) : ''}
          onChange={onChangeActiveFilter}
          editable={editable}
          onEdit={onEditItem}
          onLazyLoad={onLazyLoad}
          customClass={filterListCustomClass}
          noItemsMessage={
            searchValue ? messages.filtersNotFound : messages.filtersNotFoundOnProject
          }
          noItemsAdditionalMessage={searchValue ? null : messages.filtersNotFoundAdditional}
        />
      </Fragment>
    );
  }
}
