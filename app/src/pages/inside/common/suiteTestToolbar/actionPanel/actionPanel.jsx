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

import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import {
  breadcrumbsSelector,
  isListViewSelector,
  levelSelector,
  namespaceSelector,
  restorePathAction,
} from 'controllers/testItem';
import { HISTORY_PAGE, payloadSelector } from 'controllers/pages';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { availableBtsIntegrationsSelector, isPostIssueActionAvailable } from 'controllers/plugins';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events/suitesPageEvents';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { LEVEL_STEP, LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { canBulkEditLaunches } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import RefreshIcon from 'common/img/refresh-inline.svg';
import HistoryIcon from 'common/img/history-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  actionsBtn: {
    id: 'ActionPanel.actionsBtn',
    defaultMessage: 'Actions',
  },
  editDefects: {
    id: 'ActionPanel.editDefects',
    defaultMessage: 'Edit defects',
  },
  editItems: {
    id: 'ActionPanel.editItems',
    defaultMessage: 'Edit items',
  },
  postIssue: {
    id: 'ActionPanel.postIssue',
    defaultMessage: 'Post issue',
  },
  linkIssue: {
    id: 'ActionPanel.linkIssue',
    defaultMessage: 'Link issue',
  },
  unlinkIssue: {
    id: 'ActionPanel.unlinkIssue',
    defaultMessage: 'Unlink issue',
  },
  ignoreInAA: {
    id: 'ActionPanel.ignoreInAA',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  includeInAA: {
    id: 'ActionPanel.includeInAA',
    defaultMessage: 'Include into Auto Analysis',
  },
  proceedButton: {
    id: 'ActionPanel.proceedButton',
    defaultMessage: 'Proceed Valid Items',
  },
  actionsBtnTooltip: {
    id: 'ActionPanel.actionsBtnTooltip',
    defaultMessage: ' Select several items to processing',
  },
});

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    level: levelSelector(state),
    listView: isListViewSelector(state, namespaceSelector(state)),
    payload: payloadSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
  }),
  {
    restorePath: restorePathAction,
    navigate: (linkAction) => linkAction,
  },
)
@injectIntl
@track()
export class ActionPanel extends Component {
  static propTypes = {
    payload: PropTypes.object.isRequired,
    debugMode: PropTypes.bool,
    onRefresh: PropTypes.func,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    accountRole: PropTypes.string,
    projectRole: PropTypes.string.isRequired,
    restorePath: PropTypes.func,
    showBreadcrumbs: PropTypes.bool,
    hasErrors: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    hasValidItems: PropTypes.bool,
    level: PropTypes.string,
    onProceedValidItems: PropTypes.func,
    selectedItems: PropTypes.array,
    onEditItems: PropTypes.func,
    onEditDefects: PropTypes.func,
    onPostIssue: PropTypes.func,
    onLinkIssue: PropTypes.func,
    onUnlinkIssue: PropTypes.func,
    onIgnoreInAA: PropTypes.func,
    onIncludeInAA: PropTypes.func,
    onDelete: PropTypes.func,
    listView: PropTypes.bool,
    btsIntegrations: PropTypes.array,
    deleteDisabled: PropTypes.bool,
    navigate: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    debugMode: false,
    onRefresh: () => {},
    breadcrumbs: [],
    accountRole: '',
    errors: {},
    restorePath: () => {},
    level: '',
    showBreadcrumbs: true,
    hasErrors: false,
    actionsMenuDisabled: false,
    hasValidItems: false,
    onProceedValidItems: () => {},
    selectedItems: [],
    onEditItems: () => {},
    onEditDefects: () => {},
    onPostIssue: () => {},
    onLinkIssue: () => {},
    onUnlinkIssue: () => {},
    onIgnoreInAA: () => {},
    onIncludeInAA: () => {},
    onDelete: () => {},
    listView: false,
    btsIntegrations: [],
    deleteDisabled: false,
  };

  onClickHistory = () => {
    this.props.tracking.trackEvent(
      this.props.level === LEVEL_STEP
        ? STEP_PAGE_EVENTS.HISTORY_BTN
        : SUITES_PAGE_EVENTS.HISTORY_BTN,
    );
    this.props.navigate({ type: HISTORY_PAGE, payload: this.props.payload });
  };

  onClickRefresh = () => {
    this.props.tracking.trackEvent(
      this.props.level === LEVEL_STEP
        ? STEP_PAGE_EVENTS.REFRESH_BTN
        : SUITES_PAGE_EVENTS.REFRESH_BTN,
    );
    this.props.onRefresh();
  };

  createStepActionDescriptors = () => {
    const {
      intl: { formatMessage },
      tracking,
      debugMode,
      onEditDefects,
      onEditItems,
      onPostIssue,
      onLinkIssue,
      onUnlinkIssue,
      onIgnoreInAA,
      onIncludeInAA,
      onDelete,
      btsIntegrations,
      accountRole,
      projectRole,
    } = this.props;
    const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);

    return [
      {
        label: formatMessage(messages.editItems),
        value: 'action-edit',
        hidden: !canBulkEditLaunches(accountRole, projectRole),
        onClick: onEditItems,
      },
      {
        label: formatMessage(messages.editDefects),
        value: 'action-edit-defects',
        onClick: (data) => {
          tracking.trackEvent(STEP_PAGE_EVENTS.EDIT_DEFECT_ACTION);
          onEditDefects(data);
        },
      },
      {
        label: formatMessage(messages.postIssue),
        value: 'action-post-issue',
        hidden: debugMode,
        disabled: isPostIssueUnavailable,
        title: isPostIssueUnavailable ? formatMessage(COMMON_LOCALE_KEYS.NO_BTS_INTEGRATION) : '',
        onClick: () => {
          tracking.trackEvent(STEP_PAGE_EVENTS.POST_ISSUE_ACTION);
          onPostIssue();
        },
      },
      {
        label: formatMessage(messages.linkIssue),
        value: 'action-link-issue',
        hidden: debugMode,
        disabled: !btsIntegrations.length,
        title: btsIntegrations.length ? '' : formatMessage(COMMON_LOCALE_KEYS.NO_BTS_INTEGRATION),
        onClick: () => {
          tracking.trackEvent(STEP_PAGE_EVENTS.LINK_ISSUE_ACTION);
          onLinkIssue();
        },
      },
      {
        label: formatMessage(messages.unlinkIssue),
        value: 'action-unlink-issue',
        hidden: debugMode,
        onClick: onUnlinkIssue,
      },
      {
        label: formatMessage(messages.ignoreInAA),
        value: 'action-ignore-in-AA',
        hidden: debugMode,
        onClick: onIgnoreInAA,
      },
      {
        label: formatMessage(messages.includeInAA),
        value: 'action-include-into-AA',
        hidden: debugMode,
        onClick: onIncludeInAA,
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        value: 'action-delete',
        onClick: onDelete,
      },
    ];
  };

  createSuiteActionDescriptors = () => {
    const { intl, deleteDisabled, onDelete, onEditItems, accountRole, projectRole } = this.props;

    return [
      {
        label: intl.formatMessage(messages.editItems),
        value: 'action-edit',
        hidden: !canBulkEditLaunches(accountRole, projectRole),
        onClick: onEditItems,
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
        value: 'action-delete',
        hidden: deleteDisabled,
        onClick: onDelete,
      },
    ];
  };

  checkVisibility = (levels) => levels.some((level) => this.props.level === level);

  render() {
    const {
      breadcrumbs,
      restorePath,
      showBreadcrumbs,
      hasErrors,
      intl,
      hasValidItems,
      onProceedValidItems,
      selectedItems,
      listView,
      debugMode,
      level,
    } = this.props;
    const stepActionDescriptors = this.createStepActionDescriptors();
    const suiteActionDescriptors = this.createSuiteActionDescriptors();

    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumbs && !hasErrors })}>
        {showBreadcrumbs && (
          <Breadcrumbs
            togglerEventInfo={level !== LEVEL_STEP ? SUITES_PAGE_EVENTS.PLUS_MINUS_BREADCRUMB : {}}
            breadcrumbEventInfo={
              level !== LEVEL_STEP ? SUITES_PAGE_EVENTS.ITEM_NAME_BREADCRUMB_CLICK : {}
            }
            allEventClick={level !== LEVEL_STEP ? SUITES_PAGE_EVENTS.ALL_LABEL_BREADCRUMB : {}}
            descriptors={breadcrumbs}
            onRestorePath={restorePath}
          />
        )}
        {hasErrors && (
          <GhostButton disabled={!hasValidItems} onClick={onProceedValidItems}>
            {intl.formatMessage(messages.proceedButton)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {this.checkVisibility([LEVEL_STEP]) && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostMenuButton
                title={intl.formatMessage(messages.actionsBtn)}
                items={stepActionDescriptors}
                disabled={!selectedItems.length}
              />
            </div>
          )}
          {this.checkVisibility([LEVEL_SUITE, LEVEL_TEST]) && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostMenuButton
                title={intl.formatMessage(messages.actionsBtn)}
                items={suiteActionDescriptors}
                disabled={!selectedItems.length}
              />
            </div>
          )}
          {!listView &&
            !debugMode && (
              <div className={cx('action-button')}>
                <GhostButton icon={HistoryIcon} onClick={this.onClickHistory}>
                  <FormattedMessage id="ActionPanel.history" defaultMessage="History" />
                </GhostButton>
              </div>
            )}
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={this.onClickRefresh}>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
