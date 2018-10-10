import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter } from 'common/utils';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import {
  activeLogSelector,
  refreshLogPageData,
  logItemsSelector,
  logPaginationSelector,
  loadingSelector,
  NAMESPACE,
} from 'controllers/log';
import { withFilter } from 'controllers/filter';
import { withPagination } from 'controllers/pagination';
import { withSorting, SORTING_ASC } from 'controllers/sorting';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';
import { LogItemInfo } from './logItemInfo';
import { LogsGrid } from './logsGrid/logsGrid';
import { LogsGridToolbar } from './logsGridToolbar';

@connect(
  (state) => ({
    activeLogItem: activeLogSelector(state),
    logItems: logItemsSelector(state),
    loading: loadingSelector(state),
  }),
  {
    refresh: refreshLogPageData,
  },
)
@withSorting({
  defaultSortingColumn: 'time',
  defaultSortingDirection: SORTING_ASC,
})
@withFilter({
  filterKey: 'filter.cnt.message',
  namespace: NAMESPACE,
})
@withPagination({
  paginationSelector: logPaginationSelector,
  namespace: NAMESPACE,
})
@connectRouter(
  (query) => ({
    queryLogLevel: query['filter.gte.level'],
  }),
  {
    onChangeLogLevel: (logLevel) => ({ 'filter.gte.level': logLevel.id }),
    onChangeWithAttachments: (withAttachments) => ({ 'filter.ex.binary_content': withAttachments }),
  },
  { namespace: NAMESPACE },
)
export class LogsPage extends Component {
  static propTypes = {
    refresh: PropTypes.func.isRequired,
    activeLogItem: PropTypes.object,
    logItems: PropTypes.array,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    filter: PropTypes.string,
    queryLogLevel: PropTypes.string,
    onFilterChange: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    onChangeLogLevel: PropTypes.func,
    onChangeWithAttachments: PropTypes.func,
  };

  static defaultProps = {
    activeLogItem: null,
    logItems: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    filter: '',
    queryLogLevel: null,
    onFilterChange: () => {},
    sortingColumn: '',
    sortingDirection: '',
    onChangeSorting: () => {},
    onChangeLogLevel: () => {},
    onChangeWithAttachments: () => {},
  };

  render() {
    const {
      refresh,
      activeLogItem,
      logItems,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      filter,
      queryLogLevel,
      onFilterChange,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      onChangeLogLevel,
      onChangeWithAttachments,
    } = this.props;

    return (
      <PageLayout>
        <PageSection>
          <LogToolbar onRefresh={refresh} />
          <HistoryLine />
          {activeLogItem && <LogItemInfo logItem={activeLogItem} fetchFunc={refresh} />}
          <LogsGridToolbar
            activePage={activePage}
            pageCount={pageCount}
            onChangePage={onChangePage}
            initialLogLevel={queryLogLevel}
            onChangeLogLevel={onChangeLogLevel}
            onChangeWithAttachments={onChangeWithAttachments}
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
              />
            )}
          </LogsGridToolbar>
          {logItems &&
            !!logItems.length && (
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
