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

import { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter, getStorageItem, removeStorageItem } from 'common/utils';
import {
  logItemsSelector,
  logPaginationSelector,
  loadingSelector,
  NAMESPACE,
  LOG_LEVEL_FILTER_KEY,
  WITH_ATTACHMENTS_FILTER_KEY,
  HIDE_PASSED_LOGS,
  HIDE_EMPTY_STEPS,
  getLogLevel,
  setLogLevel,
  DETAILED_LOG_VIEW,
  logViewModeSelector,
  LOG_STATUS_FILTER_KEY,
  isLogPageWithNestedSteps,
  errorLogsItemsSelector,
  fetchErrorLog,
  RETRY_ID,
  ERROR_LOG_INDEX_KEY,
} from 'controllers/log';
import { withFilter } from 'controllers/filter';
import { withPagination, PAGE_KEY, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import { logsPaginationSelector, userIdSelector } from 'controllers/user';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { LogsGrid } from '../logsGrid';
import { LogsGridToolbar } from '../logsGridToolbar';
import { SauceLabsSection } from '../sauceLabsSection';
import { calculateNextIndex } from './utils';

@connect(
  (state) => ({
    logItems: logItemsSelector(state),
    loading: loadingSelector(state),
    userId: userIdSelector(state),
    logViewMode: logViewModeSelector(state),
    isNestedStepView: isLogPageWithNestedSteps(state),
    errorLogs: errorLogsItemsSelector(state),
    logsPagination: logsPaginationSelector(state),
  }),
  { fetchErrorLog },
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
    logStatus: query[LOG_STATUS_FILTER_KEY],
    withAttachments: query[WITH_ATTACHMENTS_FILTER_KEY],
    hideEmptySteps: query[HIDE_EMPTY_STEPS],
    hidePassedLogs: query[HIDE_PASSED_LOGS],
    retryId: query[RETRY_ID],
  }),
  {
    onChangeLogLevel: (userId, logLevel) => {
      setLogLevel(userId, logLevel);
      return { [LOG_LEVEL_FILTER_KEY]: logLevel.id, [PAGE_KEY]: 1 };
    },
    onChangeWithAttachments: (withAttachments) => {
      return { [WITH_ATTACHMENTS_FILTER_KEY]: withAttachments || undefined };
    },
    onChangeHideEmptySteps: (hideEmptySteps) => {
      return { [HIDE_EMPTY_STEPS]: hideEmptySteps || undefined };
    },
    onChangeHidePassedLogs: (hidePassedLogs) => {
      return { [HIDE_PASSED_LOGS]: hidePassedLogs || undefined };
    },
    onChangeLogStatusFilter: (status) => ({
      [LOG_STATUS_FILTER_KEY]: status || undefined,
    }),
  },
  { namespace: NAMESPACE },
)
@track()
export class LogsGridWrapper extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    userId: PropTypes.string.isRequired,
    logItems: PropTypes.array,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    filter: PropTypes.string,
    onFilterChange: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    onChangeLogLevel: PropTypes.func,
    onChangeWithAttachments: PropTypes.func,
    onChangeHideEmptySteps: PropTypes.func,
    onChangeHidePassedLogs: PropTypes.func,
    logViewMode: PropTypes.string,
    onChangeLogStatusFilter: PropTypes.func,
    isNestedStepView: PropTypes.bool,
    logLevelId: PropTypes.string,
    logStatus: PropTypes.string,
    withAttachments: PropTypes.string,
    hideEmptySteps: PropTypes.string,
    hidePassedLogs: PropTypes.string,
    retryId: PropTypes.string,
    isSauceLabsIntegrationView: PropTypes.bool.isRequired,
    errorLogs: PropTypes.array,
    fetchErrorLog: PropTypes.func,
    logsPagination: PropTypes.bool,
  };

  static defaultProps = {
    logItems: [],
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: 0,
    pageCount: 0,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    filter: '',
    onFilterChange: () => {},
    sortingColumn: '',
    sortingDirection: '',
    onChangeSorting: () => {},
    onChangeLogLevel: () => {},
    onChangeWithAttachments: () => {},
    onChangeHideEmptySteps: () => {},
    onChangeHidePassedLogs: () => {},
    logViewMode: DETAILED_LOG_VIEW,
    onChangeLogStatusFilter: () => {},
    isNestedStepView: false,
    logLevelId: null,
    logStatus: null,
    withAttachments: undefined,
    hideEmptySteps: undefined,
    hidePassedLogs: undefined,
    retryId: undefined,
    errorLogs: [],
    fetchErrorLog: () => {},
    logsPagination: true,
  };

  state = {
    errorLogIndex: null,
    skipHighlightOnRender: false,
    isSauceLabsIntegrationView: false,
  };

  componentDidMount() {
    if (this.props.logViewMode === DETAILED_LOG_VIEW) {
      const errorLogId = getStorageItem(ERROR_LOG_INDEX_KEY);
      if (errorLogId) {
        const { errorLogs } = this.props;
        const errorLogIndex = errorLogs.findIndex(({ id }) => id === errorLogId);
        removeStorageItem(ERROR_LOG_INDEX_KEY);
        const fetchErrorLogCb = () =>
          this.setState({ skipHighlightOnRender: false, errorLogIndex });
        this.props.fetchErrorLog(errorLogs[errorLogIndex], fetchErrorLogCb);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.logViewMode === DETAILED_LOG_VIEW) {
      if (
        this.props.logLevelId !== prevProps.logLevelId ||
        this.props.logStatus !== prevProps.logStatus ||
        this.props.withAttachments !== prevProps.withAttachments ||
        this.props.hideEmptySteps !== prevProps.hideEmptySteps ||
        this.props.hidePassedLogs !== prevProps.hidePassedLogs ||
        this.props.retryId !== prevProps.retryId ||
        this.props.sortingDirection !== prevProps.sortingDirection ||
        this.props.filter !== prevProps.filter ||
        this.props.pageSize !== prevProps.pageSize
      ) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ errorLogIndex: null, skipHighlightOnRender: false });
      }
    }
  }

  highlightErrorLog = (direction) => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.getClickOnHighlightErrorLogEvent(!!direction));

    const { errorLogs } = this.props;
    const { errorLogIndex } = this.state;
    const nextErrorLogIndex = calculateNextIndex(errorLogs, errorLogIndex, direction);

    const fetchErrorLogCb = () =>
      this.setState({ skipHighlightOnRender: false, errorLogIndex: nextErrorLogIndex });

    this.props.fetchErrorLog(errorLogs[nextErrorLogIndex], fetchErrorLogCb);
  };

  render() {
    const {
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
      onChangeHideEmptySteps,
      onChangeHidePassedLogs,
      logViewMode,
      logStatus,
      onChangeLogStatusFilter,
      isNestedStepView,
      withAttachments,
      hideEmptySteps,
      hidePassedLogs,
      isSauceLabsIntegrationView,
      errorLogs,
      logsPagination,
    } = this.props;
    const rowHighlightingConfig = {
      highlightedRowId: this.props.errorLogs[this.state.errorLogIndex]?.id,
      isGridRowHighlighted: true,
      onGridRowHighlighted: () => this.setState(() => ({ skipHighlightOnRender: true })),
      highlightErrorRow: true,
      skipHighlightOnRender: this.state.skipHighlightOnRender,
    };

    return (
      <>
        {isSauceLabsIntegrationView ? (
          <SauceLabsSection />
        ) : (
          <Fragment>
            <LogsGridToolbar
              activePage={activePage}
              pageCount={pageCount}
              onChangePage={onChangePage}
              logLevel={getLogLevel(userId, logLevelId)}
              onChangeLogLevel={onChangeLogLevel}
              withAttachments={Boolean(withAttachments)}
              isEmptyStepsHidden={Boolean(hideEmptySteps)}
              isPassedLogsHidden={Boolean(hidePassedLogs)}
              onChangeWithAttachments={onChangeWithAttachments}
              onHideEmptySteps={onChangeHideEmptySteps}
              onHidePassedLogs={onChangeHidePassedLogs}
              logPageMode={logViewMode}
              errorLogs={errorLogs}
              highlightErrorLog={this.highlightErrorLog}
              errorLogIndex={this.state.errorLogIndex}
            >
              {({ markdownMode, consoleView, rawHeaderCellStylesConfig }) => (
                <LogsGrid
                  logItems={logItems}
                  loading={loading}
                  filter={filter}
                  onFilterChange={onFilterChange}
                  sortingColumn={sortingColumn}
                  sortingDirection={sortingDirection}
                  onChangeSorting={onChangeSorting}
                  markdownMode={markdownMode}
                  logStatus={logStatus}
                  onChangeLogStatusFilter={onChangeLogStatusFilter}
                  consoleView={consoleView}
                  isNestedStepView={isNestedStepView}
                  rowHighlightingConfig={rowHighlightingConfig}
                  rawHeaderCellStylesConfig={rawHeaderCellStylesConfig}
                />
              )}
            </LogsGridToolbar>
            {!!pageCount && logItems && !!logItems.length && !loading && logsPagination && (
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
      </>
    );
  }
}
