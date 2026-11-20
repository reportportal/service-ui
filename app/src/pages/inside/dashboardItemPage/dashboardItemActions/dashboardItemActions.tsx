/*
 * Copyright 2026 EPAM Systems
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
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { Button, MaximizeIcon, MeatballMenuIcon, PlusIcon, Toggle } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useCanLockDashboard } from 'common/hooks';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { ActionMenu, ActionItem } from 'components/actionMenu';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';

import { messages } from '../messages';

import styles from './dashboardItemActions.scss';

const cx = createClassnames(styles);

interface DashboardItemActionsProps {
  locked?: boolean;
  isEmpty?: boolean;
  fullWidthMode?: boolean;
  onToggleFullWidthMode?: () => void;
  onFullScreen?: () => void;
  onAddWidget?: () => void;
  onToggleLock?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
  onDelete?: () => void;
}

export const DashboardItemActions = ({
  locked = false,
  isEmpty = false,
  fullWidthMode = false,
  onToggleFullWidthMode = noop,
  onFullScreen = noop,
  onAddWidget = noop,
  onToggleLock = noop,
  onEdit = noop,
  onPrint = noop,
  onDelete = noop,
}: DashboardItemActionsProps) => {
  const { formatMessage } = useIntl();
  const { canWorkWithWidgets } = useUserPermissions();
  const canLock = useCanLockDashboard();
  const isModificationDisabled = locked && !canLock;
  const canModify = canWorkWithWidgets && !isModificationDisabled;

  const actions: ActionItem[] = [
    { label: formatMessage(messages.print), onClick: onPrint },
    {
      label: formatMessage(locked ? messages.unlockDashboard : messages.lockDashboard),
      onClick: onToggleLock,
      hasPermission: canLock,
    },
    { label: formatMessage(messages.editDashboard), onClick: onEdit, hasPermission: canModify },
    {
      label: formatMessage(messages.deleteDashboard),
      onClick: onDelete,
      danger: true,
      hasPermission: canModify,
    },
  ];

  return (
    <div className={cx('dashboard-item-actions')}>
      {!isEmpty && (
        <div className={cx('dashboard-item-actions__view')}>
          <Toggle value={fullWidthMode} className={cx('toggle')} onChange={onToggleFullWidthMode}>
            <span className={cx('toggle-label')}>{formatMessage(messages.fullWidthMode)}</span>
          </Toggle>
          <Button
            variant="text"
            adjustWidthOn="content"
            className={cx('full-screen-button')}
            icon={<MaximizeIcon />}
            data-automation-id="dashboardFullScreenButton"
            onClick={onFullScreen}
          >
            {formatMessage(messages.fullScreen)}
          </Button>
        </div>
      )}
      <div className={cx('dashboard-item-actions__edit')}>
        <ActionMenu
          actions={actions}
          className={cx('actions-popover')}
          trigger={
            <Button
              variant="ghost"
              className={cx('menu-button')}
              icon={<MeatballMenuIcon />}
              data-automation-id="dashboardActionsButton"
            />
          }
        />
        {!isEmpty && canWorkWithWidgets && (
          <LockedDashboardTooltip locked={locked}>
            <Button
              className={cx('add-widget-button')}
              icon={<PlusIcon />}
              disabled={isModificationDisabled}
              data-automation-id="addNewWidgetButton"
              onClick={onAddWidget}
            >
              {formatMessage(messages.addNewWidget)}
            </Button>
          </LockedDashboardTooltip>
        )}
      </div>
    </div>
  );
};
