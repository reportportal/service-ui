import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { SORTING_ASC, withSorting } from 'controllers/sorting';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { Toolbar } from './toolbar/toolbar';

@connect((state) => ({
  userId: userIdSelector(state),
  url: `/api/v1/${activeProjectSelector(state)}/item?filter.eq.launch=5a65e6a997a1c00001aaee95`, // TODO remove stub data
}))
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_ASC,
})
@withPagination()
@injectIntl
export class SuitesPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    fetchData: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
    url: PropTypes.string.isRequired,
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: null,
    sortingColumn: null,
    sortingDirection: null,
    fetchData: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
  };

  render() {
    const {
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
      <PageLayout>
        <Toolbar />
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
