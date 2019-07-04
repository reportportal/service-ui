import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter } from 'common/utils';
import { withFilter } from 'controllers/filter';
import { withPagination, PAGE_KEY } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import { LogsGrid } from 'pages/inside/logsPage/logsGrid/logsGrid';
import { LogsGridToolbar } from 'pages/inside/logsPage/logsGridToolbar';
import { PaginationToolbar } from 'components/main/paginationToolbar';

import {
  testItemLogItemsSelector,
  testItemLogPaginationSelector,
  testItemLogLoadingSelector,
  NAMESPACE,
  LOG_LEVEL_FILTER_KEY,
  getLogLevel,
} from 'controllers/testItem/log';

@connect((state) => ({
  logItems: testItemLogItemsSelector(state),
  loading: testItemLogLoadingSelector(state),
}))
@withSortingURL({
  defaultFields: ['logTime'],
  defaultDirection: SORTING_ASC,
  namespace: NAMESPACE,
})
@withFilter({
  filterKey: 'filter.cnt.message',
  namespace: NAMESPACE,
})
@withPagination({
  paginationSelector: testItemLogPaginationSelector,
  namespace: NAMESPACE,
})
@connectRouter(
  (query) => ({
    logLevelId: query[LOG_LEVEL_FILTER_KEY],
  }),
  {
    onChangeLogLevel: (userId, logLevel) => ({
      [LOG_LEVEL_FILTER_KEY]: logLevel.id,
      [PAGE_KEY]: 1,
    }),
  },
  { namespace: NAMESPACE },
)
export class TestItemLogsGrid extends Component {
  static propTypes = {
    logItems: PropTypes.array,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    filter: PropTypes.string,
    logLevelId: PropTypes.string,
    onFilterChange: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    onChangeLogLevel: PropTypes.func,
  };

  static defaultProps = {
    logItems: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    filter: '',
    logLevelId: null,
    onFilterChange: () => {},
    sortingColumn: '',
    sortingDirection: '',
    onChangeSorting: () => {},
    onChangeLogLevel: () => {},
  };

  render() {
    const {
      logItems,
      logLevelId,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      filter,
      onFilterChange,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      onChangeLogLevel,
    } = this.props;

    return (
      <Fragment>
        <LogsGridToolbar
          activePage={activePage}
          pageCount={pageCount}
          onChangePage={onChangePage}
          logLevel={getLogLevel(logLevelId)}
          onChangeLogLevel={onChangeLogLevel}
        >
          {({ markdownMode, consoleView }) => (
            <LogsGrid
              logItems={logItems}
              loading={loading}
              filter={filter}
              onFilterChange={onFilterChange}
              sortingColumn={sortingColumn}
              sortingDirection={sortingDirection}
              onChangeSorting={onChangeSorting}
              markdownMode={markdownMode}
              consoleView={consoleView}
              rowHighlightingConfig={{}}
            />
          )}
        </LogsGridToolbar>
        {!!pageCount &&
          logItems &&
          !!logItems.length &&
          !loading && (
            <PaginationToolbar
              activePage={activePage}
              itemCount={itemCount}
              pageCount={pageCount}
              pageSize={pageSize}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          )}
      </Fragment>
    );
  }
}
