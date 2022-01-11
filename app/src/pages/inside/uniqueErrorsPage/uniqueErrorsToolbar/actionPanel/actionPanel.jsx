/*
 * Copyright 2021 EPAM Systems
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
import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { reloadClustersAction } from 'controllers/uniqueErrors';
import { createStepActionDescriptors } from 'pages/inside/common/utils';
import {
  availableBtsIntegrationsSelector,
  enabledBtsPluginsSelector,
  isBtsPluginsExistSelector,
} from 'controllers/plugins';
import {
  ignoreInAutoAnalysisAction,
  includeInAutoAnalysisAction,
  lastOperationSelector,
  linkIssueAction,
  postIssueAction,
  unlinkIssueAction,
  proceedWithValidItemsAction,
} from 'controllers/uniqueErrors/clusterItems';
import { showModalAction } from 'controllers/modal';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';

import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
    isBtsPluginsExist: isBtsPluginsExistSelector(state),
    enabledBtsPlugins: enabledBtsPluginsSelector(state),
    lastOperation: lastOperationSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
  }),
  {
    restorePath: restorePathAction,
    onRefresh: reloadClustersAction,
    onLinkIssue: linkIssueAction,
    onUnlinkIssue: unlinkIssueAction,
    onPostIssue: postIssueAction,
    proceedWithValidItems: proceedWithValidItemsAction,
    showModalAction,
    ignoreInAutoAnalysisAction,
    includeInAutoAnalysisAction,
  },
)
@injectIntl
@track()
export class ActionPanel extends Component {
  static propTypes = {
    accountRole: PropTypes.string,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    btsIntegrations: PropTypes.array,
    enabledBtsPlugins: PropTypes.array,
    hasErrors: PropTypes.bool,
    hasValidItems: PropTypes.bool,
    ignoreInAutoAnalysisAction: PropTypes.func,
    includeInAutoAnalysisAction: PropTypes.func,
    intl: PropTypes.object.isRequired,
    isBtsPluginsExist: PropTypes.bool,
    lastOperation: PropTypes.object,
    onDelete: PropTypes.func,
    onEditDefects: PropTypes.func,
    onEditItems: PropTypes.func,
    onLinkIssue: PropTypes.func,
    onPostIssue: PropTypes.func,
    onRefresh: PropTypes.func,
    onUnlinkIssue: PropTypes.func,
    parentItem: PropTypes.object,
    restorePath: PropTypes.func,
    proceedWithValidItems: PropTypes.func,
    projectRole: PropTypes.string.isRequired,
    selectedItems: PropTypes.array,
    showModalAction: PropTypes.func,
    showBreadcrumbs: PropTypes.bool,
    unselectAndFetchItems: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    events: PropTypes.object,
  };

  static defaultProps = {
    accountRole: '',
    breadcrumbs: [],
    btsIntegrations: [],
    enabledBtsPlugins: [],
    hasErrors: false,
    hasValidItems: false,
    ignoreInAutoAnalysisAction: () => {},
    includeInAutoAnalysisAction: () => {},
    isBtsPluginsExist: false,
    lastOperation: {},
    onDelete: () => {},
    onEditDefects: () => {},
    onEditItems: () => {},
    onLinkIssue: () => {},
    onPostIssue: () => {},
    onRefresh: () => {},
    onUnlinkIssue: () => {},
    parentItem: null,
    restorePath: () => {},
    proceedWithValidItems: () => {},
    selectedItems: [],
    showModalAction: () => {},
    showBreadcrumbs: true,
    unselectAndFetchItems: () => {},
    events: {},
  };

  handlePostIssue = () => {
    const { unselectAndFetchItems, onPostIssue, selectedItems, events, tracking } = this.props;
    onPostIssue(selectedItems, {
      fetchFunc: unselectAndFetchItems,
      eventsInfo: {
        postBtn: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.POST_BTN_POST_ISSUE_MODAL,
        attachmentsSwitcher: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.attachmentsSwitcher,
        logsSwitcher: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.logsSwitcher,
        commentSwitcher: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.commentSwitcher,
      },
    });
    events.POST_ISSUE_ACTION && tracking.trackEvent(events.POST_ISSUE_ACTION);
  };
  handleLinkIssue = () => {
    const { unselectAndFetchItems, selectedItems, events, tracking, onLinkIssue } = this.props;
    onLinkIssue(selectedItems, {
      fetchFunc: unselectAndFetchItems,
      eventsInfo: {
        addNewIssue:
          UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL,
        loadBtn: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.LOAD_BTN_LINK_ISSUE_MODAL,
      },
    });
    events.LINK_ISSUE_ACTION && tracking.trackEvent(events.LINK_ISSUE_ACTION);
  };
  handleUnlinkIssue = () => {
    const { unselectAndFetchItems, onUnlinkIssue, selectedItems, events, tracking } = this.props;
    onUnlinkIssue(selectedItems, {
      fetchFunc: unselectAndFetchItems,
      eventsInfo: {
        unlinkAutoAnalyzedTrue:
          UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS
            .UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_TRUE,
        unlinkAutoAnalyzedFalse:
          UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS
            .UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_FALSE,
      },
    });
    events.UNLINK_ISSUES_ACTION && tracking.trackEvent(events.UNLINK_ISSUES_ACTION);
  };
  handleIgnoreInAA = () => {
    this.props.ignoreInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: { ignoreBtn: UNIQUE_ERRORS_PAGE_EVENTS.IGNORE_BTN_IGNORE_ITEMS_IN_AA_MODAL },
    });
    const { events, tracking } = this.props;
    events.IGNORE_IN_AA_ACTION && tracking.trackEvent(events.IGNORE_IN_AA_ACTION);
  };

  handleIncludeInAA = () => {
    this.props.includeInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: { includeBtn: UNIQUE_ERRORS_PAGE_EVENTS.INCLUDE_BTN_INCLUDE_IN_AA_MODAL },
    });
    const { events, tracking } = this.props;
    events.INCLUDE_IN_AA_ACTION && tracking.trackEvent(events.INCLUDE_IN_AA_ACTION);
  };

  getItemsActionDescriptors = () => {
    const {
      intl: { formatMessage },
      onEditItems,
      onEditDefects,
      onDelete,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      accountRole,
      projectRole,
      selectedItems,
    } = this.props;

    return createStepActionDescriptors({
      formatMessage,
      selectedItems,
      accountRole,
      projectRole,
      enabledBtsPlugins,
      isBtsPluginsExist,
      btsIntegrations,
      onDelete,
      onIgnoreInAA: this.handleIgnoreInAA,
      onIncludeInAA: this.handleIncludeInAA,
      onEditItems,
      onEditDefects,
      onPostIssue: this.handlePostIssue,
      onLinkIssue: this.handleLinkIssue,
      onUnlinkIssue: this.handleUnlinkIssue,
    });
  };
  onProceedWithValidItems = () => {
    const {
      lastOperation: { operationName, operationArgs },
      selectedItems,
    } = this.props;

    this.props.proceedWithValidItems(operationName, selectedItems, operationArgs);
  };
  onReload = () => {
    const { onRefresh, events, tracking } = this.props;
    onRefresh();
    events.REFRESH_BTN && tracking.trackEvent(events.REFRESH_BTN);
  };

  render() {
    const {
      intl: { formatMessage },
      breadcrumbs,
      restorePath,
      showBreadcrumbs,
      parentItem,
      selectedItems,
      hasErrors,
      hasValidItems,
    } = this.props;
    const itemsActionDescriptors = this.getItemsActionDescriptors();

    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumbs && !hasErrors })}>
        {showBreadcrumbs && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
        {hasErrors && (
          <GhostButton
            disabled={!hasValidItems}
            onClick={this.onProceedWithValidItems}
            transparentBackground
          >
            {formatMessage(COMMON_LOCALE_KEYS.PROCEED_VALID_ITEMS)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {parentItem && <ParentInfo parentItem={parentItem} />}
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostMenuButton
              title={formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
              items={itemsActionDescriptors}
              disabled={!selectedItems.length}
              transparentBackground
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={this.onReload} transparentBackground>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
