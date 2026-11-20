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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { ActionItem } from 'components/actionMenu';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { importantLaunchesEnabledSelector } from 'controllers/appInfo';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { messages } from 'pages/inside/manualLaunchesPage/launchSidePanel/messages';
import { messages as retentionPolicyMessages } from 'pages/inside/manualLaunchesPage/retentionPolicyModal/messages';

interface UseManualLaunchesListRowActionsParams {
  onEdit: () => void;
  onDelete: () => void;
  onChangeRetentionPolicy: () => void;
  retentionPolicy?: string;
}

export const useManualLaunchesListRowActions = ({
  onEdit,
  onDelete,
  onChangeRetentionPolicy,
  retentionPolicy,
}: UseManualLaunchesListRowActionsParams): ActionItem[] => {
  const { formatMessage } = useIntl();
  const { canDeleteLaunch, canEditLaunch } = useUserPermissions();
  const isImportantLaunchesEnabled = useSelector(importantLaunchesEnabledSelector);
  const isImportant = retentionPolicy === RETENTION_POLICY.IMPORTANT;

  return useMemo(
    () => [
      {
        label: formatMessage(messages.editLaunch),
        onClick: onEdit,
        hasPermission: canEditLaunch,
      },
      {
        label: formatMessage(
          isImportant
            ? retentionPolicyMessages.unmarkAsImportantAction
            : retentionPolicyMessages.markAsImportantAction,
        ),
        onClick: onChangeRetentionPolicy,
        hasPermission: canEditLaunch && isImportantLaunchesEnabled,
      },
      {
        label: formatMessage(messages.deleteLaunch),
        onClick: onDelete,
        danger: true,
        hasPermission: canDeleteLaunch,
      },
    ],
    [
      formatMessage,
      onEdit,
      onDelete,
      onChangeRetentionPolicy,
      isImportant,
      isImportantLaunchesEnabled,
      canDeleteLaunch,
      canEditLaunch,
    ],
  );
};
