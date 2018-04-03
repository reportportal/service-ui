import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { withSorting, SORTING_DESC } from 'controllers/sorting';
import { LaunchSuiteGrid } from './launchSuiteGrid';
import { ActionPanel } from './actionPanel';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'LaunchesPage.title',
    defaultMessage: 'Launches',
  },
});

@connect(state => ({
  userId: userIdSelector(state),
  url: `/api/v1/${activeProjectSelector(state)}/launch`,
}))
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_DESC,
})
@withPagination()
@injectIntl
export class LaunchesPage extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: null,
    sortingColumn: null,
    sortingDirection: null,
    onChangePage: () => {
    },
    onChangePageSize: () => {
    },
    onChangeSorting: () => {
    },
  };

  render() {
    const {
      intl,
      data,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
        <ActionPanel />
        <LaunchSuiteGrid
          data={data}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
        />
        <PaginationToolbar
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      </PageLayout>
    );
  }
}
