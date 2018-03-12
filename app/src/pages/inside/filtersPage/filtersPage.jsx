import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withFilter } from 'controllers/filter';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import { withPagination } from 'components/containers/pagination';
import { PageLayout } from 'layouts/pageLayout';
import { showModalAction } from 'controllers/modal';
import { fetch } from 'common/utils';
import { FilterTable } from './filterTable';
import { FilterPageToolbar } from './filterPageToolbar';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
});

@connect(state => ({
  userId: userIdSelector(state),
  url: `/api/v1/${activeProjectSelector(state)}/filter`,
  activeProject: activeProjectSelector(state),
}), {
  showModalAction,
})
@withFilter
@withPagination()
@injectIntl
export class FiltersPage extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
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
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    userId: '',
    filter: '',
    activeProject: '',
    onFilterChange: () => {
    },
    onChangePage: () => {
    },
    onChangePageSize: () => {
    },
    fetchData: () => {
    },
    showModalAction: () => {
    },
  };

  confirmDelete = filter => this.props.showModalAction({
    id: 'filterDeleteModal',
    data: { filter, onConfirm: () => this.deleteFilter(filter.id) },
  });

  openEditModal = filter => this.props.showModalAction({
    id: 'filterEditModal',
    data: { filter, onEdit: this.updateFilter },
  });

  updateFilter = filter =>
    fetch(`/api/v1/${this.props.activeProject}/filter/${filter.id}`, {
      method: 'put',
      data: filter,
    }).then(this.props.fetchData);

  deleteFilter = (id) => {
    fetch(`/api/v1/${this.props.activeProject}/filter/${id}`, {
      method: 'delete',
    }).then(this.props.fetchData);
  };

  render() {
    const { filter, intl, onFilterChange, ...rest } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
        <FilterPageToolbar
          filter={filter}
          onFilterChange={onFilterChange}
        />
        <FilterTable
          onDelete={this.confirmDelete}
          onEdit={this.openEditModal}
          {...rest}
        />
      </PageLayout>
    );
  }
}
