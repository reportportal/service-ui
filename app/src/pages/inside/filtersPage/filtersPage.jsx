import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import {
  withFilter,
  filtersPaginationSelector,
  fetchFiltersAction,
  filtersSelector,
} from 'controllers/filter';
import { userIdSelector, activeProjectSelector, activeProjectRoleSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { PageLayout } from 'layouts/pageLayout';
import { showModalAction } from 'controllers/modal';
import { withSorting, SORTING_ASC } from 'controllers/sorting';
import { userFiltersSelector, toggleDisplayFilterOnLaunchesAction } from 'controllers/project';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { FilterTable } from './filterTable';
import { FilterPageToolbar } from './filterPageToolbar';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
});

@connect(
  (state) => ({
    userId: userIdSelector(state),
    url: URLS.filters(activeProjectSelector(state)),
    activeProject: activeProjectSelector(state),
    userFilters: userFiltersSelector(state),
    projectRole: activeProjectRoleSelector(state),
    filters: filtersSelector(state),
  }),
  {
    showModalAction,
    toggleDisplayFilterOnLaunches: toggleDisplayFilterOnLaunchesAction,
  },
)
@withSorting({
  defaultSortingColumn: 'name',
  defaultSortingDirection: SORTING_ASC,
})
@withFilter
@withPagination({
  paginationSelector: filtersPaginationSelector,
  fetchAction: fetchFiltersAction,
})
@injectIntl
export class FiltersPage extends PureComponent {
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
    fetchData: PropTypes.func,
    showModalAction: PropTypes.func,
    projectRole: PropTypes.string,
  };

  static defaultProps = {
    filters: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    userId: '',
    filter: '',
    activeProject: '',
    onFilterChange: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    fetchData: () => {},
    showModalAction: () => {},
    projectRole: '',
  };

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
    }).then(this.props.fetchData);

  deleteFilter = (id) => {
    fetch(URLS.filter(this.props.activeProject, id), {
      method: 'delete',
    }).then(this.props.fetchData);
  };

  render() {
    const { filter, intl, onFilterChange, ...rest } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
        <FilterPageToolbar filter={filter} filters={rest.filters} onFilterChange={onFilterChange} />
        <FilterTable onDelete={this.confirmDelete} onEdit={this.openEditModal} {...rest} />
      </PageLayout>
    );
  }
}
