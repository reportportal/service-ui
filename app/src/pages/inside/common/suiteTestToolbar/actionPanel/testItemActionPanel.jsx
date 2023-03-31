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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { breadcrumbsSelector, levelSelector, restorePathAction } from 'controllers/testItem';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import {
  availableBtsIntegrationsSelector,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { LEVEL_STEP } from 'common/constants/launchLevels';
import { canBulkEditItems } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { createStepActionDescriptors } from 'pages/inside/common/utils';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { pageEventsMap } from 'components/main/analytics';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import styles from './testItemActionPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    level: levelSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
    isBtsPluginsExist: isBtsPluginsExistSelector(state),
    enabledBtsPlugins: enabledBtsPluginsSelector(state),
  }),
  {
    restorePath: restorePathAction,
    navigate: (linkAction) => linkAction,
  },
)
@injectIntl
@track()
export class TestItemActionPanel extends Component {
  static propTypes = {
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
    btsIntegrations: PropTypes.array,
    deleteDisabled: PropTypes.bool,
    navigate: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isBtsPluginsExist: PropTypes.bool,
    enabledBtsPlugins: PropTypes.array,
    parentItem: PropTypes.object,
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
    btsIntegrations: [],
    deleteDisabled: false,
    isBtsPluginsExist: false,
    enabledBtsPlugins: [],
    parentItem: null,
  };

  onClickRefresh = () => {
    this.props.tracking.trackEvent(pageEventsMap[this.props.level].CLICK_REFRESH_BTN);
    this.props.onRefresh();
  };

  onEditDefects = () => {
    const { tracking, selectedItems, onEditDefects, hasErrors } = this.props;
    if (!hasErrors) {
      const defectFromTIGroup =
        selectedItems.length > 1 && selectedItems.some(({ issue }) => issue)
          ? undefined
          : selectedItems[0].issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);
      tracking.trackEvent(
        pageEventsMap[this.props.level].MAKE_DECISION_MODAL_EVENTS.openModal(
          defectFromTIGroup,
          'ActionMenu',
        ),
      );
    }
    onEditDefects(this.props.selectedItems);
  };

  onPostIssue = () => {
    const { tracking, onPostIssue } = this.props;
    tracking.trackEvent(STEP_PAGE_EVENTS.POST_ISSUE_ACTION);
    onPostIssue();
  };

  onLinkIssue = () => {
    const { tracking, onLinkIssue } = this.props;
    tracking.trackEvent(STEP_PAGE_EVENTS.LINK_ISSUE_ACTION);
    onLinkIssue();
  };

  getStepActionDescriptors = () => {
    const {
      intl: { formatMessage },
      debugMode,
      onEditItems,
      onUnlinkIssue,
      onIgnoreInAA,
      onIncludeInAA,
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
      debugMode,
      onEditItems,
      onUnlinkIssue,
      onIgnoreInAA,
      onIncludeInAA,
      onDelete,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      accountRole,
      projectRole,
      selectedItems,
      onEditDefects: this.onEditDefects,
      onPostIssue: this.onPostIssue,
      onLinkIssue: this.onLinkIssue,
    });
  };

  createSuiteActionDescriptors = () => {
    const { intl, deleteDisabled, onDelete, onEditItems, accountRole, projectRole } = this.props;

    return [
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.EDIT_ITEMS),
        value: 'action-edit',
        hidden: !canBulkEditItems(accountRole, projectRole),
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

  onClickActionsButton = () => {
    const { tracking, level } = this.props;
    tracking.trackEvent(pageEventsMap[level].CLICK_ACTIONS_BTN);
  };

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
      level,
      parentItem,
    } = this.props;
    const actionDescriptors =
      level === LEVEL_STEP ? this.getStepActionDescriptors() : this.createSuiteActionDescriptors();

    return (
      <div
        className={cx('test-item-action-panel', {
          'right-buttons-only': !showBreadcrumbs && !hasErrors,
        })}
      >
        {showBreadcrumbs && (
          <Breadcrumbs
            togglerEventInfo={pageEventsMap[level].getClickOnPlusMinusBreadcrumbEvent}
            breadcrumbEventInfo={pageEventsMap[level].CLICK_ITEM_NAME_BREADCRUMB}
            allEventClick={pageEventsMap[level].CLICK_ALL_LABEL_BREADCRUMB}
            descriptors={breadcrumbs}
            onRestorePath={restorePath}
          />
        )}
        {hasErrors && (
          <GhostButton
            disabled={!hasValidItems}
            onClick={onProceedValidItems}
            transparentBackground
          >
            {intl.formatMessage(COMMON_LOCALE_KEYS.PROCEED_VALID_ITEMS)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {parentItem && <ParentInfo parentItem={parentItem} />}
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostMenuButton
              title={intl.formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
              items={actionDescriptors}
              disabled={!selectedItems.length}
              onClick={this.onClickActionsButton}
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton
              disabled={!!selectedItems.length}
              icon={RefreshIcon}
              onClick={this.onClickRefresh}
              transparentBackground
            >
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
