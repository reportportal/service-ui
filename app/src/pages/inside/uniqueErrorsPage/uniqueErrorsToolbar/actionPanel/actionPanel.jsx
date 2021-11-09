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
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { breadcrumbsSelector, launchSelector, restorePathAction } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { reloadClusterAction } from 'controllers/uniqueErrors';
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
    parentLaunch: launchSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
  }),
  {
    restorePath: restorePathAction,
    onRefresh: reloadClusterAction,
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
    parentLaunch: PropTypes.object,
    restorePath: PropTypes.func,
    proceedWithValidItems: PropTypes.func,
    projectRole: PropTypes.string.isRequired,
    selectedItems: PropTypes.array,
    showModalAction: PropTypes.func,
    showBreadcrumbs: PropTypes.bool,
    unselectAndFetchItems: PropTypes.func,
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
    parentLaunch: {},
    restorePath: () => {},
    proceedWithValidItems: () => {},
    selectedItems: [],
    showModalAction: () => {},
    showBreadcrumbs: true,
    unselectAndFetchItems: () => {},
  };

  handlePostIssue = () => {
    this.props.onPostIssue(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: {},
    });
  };
  handleLinkIssue = () => {
    this.props.onLinkIssue(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: {},
    });
  };
  handleUnlinkIssue = () => {
    this.props.onUnlinkIssue(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: {},
    });
  };
  handleIgnoreInAA = () => {
    this.props.ignoreInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: {},
    });
  };

  handleIncludeInAA = () => {
    this.props.includeInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.unselectAndFetchItems,
      eventsInfo: {},
    });
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

  render() {
    const {
      intl: { formatMessage },
      breadcrumbs,
      restorePath,
      showBreadcrumbs,
      parentItem,
      onRefresh,
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
            <GhostButton icon={RefreshIcon} onClick={onRefresh} transparentBackground>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
