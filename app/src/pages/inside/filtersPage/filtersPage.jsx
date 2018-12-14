import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import {
  withFilter,
  filtersPaginationSelector,
  fetchFiltersAction,
  filtersSelector,
  loadingSelector,
  DEFAULT_PAGE_SIZE,
} from 'controllers/filter';
import {
  userIdSelector,
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import classNames from 'classnames/bind';
import ErrorIcon from 'common/img/error-inline.svg';
import Parser from 'html-react-parser';
import { showModalAction } from 'controllers/modal';
import { withSorting, SORTING_ASC } from 'controllers/sorting';
import { userFiltersSelector, toggleDisplayFilterOnLaunchesAction } from 'controllers/project';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { FILTERS_PAGE, FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { NoFiltersBlock } from './noFiltersBlock';
import { FilterPageToolbar } from './filterPageToolbar';
import { FilterGrid } from './filterGrid';
import styles from './filtersPage.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
  filtersNotFound: {
    id: 'FiltersPage.notFound',
    defaultMessage: "No filters found for '{filter}'",
  },
  checkQuery: {
    id: 'FiltersPage.checkQuery',
    defaultMessage: 'Check your query and try again',
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
    loading: loadingSelector(state),
  }),
  {
    showModalAction,
    toggleDisplayFilterOnLaunches: toggleDisplayFilterOnLaunchesAction,
    fetchFiltersAction,
  },
)
@withSorting({
  defaultSortingColumn: 'name',
  defaultSortingDirection: SORTING_ASC,
})
@withFilter()
@withPagination({
  paginationSelector: filtersPaginationSelector,
})
@injectIntl
@track({ page: FILTERS_PAGE })
export class FiltersPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    userFilters: PropTypes.arrayOf(PropTypes.number),
    accountRole: PropTypes.string,
    loading: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    toggleDisplayFilterOnLaunches: PropTypes.func,
  };

  static defaultProps = {
    filters: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: DEFAULT_PAGE_SIZE,
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
    toggleDisplayFilterOnLaunches: () => {},
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.filtersPageTitle) }];

  getNoItemMessage = () =>
    this.props.filter !== null && this.props.filter !== '' ? (
      <div className={cx('filter-not-found')}>
        <p className={cx('filter-not-found-text')}>
          <i className={cx('filter-not-found-icon')}>{Parser(ErrorIcon)}</i>
          {Parser(
            this.props.intl.formatMessage(messages.filtersNotFound, {
              filter: `<span>${this.props.filter}</span>`,
            }),
          )}
        </p>
        <p className={cx('filter-not-found-hint')}>
          {this.props.intl.formatMessage(messages.checkQuery)}
        </p>
      </div>
    ) : (
      ''
    );

  confirmDelete = (filter) =>
    this.props.showModalAction({
      id: 'filterDeleteModal',
      data: { filter, onConfirm: () => this.deleteFilter(filter.id) },
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
    }).then(this.props.fetchFiltersAction);

  deleteFilter = (id) => {
    fetch(URLS.filter(this.props.activeProject, id), {
      method: 'delete',
    })
      .then(() => {
        if (this.props.userFilters.indexOf(id) > -1) {
          this.props.toggleDisplayFilterOnLaunches(id);
        }
      })
      .then(this.props.fetchFiltersAction);
  };

  openAddModal = () => {
    this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_ADD_FILTER_BTN);
  };

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
      ...rest
    } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <FilterPageToolbar
            filter={filter}
            filters={filters}
            onFilterChange={onFilterChange}
            onAddFilter={this.openAddModal}
          />
          <FilterGrid
            onEdit={this.openEditModal}
            onDelete={this.confirmDelete}
            filters={filters}
            loading={loading}
            {...rest}
          />
          {!filters.length && !loading && this.props.filter === null && <NoFiltersBlock />}
          {!filters.length && !loading && this.props.filter !== null && this.getNoItemMessage()}
          {filters &&
            !!filters.length && (
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
