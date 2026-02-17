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
import classNames from 'classnames/bind';
import {
  refreshLogPageData,
  loadingSelector,
  pageLoadingSelector,
  DETAILED_LOG_VIEW,
  logViewModeSelector,
} from 'controllers/log';
import { parentItemSelector, launchSelector } from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { logsFullWidthModeSelector } from 'controllers/user';
import { LOG_PAGE, LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { TestItemLogsToolbar } from './testItemLogsToolbar';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';
import { LogItemInfo } from './logItemInfo';
import { LogsGridWrapper } from './logsGridWrapper';
import styles from './logsPage.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    loading: loadingSelector(state),
    pageLoading: pageLoadingSelector(state),
    debugMode: debugModeSelector(state),
    logViewMode: logViewModeSelector(state),
    parentItem: parentItemSelector(state),
    parentLaunch: launchSelector(state),
    logsFullWidthMode: logsFullWidthModeSelector(state),
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
    debugMode: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    pageLoading: PropTypes.bool,
    logViewMode: PropTypes.string,
    parentItem: PropTypes.object,
    parentLaunch: PropTypes.object,
    logsFullWidthMode: PropTypes.bool,
  };

  static defaultProps = {
    loading: false,
    pageLoading: false,
    logViewMode: DETAILED_LOG_VIEW,
    parentItem: {},
    logsFullWidthMode: false,
  };

  state = {
    isSauceLabsIntegrationView: false,
  };

  toggleSauceLabsIntegrationView = () => {
    const isSauceLabsIntegrationView = !this.state.isSauceLabsIntegrationView;

    if (isSauceLabsIntegrationView) {
      this.props.tracking.trackEvent(LOG_PAGE_EVENTS.SAUCE_LABS_BTN);
    }

    this.setState({ isSauceLabsIntegrationView });
  };

  handleRefresh = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.CLICK_REFRESH_BTN);
    if (this.state.isSauceLabsIntegrationView) {
      this.toggleSauceLabsIntegrationView();
    }
    this.props.refresh();
  };

  render() {
    const {
      refresh,
      debugMode,
      loading,
      pageLoading,
      logViewMode,
      parentItem,
      logsFullWidthMode,
    } = this.props;

    return (
      <div>
        {pageLoading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <LogToolbar
              className={cx('page-section')}
              onRefresh={this.handleRefresh}
              logViewMode={logViewMode}
              parentItem={parentItem}
              debugMode={debugMode}
            />
            {logViewMode === DETAILED_LOG_VIEW ? (
              <Fragment>
                {!debugMode && <HistoryLine className={cx('page-section')} />}
                <LogItemInfo
                  className={cx('page-section', { 'full-width': logsFullWidthMode })}
                  detailsClassName={cx('details-section')}
                  onToggleSauceLabsIntegrationView={this.toggleSauceLabsIntegrationView}
                  isSauceLabsIntegrationView={this.state.isSauceLabsIntegrationView}
                  fetchFunc={refresh}
                  debugMode={debugMode}
                  loading={loading}
                  parentLaunch={this.props.parentLaunch}
                />
              </Fragment>
            ) : (
              <Fragment>
                <TestItemLogsToolbar className={cx('page-section')} parentItem={parentItem} />
                <LogsGridWrapper
                  className={cx('page-section', { 'full-width': logsFullWidthMode })}
                />
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
