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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  eventsSelector,
  eventsPaginationSelector,
  loadingSelector,
} from 'controllers/administrate/events';
import { ENTITY_CREATION_DATE } from 'components/filterEntities/constants';
import { SORTING_DESC, withSortingURL } from 'controllers/sorting';
import { EventsGrid } from './eventsGrid';
import { EventsToolbar } from './eventsToolbar';

@connect((state) => ({
  url: URLS.events(activeProjectSelector(state)),
  events: eventsSelector(state),
  loading: loadingSelector(state),
}))
@withSortingURL({
  defaultFields: [ENTITY_CREATION_DATE],
  defaultDirection: SORTING_DESC,
})
@withPagination({
  paginationSelector: eventsPaginationSelector,
})
export class ProjectEventsPage extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    events: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    events: [],
  };
  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      events,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;

    return (
      <React.Fragment>
        <EventsToolbar />
        <EventsGrid
          data={events}
          loading={loading}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
        />
        {!!pageCount && !loading && (
          <PaginationToolbar
            activePage={activePage}
            itemCount={itemCount}
            pageCount={pageCount}
            pageSize={pageSize}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        )}
      </React.Fragment>
    );
  }
}
