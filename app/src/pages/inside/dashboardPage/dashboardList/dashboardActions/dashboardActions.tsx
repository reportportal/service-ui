/*
 * Copyright 2025 EPAM Systems
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

import { useState } from 'react';
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { MeatballMenuIcon } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { createClassnames, fetch, copyToClipboard } from 'common/utils';
import { useCanLockDashboard } from 'common/hooks/useCanLockDashboard';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { activeProjectKeySelector } from 'controllers/user';
import { showDefaultErrorNotification, showSuccessNotification } from 'controllers/notification';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { ActionMenu, ActionItem } from 'components/actionMenu';

import { DashboardActionHandlers, DashboardItem } from '../../types';
import { messages } from '../dashboardTable/messages';

import styles from './dashboardActions.scss';

const cx = createClassnames(styles);

interface DashboardActionsProps extends DashboardActionHandlers {
  item: DashboardItem;
}

export const DashboardActions = ({
  item,
  onEdit = noop,
  onDelete = noop,
  onDuplicate = noop,
}: DashboardActionsProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const { canWorkWithDashboard } = useUserPermissions();
  const canLock = useCanLockDashboard();

  // The promise should be stored in state to prevent losing document focus (causes errors) in Safari when clicking to copy
  const [dashboardConfigPromise, setDashboardConfigPromise] = useState<Promise<unknown> | null>(
    null,
  );

  const { id, locked } = item;
  const canModify = canWorkWithDashboard && !(locked && !canLock);

  const fetchDashboardConfig = () => {
    const configPromise = fetch(URLS.dashboardConfig(activeProjectKey, id));

    // the promise may stay unused if the user never copies the config
    configPromise.catch(noop);

    return configPromise;
  };

  const prefetchDashboardConfig = () => {
    if (dashboardConfigPromise === null) {
      setDashboardConfigPromise(fetchDashboardConfig());
    }
  };

  const handleTriggerClick = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('duplicate', id));
  };

  const handleDuplicate = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnDuplicateMenuOption('duplicate'));
    onDuplicate(item);
  };

  const copyConfig = async () => {
    try {
      // the menu can be reopened without leaving the wrapper, then there is no prefetched promise
      const config = await (dashboardConfigPromise ?? fetchDashboardConfig());

      await copyToClipboard(JSON.stringify(config));
      dispatch(showSuccessNotification({ messageId: 'dashboardConfigurationCopied' }));
    } catch (error) {
      dispatch(showDefaultErrorNotification(error as Error));
    }

    setDashboardConfigPromise(null);
  };

  const handleCopyConfig = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnDuplicateMenuOption('copy_dashboard'));
    void copyConfig();
  };

  const handleEdit = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', id));
    onEdit(item);
  };

  const handleDelete = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', id));
    onDelete(item);
  };

  const actions: ActionItem[] = [
    {
      label: formatMessage(messages.duplicate),
      onClick: handleDuplicate,
      hasPermission: canWorkWithDashboard,
    },
    { label: formatMessage(messages.copyConfig), onClick: handleCopyConfig },
    { label: formatMessage(messages.edit), onClick: handleEdit, hasPermission: canModify },
    {
      label: formatMessage(messages.deleteDashboard),
      onClick: handleDelete,
      danger: true,
      hasPermission: canModify,
    },
  ];

  return (
    <div
      className={cx('dashboard-actions')}
      onMouseEnter={prefetchDashboardConfig}
      onFocus={prefetchDashboardConfig}
    >
      <ActionMenu
        actions={actions}
        className={cx('dashboard-actions__popover')}
        trigger={
          <button
            type="button"
            className={cx('dashboard-actions__trigger')}
            aria-label={formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
            onClick={handleTriggerClick}
          >
            <MeatballMenuIcon />
          </button>
        }
      />
    </div>
  );
};
