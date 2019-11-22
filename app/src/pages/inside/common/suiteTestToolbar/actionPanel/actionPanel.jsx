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
import { injectIntl, FormattedMessage } from 'react-intl';
import { breadcrumbsSelector, levelSelector, restorePathAction } from 'controllers/testItem';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { historyPageLinkSelector } from 'controllers/itemsHistory';
import {
  availableBtsIntegrationsSelector,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events/suitesPageEvents';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { LEVEL_STEP, LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { canBulkEditItems } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import RefreshIcon from 'common/img/refresh-inline.svg';
import HistoryIcon from 'common/img/history-inline.svg';
import { createStepActionDescriptors } from 'pages/inside/common/utils';
import styles from './actionPanel.scss';

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
    historyPageLink: historyPageLinkSelector(state),
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
    historyPageLink: PropTypes.object.isRequired,
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
  };

  onClickHistory = () => {
    this.props.tracking.trackEvent(
      this.props.level === LEVEL_STEP
        ? STEP_PAGE_EVENTS.HISTORY_BTN
        : SUITES_PAGE_EVENTS.HISTORY_BTN,
    );
    this.props.navigate(this.props.historyPageLink);
  };

  onClickRefresh = () => {
    this.props.tracking.trackEvent(
      this.props.level === LEVEL_STEP
        ? STEP_PAGE_EVENTS.REFRESH_BTN
        : SUITES_PAGE_EVENTS.REFRESH_BTN,
    );
    this.props.onRefresh();
  };

  onEditDefects = (data) => {
    const { tracking, onEditDefects } = this.props;
    tracking.trackEvent(STEP_PAGE_EVENTS.EDIT_DEFECT_ACTION);
    onEditDefects(data);
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
      debugMode,
      level,
    } = this.props;
    const stepActionDescriptors = this.getStepActionDescriptors();
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
            {intl.formatMessage(COMMON_LOCALE_KEYS.PROCEED_VALID_ITEMS)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {this.checkVisibility([LEVEL_STEP]) && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostMenuButton
                title={intl.formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
                items={stepActionDescriptors}
                disabled={!selectedItems.length}
              />
            </div>
          )}
          {this.checkVisibility([LEVEL_SUITE, LEVEL_TEST]) && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostMenuButton
                title={intl.formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
                items={suiteActionDescriptors}
                disabled={!selectedItems.length}
              />
            </div>
          )}
          {!debugMode && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostButton
                disabled={!!selectedItems.length}
                icon={HistoryIcon}
                onClick={this.onClickHistory}
              >
                <FormattedMessage id="ActionPanel.history" defaultMessage="History" />
              </GhostButton>
            </div>
          )}
          <div className={cx('action-button')}>
            <GhostButton
              disabled={!!selectedItems.length}
              icon={RefreshIcon}
              onClick={this.onClickRefresh}
            >
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
