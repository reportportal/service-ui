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

import React from 'react';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { canBulkEditItems } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { isImportPluginsAvailableSelector } from 'controllers/plugins';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE } from 'components/integrations/messages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { IMPORT_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import AddWidgetIcon from 'common/img/add-widget-inline.svg';
import ImportIcon from 'common/img/import-inline.svg';
import { canWorkWithWidgets } from 'common/utils/permissions/permissions';
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

function DisabledImportButton() {
  return (
    <GhostButton disabled icon={ImportIcon} transparentBackground>
      <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
    </GhostButton>
  );
}

const DisabledImportButtonWithTooltip = withHoverableTooltip({
  TooltipComponent: TextTooltip,
  data: {
    placement: 'bottom',
  },
})(DisabledImportButton);

export function ActionPanel({
  debugMode,
  onRefresh,
  selectedLaunches,
  hasErrors,
  showBreadcrumb,
  onImportLaunch,
  hasValidItems,
  onProceedValidItems,
  onEditItem,
  onEditItems,
  onMerge,
  onCompare,
  onMove,
  onForceFinish,
  onDelete,
  activeFilterId,
  onAddNewWidget,
  finishedLaunchesCount,
}) {
  const breadcrumbs = useSelector(breadcrumbsSelector);
  const userRoles = useSelector(userRolesSelector);
  const isImportPluginsAvailable = useSelector(isImportPluginsAvailableSelector);
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const isShowWidgetButton = Number.isInteger(activeFilterId) && canWorkWithWidgets(userRoles);
  const canManageActions = canBulkEditItems(userRoles);
  const isShowImportButton = canManageActions && !debugMode && !Number.isInteger(activeFilterId);
  const onClickActionButton = () => trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ACTIONS_BTN);

  const createActionDescriptors = () => {
    return [
      {
        label: formatMessage(COMMON_LOCALE_KEYS.EDIT),
        value: 'action-bulk-edit',
        hidden: debugMode || !canManageActions,
        onClick: () => {
          selectedLaunches.length > 1
            ? onEditItems(selectedLaunches)
            : onEditItem(selectedLaunches[0]);
          trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('edit'));
        },
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.MERGE),
        value: 'action-merge',
        hidden: debugMode || !canManageActions,
        onClick: () => {
          onMerge();
          trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('merge'));
        },
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.COMPARE),
        value: 'action-compare',
        hidden: debugMode,
        onClick: () => {
          onCompare();
          trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('compare'));
        },
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG),
        value: 'action-move-to-debug',
        hidden: debugMode || !canManageActions,
        onClick: () => {
          onMove();
          trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('move_to_debug'));
        },
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES),
        value: 'action-move-to-all',
        hidden: !debugMode,
        onClick: onMove,
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH),
        value: 'action-force-finish',
        hidden: !canManageActions,
        onClick: () => {
          onForceFinish();
          trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('force_finish'));
        },
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        value: 'action-delete',
        hidden: !canManageActions,
        onClick: () => {
          onDelete();
          trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnListOfActionsButtonEvent('delete'));
        },
      },
    ];
  };

  const renderCounterNotification = (number) => <span className={cx('counter')}>{number}</span>;

  const importPluginDisabledMessage = PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE[IMPORT_GROUP_TYPE];

  return (
    <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumb && !hasErrors })}>
      {showBreadcrumb && (
        <Breadcrumbs
          descriptors={breadcrumbs}
          onRestorePath={() => dispatch(restorePathAction())}
          togglerEventInfo={LAUNCHES_PAGE_EVENTS.getClickOnPlusMinusBreadcrumbEvent}
        />
      )}
      {hasErrors && (
        <GhostButton disabled={!hasValidItems} onClick={onProceedValidItems}>
          {formatMessage(messages.proceedButton)}
        </GhostButton>
      )}
      <div className={cx('action-buttons')}>
        {isShowImportButton && (
          <div className={cx('action-button', 'mobile-hidden')}>
            {isImportPluginsAvailable ? (
              <GhostButton icon={ImportIcon} onClick={onImportLaunch} transparentBackground>
                <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
              </GhostButton>
            ) : (
              <DisabledImportButtonWithTooltip
                tooltipContent={formatMessage(importPluginDisabledMessage, {
                  name: 'Import',
                  a: (data) => createExternalLink(data, docsReferences.pluginsDocs),
                })}
                className={cx('no-import-message')}
                preventTargetSanitizing
              />
            )}
          </div>
        )}
        {isShowWidgetButton && (
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostButton icon={AddWidgetIcon} onClick={onAddNewWidget}>
              <FormattedMessage id="LaunchesPage.addNewWidget" defaultMessage="Add new widget" />
            </GhostButton>
          </div>
        )}
        {(canManageActions || !debugMode) && (
          <div className={cx('action-button', 'tablet-hidden')}>
            <GhostMenuButton
              tooltip={!selectedLaunches.length ? formatMessage(messages.actionsBtnTooltip) : null}
              title={formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
              items={createActionDescriptors()}
              disabled={!selectedLaunches.length}
              onClick={onClickActionButton}
            />
          </div>
        )}
        <div className={cx('action-button')}>
          <GhostButton
            disabled={!!selectedLaunches.length}
            icon={RefreshIcon}
            onClick={onRefresh}
            transparentBackground
          >
            <FormattedMessage id="LaunchesPage.refresh" defaultMessage="Refresh" />
          </GhostButton>
          {finishedLaunchesCount && renderCounterNotification(finishedLaunchesCount)}
        </div>
      </div>
    </div>
  );
}

ActionPanel.propTypes = {
  debugMode: PropTypes.bool,
  onRefresh: PropTypes.func,
  selectedLaunches: PropTypes.array,
  hasErrors: PropTypes.bool,
  showBreadcrumb: PropTypes.bool,
  onImportLaunch: PropTypes.func,
  hasValidItems: PropTypes.bool,
  onProceedValidItems: PropTypes.func,
  onEditItem: PropTypes.func,
  onEditItems: PropTypes.func,
  onMerge: PropTypes.func,
  onCompare: PropTypes.func,
  onMove: PropTypes.func,
  onForceFinish: PropTypes.func,
  onDelete: PropTypes.func,
  activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAddNewWidget: PropTypes.func,
  finishedLaunchesCount: PropTypes.number,
};

ActionPanel.defaultProps = {
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
  activeFilterId: null,
  onAddNewWidget: () => {},
  finishedLaunchesCount: null,
};
