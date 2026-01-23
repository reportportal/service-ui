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
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { breadcrumbsSelector, levelSelector, restorePathAction } from 'controllers/testItem';
import { userRolesSelector } from 'controllers/pages';
import {
  availableBtsIntegrationsSelector,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { LEVEL_STEP } from 'common/constants/launchLevels';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { createStepActionDescriptors } from 'pages/inside/common/utils';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { pageEventsMap } from 'components/main/analytics';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import styles from './testItemActionPanel.scss';

const cx = classNames.bind(styles);

export const TestItemActionPanel = ({
  debugMode,
  onRefresh,
  showBreadcrumbs,
  hasErrors,
  hasValidItems,
  onProceedValidItems,
  selectedItems,
  onEditItems,
  onEditDefects,
  onPostIssue,
  onLinkIssue,
  onUnlinkIssue,
  onIgnoreInAA,
  onIncludeInAA,
  onDelete,
  deleteDisabled,
  parentItem,
}) => {
  const breadcrumbs = useSelector(breadcrumbsSelector);
  const level = useSelector(levelSelector);
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const userRoles = useSelector(userRolesSelector);
  const { canManageLaunches, canWorkWithTests } = useUserPermissions();
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const onClickRefresh = () => {
    trackEvent(pageEventsMap[level].CLICK_REFRESH_BTN);
    onRefresh();
  };

  const handleEditDefects = () => {
    if (!hasErrors) {
      const defectFromTIGroup =
        selectedItems.length > 1 && selectedItems.some(({ issue }) => issue)
          ? undefined
          : selectedItems[0].issue?.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

      trackEvent(
        pageEventsMap[level].MAKE_DECISION_MODAL_EVENTS.getOpenModalEvent(
          defectFromTIGroup,
          'actions',
        ),
      );
    }

    onEditDefects(selectedItems);
  };

  const handlePostIssue = () => {
    trackEvent(STEP_PAGE_EVENTS.POST_ISSUE_ACTION);
    onPostIssue();
  };

  const handleLinkIssue = () => {
    trackEvent(STEP_PAGE_EVENTS.LINK_ISSUE_ACTION);
    onLinkIssue();
  };

  const getStepActionDescriptors = () => {
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
      userRoles,
      selectedItems,
      onEditDefects: handleEditDefects,
      onPostIssue: handlePostIssue,
      onLinkIssue: handleLinkIssue,
    });
  };

  const createSuiteActionDescriptors = () => [
    {
      label: formatMessage(COMMON_LOCALE_KEYS.EDIT_ITEMS),
      value: 'action-edit',
      hidden: !canManageLaunches,
      onClick: onEditItems,
    },
    {
      label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      value: 'action-delete',
      hidden: deleteDisabled,
      onClick: onDelete,
    },
  ];

  const onClickActionsButton = () => {
    trackEvent(pageEventsMap[level].CLICK_ACTIONS_BTN);
  };

  const actionDescriptors =
    level === LEVEL_STEP ? getStepActionDescriptors() : createSuiteActionDescriptors();

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
          onRestorePath={() => dispatch(restorePathAction())}
        />
      )}
      {hasErrors && (
        <GhostButton disabled={!hasValidItems} onClick={onProceedValidItems} transparentBackground>
          {formatMessage(COMMON_LOCALE_KEYS.PROCEED_VALID_ITEMS)}
        </GhostButton>
      )}
      <div className={cx('action-buttons')}>
        {parentItem && <ParentInfo parentItem={parentItem} />}
        {canWorkWithTests && (
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostMenuButton
              title={formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
              items={actionDescriptors}
              disabled={!selectedItems.length}
              onClick={onClickActionsButton}
            />
          </div>
        )}
        <div className={cx('action-button')}>
          <GhostButton
            disabled={!!selectedItems.length}
            icon={RefreshIcon}
            onClick={onClickRefresh}
            transparentBackground
          >
            <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
          </GhostButton>
        </div>
      </div>
    </div>
  );
};

TestItemActionPanel.propTypes = {
  debugMode: PropTypes.bool,
  onRefresh: PropTypes.func,
  showBreadcrumbs: PropTypes.bool,
  hasErrors: PropTypes.bool,
  hasValidItems: PropTypes.bool,
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
  deleteDisabled: PropTypes.bool,
  parentItem: PropTypes.object,
};

TestItemActionPanel.defaultProps = {
  debugMode: false,
  onRefresh: () => {},
  showBreadcrumbs: true,
  hasErrors: false,
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
  deleteDisabled: false,
  parentItem: null,
};
