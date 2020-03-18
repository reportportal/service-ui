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
import { connectRouter } from 'common/utils';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import {
  refreshLogPageData,
  logItemsSelector,
  logPaginationSelector,
  loadingSelector,
  pageLoadingSelector,
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
} from 'controllers/log';
import { parentItemSelector } from 'controllers/testItem';
import { withFilter } from 'controllers/filter';
import { debugModeSelector } from 'controllers/launch';
import { withPagination, PAGE_KEY, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import { userIdSelector } from 'controllers/user';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { LOG_PAGE, LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { TestItemLogsToolbar } from 'pages/inside/testItemLogsToolbar';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
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
    pageLoading: pageLoadingSelector(state),
    userId: userIdSelector(state),
    debugMode: debugModeSelector(state),
    logViewMode: logViewModeSelector(state),
    parentItem: parentItemSelector(state),
    isNestedStepView: isLogPageWithNestedSteps(state),
  }),
  {
    refresh: refreshLogPageData,
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
    logStatus: query[LOG_STATUS_FILTER_KEY],
    withAttachments: query[WITH_ATTACHMENTS_FILTER_KEY],
    hideEmptySteps: query[HIDE_EMPTY_STEPS],
    hidePassedLogs: query[HIDE_PASSED_LOGS],
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
@track({ page: LOG_PAGE })
export class LogsPage extends Component {
  static propTypes = {
    refresh: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    userId: PropTypes.string.isRequired,
    debugMode: PropTypes.bool.isRequired,
    logItems: PropTypes.array,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    pageLoading: PropTypes.bool,
    filter: PropTypes.string,
    logLevelId: PropTypes.string,
    onFilterChange: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    onChangeLogLevel: PropTypes.func,
    onChangeWithAttachments: PropTypes.func,
    onChangeHideEmptySteps: PropTypes.func,
    onChangeHidePassedLogs: PropTypes.func,
    logViewMode: PropTypes.string,
    parentItem: PropTypes.object,
    logStatus: PropTypes.string,
    onChangeLogStatusFilter: PropTypes.func,
    isNestedStepView: PropTypes.bool,
    withAttachments: PropTypes.string,
    hideEmptySteps: PropTypes.string,
    hidePassedLogs: PropTypes.string,
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
    pageLoading: false,
    filter: '',
    logLevelId: null,
    onFilterChange: () => {},
    sortingColumn: '',
    sortingDirection: '',
    onChangeSorting: () => {},
    onChangeLogLevel: () => {},
    onChangeWithAttachments: () => {},
    onChangeHideEmptySteps: () => {},
    onChangeHidePassedLogs: () => {},
    logViewMode: DETAILED_LOG_VIEW,
    parentItem: {},
    logStatus: null,
    onChangeLogStatusFilter: () => {},
    isNestedStepView: false,
    withAttachments: undefined,
    hideEmptySteps: undefined,
    hidePassedLogs: undefined,
  };

  state = {
    isSauceLabsIntegrationView: false,
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

  render() {
    const {
      refresh,
      logItems,
      userId,
      debugMode,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      pageLoading,
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
      parentItem,
      logStatus,
      onChangeLogStatusFilter,
      isNestedStepView,
      withAttachments,
      hideEmptySteps,
      hidePassedLogs,
    } = this.props;

    return (
      <PageLayout>
        <PageSection>
          {pageLoading && <SpinningPreloader />}
          {!pageLoading && (
            <Fragment>
              <LogToolbar onRefresh={this.handleRefresh} logViewMode={logViewMode} />
              {logViewMode === DETAILED_LOG_VIEW ? (
                <Fragment>
                  {!debugMode && <HistoryLine />}
                  <LogItemInfo
                    onChangeLogLevel={onChangeLogLevel}
                    onChangePage={onChangePage}
                    onToggleSauceLabsIntegrationView={this.toggleSauceLabsIntegrationView}
                    isSauceLabsIntegrationView={this.state.isSauceLabsIntegrationView}
                    fetchFunc={refresh}
                    debugMode={debugMode}
                    loading={loading}
                  />
                </Fragment>
              ) : (
                <TestItemLogsToolbar parentItem={parentItem} />
              )}
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
                    withAttachments={Boolean(withAttachments)}
                    isEmptyStepsHidden={Boolean(hideEmptySteps)}
                    isPassedLogsHidden={Boolean(hidePassedLogs)}
                    onChangeWithAttachments={onChangeWithAttachments}
                    onHideEmptySteps={onChangeHideEmptySteps}
                    onHidePassedLogs={onChangeHidePassedLogs}
                    logPageMode={logViewMode}
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
                        logStatus={logStatus}
                        onChangeLogStatusFilter={onChangeLogStatusFilter}
                        consoleView={consoleView}
                        isNestedStepView={isNestedStepView}
                      />
                    )}
                  </LogsGridToolbar>
                  {!!pageCount && logItems && !!logItems.length && !loading && (
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
            </Fragment>
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
