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
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { canBulkEditItems } from 'common/utils/permissions';
import { CUSTOMER } from 'common/constants/projectRoles';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE } from 'components/integrations/messages';
import { withTooltip } from 'componentLibrary/tooltip';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { IMPORT_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import AddWidgetIcon from 'common/img/add-widget-inline.svg';
import ImportIcon from 'common/img/import-inline.svg';
import { createExternalLink, docsReferences } from 'common/utils';
import RefreshIcon from './img/refresh-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  proceedButton: {
    id: 'ActionPanel.proceedButton',
    defaultMessage: 'Proceed Valid Items',
  },
  actionsBtnTooltip: {
    id: 'ActionPanel.actionsBtnTooltip',
    defaultMessage: ' Select several items to processing',
  },
});

const DisabledImportButton = () => (
  <GhostButton disabled icon={ImportIcon} transparentBackground>
    <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
  </GhostButton>
);

const DisabledImportButtonTooltip = ({ tooltip }) => <span>{tooltip}</span>;
DisabledImportButtonTooltip.propTypes = {
  tooltip: PropTypes.string.isRequired,
};

// fixme may be use popup instead tooltip? and convert string to html
const DisabledImportButtonWithTooltip = withTooltip({
  ContentComponent: DisabledImportButtonTooltip,
  side: 'bottom',
  noArrow: false,
  tooltipWrapperClassName: cx('tooltip-wrapper'),
})(DisabledImportButton);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
  }),
  {
    restorePath: restorePathAction,
  },
)
@injectIntl
@track()
export class ActionPanel extends Component {
  static propTypes = {
    debugMode: PropTypes.bool,
    onRefresh: PropTypes.func,
    selectedLaunches: PropTypes.array,
    hasErrors: PropTypes.bool,
    showBreadcrumb: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    onImportLaunch: PropTypes.func,
    hasValidItems: PropTypes.bool,
    accountRole: PropTypes.string,
    projectRole: PropTypes.string.isRequired,
    onProceedValidItems: PropTypes.func,
    onEditItem: PropTypes.func,
    onEditItems: PropTypes.func,
    onMerge: PropTypes.func,
    onCompare: PropTypes.func,
    onMove: PropTypes.func,
    onForceFinish: PropTypes.func,
    onDelete: PropTypes.func,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    restorePath: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onAddNewWidget: PropTypes.func,
    finishedLaunchesCount: PropTypes.number,
    importPlugins: PropTypes.array.isRequired,
  };

  static defaultProps = {
    debugMode: false,
    onRefresh: () => {},
    selectedLaunches: [],
    hasErrors: false,
    showBreadcrumb: false,
    onImportLaunch: () => {},
    hasValidItems: false,
    onProceedValidItems: () => {},
    onEditItem: () => {},
    onEditItems: () => {},
    onMerge: () => {},
    onCompare: () => {},
    onMove: () => {},
    onForceFinish: () => {},
    onDelete: () => {},
    breadcrumbs: [],
    restorePath: () => {},
    activeFilterId: null,
    onAddNewWidget: () => {},
    finishedLaunchesCount: null,
    accountRole: '',
  };

  onClickActionButton = () =>
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ACTIONS_BTN);

  createActionDescriptors = () => {
    const {
      intl,
      debugMode,
      onMerge,
      onCompare,
      onMove,
      onForceFinish,
      onDelete,
      accountRole,
      projectRole,
      onEditItems,
      onEditItem,
      selectedLaunches,
    } = this.props;

    return [
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.EDIT),
        value: 'action-bulk-edit',
        hidden: debugMode || !canBulkEditItems(accountRole, projectRole),
        onClick: () => {
          selectedLaunches.length > 1
            ? onEditItems(selectedLaunches)
            : onEditItem(selectedLaunches[0]);
          this.props.tracking.trackEvent(
            LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('edit'),
          );
        },
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.MERGE),
        value: 'action-merge',
        hidden: debugMode,
        onClick: () => {
          onMerge();
          this.props.tracking.trackEvent(
            LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('merge'),
          );
        },
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.COMPARE),
        value: 'action-compare',
        hidden: debugMode,
        onClick: () => {
          onCompare();
          this.props.tracking.trackEvent(
            LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('compare'),
          );
        },
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG),
        value: 'action-move-to-debug',
        hidden: debugMode || projectRole === CUSTOMER,
        onClick: () => {
          onMove();
          this.props.tracking.trackEvent(
            LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('move_to_debug'),
          );
        },
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES),
        value: 'action-move-to-all',
        hidden: !debugMode,
        onClick: onMove,
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH),
        value: 'action-force-finish',
        onClick: () => {
          onForceFinish();
          this.props.tracking.trackEvent(
            LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('force_finish'),
          );
        },
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
        value: 'action-delete',
        onClick: () => {
          onDelete();
          this.props.tracking.trackEvent(
            LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('delete'),
          );
        },
      },
    ];
  };
  isShowImportButton = () => {
    const { debugMode, activeFilterId } = this.props;
    return !debugMode && !Number.isInteger(activeFilterId);
  };

  isShowWidgetButton = () => {
    const { activeFilterId } = this.props;
    return Number.isInteger(activeFilterId);
  };

  renderCounterNotification = (number) => <span className={cx('counter')}>{number}</span>;

  render() {
    const {
      intl,
      showBreadcrumb,
      onRefresh,
      hasErrors,
      selectedLaunches,
      hasValidItems,
      onProceedValidItems,
      onImportLaunch,
      breadcrumbs,
      restorePath,
      onAddNewWidget,
      finishedLaunchesCount,
      importPlugins,
    } = this.props;
    const actionDescriptors = this.createActionDescriptors();
    const isImportPluginEnabled = importPlugins.length > 0;
    const importPluginDisabledMessage = PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE[IMPORT_GROUP_TYPE];

    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumb && !hasErrors })}>
        {showBreadcrumb && (
          <Breadcrumbs
            descriptors={breadcrumbs}
            onRestorePath={restorePath}
            togglerEventInfo={LAUNCHES_PAGE_EVENTS.getClickOnPlusMinusBreadcrumbEvent}
          />
        )}
        {hasErrors && (
          <GhostButton disabled={!hasValidItems} onClick={onProceedValidItems}>
            {intl.formatMessage(messages.proceedButton)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {this.isShowImportButton() && (
            <div className={cx('action-button', 'mobile-hidden')}>
              {isImportPluginEnabled ? (
                <GhostButton icon={ImportIcon} onClick={onImportLaunch} transparentBackground>
                  <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
                </GhostButton>
              ) : (
                <DisabledImportButtonWithTooltip
                  tooltip={intl.formatMessage(importPluginDisabledMessage, {
                    name: 'Import',
                    a: (data) => createExternalLink(data, docsReferences.pluginsDocs),
                  })}
                />
              )}
            </div>
          )}
          {this.isShowWidgetButton() && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostButton icon={AddWidgetIcon} onClick={onAddNewWidget}>
                <FormattedMessage id="LaunchesPage.addNewWidget" defaultMessage="Add new widget" />
              </GhostButton>
            </div>
          )}
          <div className={cx('action-button', 'tablet-hidden')}>
            <GhostMenuButton
              tooltip={
                !selectedLaunches.length ? intl.formatMessage(messages.actionsBtnTooltip) : null
              }
              title={intl.formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
              items={actionDescriptors}
              disabled={!selectedLaunches.length}
              onClick={this.onClickActionButton}
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton
              disabled={!!selectedLaunches.length}
              icon={RefreshIcon}
              onClick={onRefresh}
              transparentBackground
            >
              <FormattedMessage id="LaunchesPage.refresh" defaultMessage="Refresh" />
            </GhostButton>
            {finishedLaunchesCount && this.renderCounterNotification(finishedLaunchesCount)}
          </div>
        </div>
      </div>
    );
  }
}
