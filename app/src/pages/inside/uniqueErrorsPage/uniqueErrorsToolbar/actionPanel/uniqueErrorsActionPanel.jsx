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
import { userAccountRoleSelector } from 'controllers/user';
import { activeProjectRoleSelector } from 'controllers/pages';
import styles from './uniqueErrorsActionPanel.scss';

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
    ignoreInAutoAnalysisAction,
    includeInAutoAnalysisAction,
  },
)
@injectIntl
@track()
export class UniqueErrorsActionPanel extends Component {
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
    showBreadcrumbs: PropTypes.bool,
    unselectAndFetchItems: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
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
    showBreadcrumbs: true,
    unselectAndFetchItems: () => {},
  };

  handlePostIssue = () => {
    const { unselectAndFetchItems, onPostIssue, selectedItems, tracking } = this.props;
    onPostIssue(selectedItems, {
      fetchFunc: unselectAndFetchItems,
      eventsInfo: {
        postBtn: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.getClickPostIssueButtonEventParameters(),
      },
    });
    UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_ACTION &&
      tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_ACTION);
  };

  handleLinkIssue = () => {
    const { unselectAndFetchItems, selectedItems, tracking, onLinkIssue } = this.props;
    onLinkIssue(selectedItems, {
      fetchFunc: unselectAndFetchItems,
      eventsInfo: {
        addNewIssue: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.getClickAddNewIssueButtonEventParameters(),
        loadBtn: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.getClickLoadButtonEventParameters(),
      },
    });
    tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_ACTION);
  };

  handleUnlinkIssue = () => {
    const { unselectAndFetchItems, onUnlinkIssue, selectedItems, tracking } = this.props;
    onUnlinkIssue(selectedItems, {
      fetchFunc: unselectAndFetchItems,
      eventsInfo: {
        unlinkBtn: UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.getClickUnlinkButtonEventParameters(),
      },
    });
    tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUES_ACTION);
  };

  handleIgnoreInAA = () => {
    const { tracking } = this.props;
    this.props.ignoreInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: { ignoreBtn: UNIQUE_ERRORS_PAGE_EVENTS.IGNORE_BTN_IGNORE_ITEMS_IN_AA_MODAL },
    });
    tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.IGNORE_IN_AA_ACTION);
  };

  handleIncludeInAA = () => {
    const { tracking } = this.props;
    this.props.includeInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: { includeBtn: UNIQUE_ERRORS_PAGE_EVENTS.INCLUDE_BTN_INCLUDE_IN_AA_MODAL },
    });
    tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.INCLUDE_IN_AA_ACTION);
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

  onRefresh = () => {
    const { onRefresh, tracking } = this.props;
    onRefresh();
    tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_REFRESH_BTN);
  };

  onClickActionsButton = () => {
    const { tracking } = this.props;
    tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_ACTIONS_BTN);
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
      <div
        className={cx('unique-errors-action-panel', {
          'right-buttons-only': !showBreadcrumbs && !hasErrors,
        })}
      >
        {showBreadcrumbs && (
          <Breadcrumbs
            descriptors={breadcrumbs}
            onRestorePath={restorePath}
            togglerEventInfo={UNIQUE_ERRORS_PAGE_EVENTS.getClickOnPlusMinusBreadcrumbEvent}
            breadcrumbEventInfo={UNIQUE_ERRORS_PAGE_EVENTS.CLICK_ITEM_NAME_BREADCRUMB}
            allEventClick={UNIQUE_ERRORS_PAGE_EVENTS.CLICK_ALL_LABEL_BREADCRUMB}
          />
        )}
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
              onClick={this.onClickActionsButton}
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={this.onRefresh} transparentBackground>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
