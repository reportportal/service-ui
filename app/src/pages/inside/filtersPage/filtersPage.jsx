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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import {
  withFilter,
  filtersPaginationSelector,
  fetchFiltersAction,
  filtersSelector,
  removeFilterAction,
  createFilterAction,
  updateFilterSuccessAction,
  pageLoadingSelector,
} from 'controllers/filter';
import {
  userIdSelector,
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { showModalAction } from 'controllers/modal';

import {
  userFiltersSelector,
  showFilterOnLaunchesAction,
  hideFilterOnLaunchesAction,
} from 'controllers/project';
import { FILTERS_PAGE, FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { NoResultsForFilter } from 'pages/inside/common/noResultsForFilter';
import { NoFiltersBlock } from './noFiltersBlock';
import { FilterPageToolbar } from './filterPageToolbar';
import { FilterGrid } from './filterGrid';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
  filtersNotFound: {
    id: 'FiltersPage.notFound',
    defaultMessage: 'No filters found for "{filter}"',
  },
  filterUpdated: {
    id: 'FiltersPage.filterUpdated',
    defaultMessage: 'Filter has been updated!',
  },
  filterDeleted: {
    id: 'FiltersPage.filterDeleted',
    defaultMessage: 'Filter has been deleted!',
  },
});

@connect(
  (state) => ({
    userId: userIdSelector(state),
    url: URLS.filters(activeProjectSelector(state)),
    activeProject: activeProjectSelector(state),
    userFilters: userFiltersSelector(state),
    projectRole: activeProjectRoleSelector(state),
    accountRole: userAccountRoleSelector(state),
    filters: filtersSelector(state),
    loading: pageLoadingSelector(state),
  }),
  {
    showModalAction,
    removeUserFilter: removeFilterAction,
    fetchFiltersAction,
    showFilterOnLaunchesAction,
    hideFilterOnLaunchesAction,
    createFilter: createFilterAction,
    showNotification,
    updateFilterSuccessAction,
  },
)
@withFilter()
@withPagination({
  paginationSelector: filtersPaginationSelector,
})
@injectIntl
@track({ page: FILTERS_PAGE })
export class FiltersPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    userId: PropTypes.string,
    filter: PropTypes.string,
    activeProject: PropTypes.string,
    onFilterChange: PropTypes.func,
    fetchFiltersAction: PropTypes.func,
    showModalAction: PropTypes.func,
    projectRole: PropTypes.string,
    userFilters: PropTypes.arrayOf(PropTypes.object),
    accountRole: PropTypes.string,
    loading: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    removeUserFilter: PropTypes.func,
    showFilterOnLaunchesAction: PropTypes.func,
    hideFilterOnLaunchesAction: PropTypes.func,
    createFilter: PropTypes.func,
    updateFilterSuccessAction: PropTypes.func,
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    filters: [],
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: 0,
    pageCount: 0,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    userId: '',
    filter: '',
    activeProject: '',
    onFilterChange: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    fetchFiltersAction: () => {},
    showModalAction: () => {},
    projectRole: '',
    userFilters: [],
    accountRole: '',
    loading: false,
    removeUserFilter: () => {},
    showFilterOnLaunchesAction: () => {},
    hideFilterOnLaunchesAction: () => {},
    createFilter: () => {},
    updateFilterSuccessAction: () => {},
    showNotification: () => {},
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.filtersPageTitle) }];

  confirmDelete = (filter) =>
    this.props.showModalAction({
      id: 'filterDeleteModal',
      data: {
        filter,
        onConfirm: () => this.deleteFilter(filter),
        userId: this.props.userId,
      },
    });

  openEditModal = (filter) =>
    this.props.showModalAction({
      id: 'filterEditModal',
      data: { filter, onEdit: this.updateFilter },
    });

  updateFilter = (filter) =>
    fetch(URLS.filter(this.props.activeProject, filter.id), {
      method: 'put',
      data: filter,
    })
      .then(() => {
        this.props.updateFilterSuccessAction(filter);
        this.props.fetchFiltersAction();
      })
      .then(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: this.props.intl.formatMessage(messages.filterUpdated),
        });
      });

  deleteFilter = (filter) => {
    fetch(URLS.filter(this.props.activeProject, filter.id), {
      method: 'delete',
    })
      .then(() => {
        if (this.props.userFilters.find((item) => item.id === filter.id)) {
          this.props.removeUserFilter(filter.id);
        }
      })
      .then(this.props.fetchFiltersAction)
      .then(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: this.props.intl.formatMessage(messages.filterDeleted),
        });
      });
  };

  addFilter = () => {
    this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_ADD_FILTER_BTN);
    this.props.createFilter();
  };

  renderNoFiltersBlock = () =>
    this.props.filter ? (
      <NoResultsForFilter filter={this.props.filter} notFoundMessage={messages.filtersNotFound} />
    ) : (
      <NoFiltersBlock onAddFilter={this.addFilter} />
    );

  render() {
    const {
      filter,
      intl,
      onFilterChange,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      filters,
      loading,
      activeProject,
      ...rest
    } = this.props;

    return (
      <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <FilterPageToolbar
            initialValues={{ filter }}
            onFilterChange={onFilterChange}
            onAddFilter={this.addFilter}
            isSearchDisabled={!filters.length && !filter && !loading}
          />
          <FilterGrid
            onEdit={this.openEditModal}
            onDelete={this.confirmDelete}
            filters={filters}
            loading={loading}
            activeProject={activeProject}
            {...rest}
          />
          {!filters.length && !loading && this.renderNoFiltersBlock()}
          {!!filters.length && !loading && (
            <PaginationToolbar
              activePage={activePage}
              itemCount={itemCount}
              pageCount={pageCount}
              pageSize={pageSize}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
