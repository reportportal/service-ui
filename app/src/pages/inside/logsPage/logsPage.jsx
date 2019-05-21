import { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter } from 'common/utils';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import {
  refreshLogPageData,
  logItemsSelector,
  logPaginationSelector,
  loadingSelector,
  NAMESPACE,
  LOG_LEVEL_FILTER_KEY,
  WITH_ATTACHMENTS_FILTER_KEY,
  getLogLevel,
  setLogLevel,
  setWithAttachments,
  fetchNextErrorAction,
  nextErrorLogItemIdSelector,
} from 'controllers/log';
import { withFilter } from 'controllers/filter';
import { withPagination, PAGE_KEY } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import { userIdSelector } from 'controllers/user';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { LOG_PAGE, LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';
import { LogItemInfo } from './logItemInfo';
import { LogsGrid } from './logsGrid/logsGrid';
import { LogsGridToolbar } from './logsGridToolbar';
import { SauceLabsSection } from './sauceLabsSection';

@connect(
  (state) => ({
    logItems: logItemsSelector(state),
    loading: loadingSelector(state),
    userId: userIdSelector(state),
    nextErrorId: nextErrorLogItemIdSelector(state),
  }),
  {
    refresh: refreshLogPageData,
    fetchNextError: fetchNextErrorAction,
  },
)
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
  paginationSelector: logPaginationSelector,
  namespace: NAMESPACE,
})
@connectRouter(
  (query) => ({
    logLevelId: query[LOG_LEVEL_FILTER_KEY],
  }),
  {
    onChangeLogLevel: (userId, logLevel) => {
      setLogLevel(userId, logLevel);
      return { [LOG_LEVEL_FILTER_KEY]: logLevel.id, [PAGE_KEY]: 1 };
    },
    onChangeWithAttachments: (userId, withAttachments) => {
      setWithAttachments(userId, withAttachments);
      return { [WITH_ATTACHMENTS_FILTER_KEY]: withAttachments || undefined };
    },
  },
  { namespace: NAMESPACE },
)
@track({ page: LOG_PAGE })
export class LogsPage extends Component {
  static propTypes = {
    refresh: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    logItems: PropTypes.array,
    userId: PropTypes.string.isRequired,
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
    onChangeWithAttachments: PropTypes.func,
    fetchNextError: PropTypes.func,
    nextErrorId: PropTypes.number,
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
    onChangeWithAttachments: () => {},
    fetchNextError: () => {},
    nextErrorId: null,
  };

  state = {
    highlightedRowId: null,
    isGridRowHighlighted: false,
    isSauceLabsIntegrationView: false,
  };

  onHighlightRow = (highlightedRowId) => {
    this.setState({
      highlightedRowId,
      isGridRowHighlighted: false,
    });
  };

  onGridRowHighlighted = () => {
    this.setState({
      isGridRowHighlighted: true,
    });
  };

  toggleSauceLabsIntegrationView = () =>
    this.setState({
      isSauceLabsIntegrationView: !this.state.isSauceLabsIntegrationView,
    });

  handleRefresh = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.REFRESH_BTN);
    if (this.state.isSauceLabsIntegrationView) {
      this.toggleSauceLabsIntegrationView();
    }
    this.props.refresh();
  };

  handleNextError = () => {
    const { fetchNextError, nextErrorId } = this.props;
    fetchNextError();
    this.onHighlightRow(nextErrorId);
  };
  render() {
    const {
      refresh,
      logItems,
      userId,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      filter,
      logLevelId,
      onFilterChange,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      onChangeLogLevel,
      onChangeWithAttachments,
    } = this.props;

    const rowHighlightingConfig = {
      onGridRowHighlighted: this.onGridRowHighlighted,
      isGridRowHighlighted: this.state.isGridRowHighlighted,
      highlightedRowId: this.state.highlightedRowId,
    };

    return (
      <PageLayout>
        <PageSection>
          <LogToolbar onRefresh={this.handleRefresh} />
          <HistoryLine />
          <LogItemInfo
            onChangeLogLevel={onChangeLogLevel}
            onChangePage={onChangePage}
            onHighlightRow={this.onHighlightRow}
            onToggleSauceLabsIntegrationView={this.toggleSauceLabsIntegrationView}
            isSauceLabsIntegrationView={this.state.isSauceLabsIntegrationView}
            fetchFunc={refresh}
            loading={loading}
          />
          {this.state.isSauceLabsIntegrationView ? (
            <SauceLabsSection />
          ) : (
            <Fragment>
              <LogsGridToolbar
                activePage={activePage}
                pageCount={pageCount}
                onChangePage={onChangePage}
                logLevel={getLogLevel(userId, logLevelId)}
                onChangeLogLevel={onChangeLogLevel}
                onChangeWithAttachments={onChangeWithAttachments}
                onNextError={this.handleNextError}
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
                    rowHighlightingConfig={rowHighlightingConfig}
                    markdownMode={markdownMode}
                    consoleView={consoleView}
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
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
