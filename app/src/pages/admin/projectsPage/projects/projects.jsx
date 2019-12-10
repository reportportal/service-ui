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
import { injectIntl } from 'react-intl';
import track from 'react-tracking';

import { SIZE_KEY, withPagination, PAGE_KEY } from 'controllers/pagination';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import {
  DEFAULT_PAGINATION,
  TABLE_VIEW,
  GRID_VIEW,
  projectsPaginationSelector,
  viewModeSelector,
  loadingSelector,
  projectsSelector,
  DEFAULT_SORT_COLUMN,
  unselectAllProjectsAction,
} from 'controllers/administrate/projects';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { NoItemMessage } from 'components/main/noItemMessage';
import { ADMIN_PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events';

import { ProjectsPanelView } from './../projectsPanelView';
import { ProjectsGrid } from './../projectsGrid';
import { ProjectsToolbar } from './../projectsToolbar';

@connect(
  (state) => ({
    viewMode: viewModeSelector(state),
    loading: loadingSelector(state),
    projects: projectsSelector(state),
  }),
  {
    unselectAllProjectsAction,
  },
)
@withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
})
@withPagination({
  paginationSelector: projectsPaginationSelector,
})
@injectIntl
@track()
export class Projects extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func.isRequired,
    onChangePageSize: PropTypes.func.isRequired,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    intl: PropTypes.object.isRequired,
    viewMode: PropTypes.string,
    loading: PropTypes.bool,
    projects: PropTypes.arrayOf(PropTypes.object),
    unselectAllProjectsAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    viewMode: GRID_VIEW,
    loading: false,
    projects: [],
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
  };

  componentWillUnmount() {
    this.props.unselectAllProjectsAction();
  }

  handleChangeSorting = (field) => {
    this.props.onChangeSorting(field);
    this.props.tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.CHANGE_SORTING);
  };

  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      viewMode,
      loading,
      intl,
      projects,
      sortingColumn,
      sortingDirection,
    } = this.props;

    return (
      <React.Fragment>
        <ProjectsToolbar
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={this.handleChangeSorting}
        />

        {viewMode === TABLE_VIEW ? (
          <ProjectsGrid
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            onChangeSorting={this.handleChangeSorting}
          />
        ) : (
          <ProjectsPanelView />
        )}

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
        {!projects.length && !loading && (
          <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
        )}
      </React.Fragment>
    );
  }
}
