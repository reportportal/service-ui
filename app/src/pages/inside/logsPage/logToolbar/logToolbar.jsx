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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import {
  breadcrumbsSelector,
  namespaceSelector,
  fetchTestItemsFromLogPageAction,
  restorePathAction,
} from 'controllers/testItem';
import { withPagination, DEFAULT_PAGINATION, PAGE_KEY } from 'controllers/pagination';
import {
  nextLogLinkSelector,
  previousLogLinkSelector,
  previousItemSelector,
  nextItemSelector,
  disablePrevItemLinkSelector,
  disableNextItemLinkSelector,
  DETAILED_LOG_VIEW,
  setIncludeAllLaunchesAction,
  includeAllLaunchesSelector,
  DEFAULT_HISTORY_DEPTH,
  historyItemsSelector,
  setShouldShowLoadMoreAction,
} from 'controllers/log';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { stepPaginationSelector } from 'controllers/step';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import styles from './logToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  historyAllLaunchesLabel: {
    id: 'LogToolbar.historyAcrossAllLaunches',
    defaultMessage: 'History Across All Launches',
  },
});

@injectIntl
@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    nextLink: nextLogLinkSelector(state),
    previousLink: previousLogLinkSelector(state),
    previousItem: previousItemSelector(state),
    nextItem: nextItemSelector(state),
    previousLinkDisable: disablePrevItemLinkSelector(state),
    nextLinkDisable: disableNextItemLinkSelector(state),
    includeAllLaunches: includeAllLaunchesSelector(state),
    historyItems: historyItemsSelector(state),
  }),
  {
    setIncludeAllLaunchesAction,
    navigate: (linkAction) => linkAction,
    fetchTestItems: fetchTestItemsFromLogPageAction,
    restorePath: restorePathAction,
    setShouldShowLoadMoreAction,
  },
)
@withPagination({
  paginationSelector: stepPaginationSelector,
  namespaceSelector,
  offset: 1,
})
@track()
export class LogToolbar extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    setIncludeAllLaunchesAction: PropTypes.func.isRequired,
    includeAllLaunches: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    breadcrumbs: PropTypes.array,
    onRefresh: PropTypes.func,
    previousItem: PropTypes.object,
    nextItem: PropTypes.object,
    nextLink: PropTypes.object,
    previousLink: PropTypes.object,
    navigate: PropTypes.func,
    previousLinkDisable: PropTypes.bool,
    nextLinkDisable: PropTypes.bool,
    activePage: PropTypes.number,
    fetchTestItems: PropTypes.func,
    logViewMode: PropTypes.string,
    restorePath: PropTypes.func,
    parentItem: PropTypes.object,
    historyItems: PropTypes.array,
    setShouldShowLoadMoreAction: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    onRefresh: () => {},
    previousItem: null,
    nextItem: null,
    nextLink: null,
    previousLink: null,
    navigate: () => {},
    previousLinkDisable: false,
    nextLinkDisable: false,
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    fetchTestItems: () => {},
    logViewMode: DETAILED_LOG_VIEW,
    restorePath: () => {},
    parentItem: null,
    historyItems: [],
    setShouldShowLoadMoreAction: () => {},
  };

  handleBackClick = () => {
    const { navigate, previousLink, fetchTestItems, tracking } = this.props;

    tracking.trackEvent(LOG_PAGE_EVENTS.PREVIOUS_ITEM_BTN);
    if (previousLink) {
      return navigate(previousLink);
    }
    return fetchTestItems();
  };
  handleForwardClick = () => {
    const { fetchTestItems, nextLink, navigate, tracking } = this.props;

    tracking.trackEvent(LOG_PAGE_EVENTS.NEXT_ITEM_BTN);
    if (nextLink) {
      return navigate(nextLink);
    }
    return fetchTestItems({ next: true });
  };

  finishLoading = () => {
    const { historyItems } = this.props;
    const loadedItems = historyItems.length - DEFAULT_HISTORY_DEPTH;
    this.props.setShouldShowLoadMoreAction(loadedItems >= 0);
  };

  changeHistoryLineMode = () => {
    const { tracking, includeAllLaunches } = this.props;
    tracking.trackEvent(LOG_PAGE_EVENTS.HISTORY_LINE_MODE_CHB);
    this.props.setIncludeAllLaunchesAction(!includeAllLaunches, this.finishLoading);
  };

  render() {
    const {
      intl,
      breadcrumbs,
      previousItem,
      nextItem,
      onRefresh,
      previousLinkDisable,
      nextLinkDisable,
      logViewMode,
      restorePath,
      parentItem,
      includeAllLaunches,
    } = this.props;
    return (
      <div className={cx('log-toolbar')}>
        <Breadcrumbs
          descriptors={breadcrumbs}
          togglerEventInfo={LOG_PAGE_EVENTS.PLUS_MINUS_BREADCRUMB}
          breadcrumbEventInfo={LOG_PAGE_EVENTS.ITEM_NAME_BREADCRUMB_CLICK}
          allEventClick={LOG_PAGE_EVENTS.ALL_LABEL_BREADCRUMB}
          onRestorePath={restorePath}
        />
        <div className={cx('action-buttons')}>
          {logViewMode === DETAILED_LOG_VIEW ? (
            <>
              <InputCheckbox onChange={this.changeHistoryLineMode} value={includeAllLaunches}>
                {intl.formatMessage(messages.historyAllLaunchesLabel)}
              </InputCheckbox>
              <div className={cx('action-button')}>
                <div className={cx('left-arrow-button')}>
                  <GhostButton
                    icon={LeftArrowIcon}
                    disabled={previousLinkDisable}
                    title={previousItem && previousItem.name}
                    onClick={this.handleBackClick}
                    transparentBackground
                  />
                </div>
                <GhostButton
                  icon={RightArrowIcon}
                  disabled={nextLinkDisable}
                  title={nextItem && nextItem.name}
                  onClick={this.handleForwardClick}
                  transparentBackground
                />
              </div>
            </>
          ) : (
            parentItem && <ParentInfo parentItem={parentItem} />
          )}
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={onRefresh} transparentBackground>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
