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
import { PageLayout, PageSection } from 'layouts/pageLayout';
import {
  refreshLogPageData,
  loadingSelector,
  pageLoadingSelector,
  DETAILED_LOG_VIEW,
  logViewModeSelector,
} from 'controllers/log';
import { parentItemSelector } from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { userIdSelector } from 'controllers/user';
import { LOG_PAGE, LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { TestItemLogsToolbar } from './testItemLogsToolbar';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';
import { LogItemInfo } from './logItemInfo';
import { LogsGridWrapper } from './logsGridWrapper';

@connect(
  (state) => ({
    loading: loadingSelector(state),
    pageLoading: pageLoadingSelector(state),
    userId: userIdSelector(state),
    debugMode: debugModeSelector(state),
    logViewMode: logViewModeSelector(state),
    parentItem: parentItemSelector(state),
  }),
  {
    refresh: refreshLogPageData,
  },
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
    loading: PropTypes.bool,
    pageLoading: PropTypes.bool,
    logViewMode: PropTypes.string,
    parentItem: PropTypes.object,
  };

  static defaultProps = {
    loading: false,
    pageLoading: false,
    logViewMode: DETAILED_LOG_VIEW,
    parentItem: {},
  };

  state = {
    isSauceLabsIntegrationView: false,
  };

  toggleSauceLabsIntegrationView = () =>
    this.setState({
      isSauceLabsIntegrationView: !this.state.isSauceLabsIntegrationView,
    });

  handleRefresh = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.CLICK_REFRESH_BTN);
    if (this.state.isSauceLabsIntegrationView) {
      this.toggleSauceLabsIntegrationView();
    }
    this.props.refresh();
  };

  render() {
    const { refresh, debugMode, loading, pageLoading, logViewMode, parentItem } = this.props;

    return (
      <PageLayout>
        <PageSection>
          {pageLoading && <SpinningPreloader />}
          {!pageLoading && (
            <Fragment>
              <LogToolbar
                onRefresh={this.handleRefresh}
                logViewMode={logViewMode}
                parentItem={parentItem}
                debugMode={debugMode}
              />
              {logViewMode === DETAILED_LOG_VIEW ? (
                <Fragment>
                  {!debugMode && <HistoryLine />}
                  <LogItemInfo
                    onToggleSauceLabsIntegrationView={this.toggleSauceLabsIntegrationView}
                    isSauceLabsIntegrationView={this.state.isSauceLabsIntegrationView}
                    fetchFunc={refresh}
                    debugMode={debugMode}
                    loading={loading}
                  />
                </Fragment>
              ) : (
                <Fragment>
                  <TestItemLogsToolbar parentItem={parentItem} />
                  <LogsGridWrapper />
                </Fragment>
              )}
            </Fragment>
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
