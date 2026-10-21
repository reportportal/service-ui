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

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PlusIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useCanLockDashboard } from 'common/hooks';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';

import { ActiveDashboardItem } from '../../../dashboardPage/types';
import { messages } from '../../messages';

import styles from './emptyWidgetGrid.scss';

const cx = createClassnames(styles);

interface EmptyWidgetGridProps {
  action?: () => void;
  isDisable?: boolean;
}

export const EmptyWidgetGrid = ({ action, isDisable = false }: EmptyWidgetGridProps) => {
  const { formatMessage } = useIntl();
  const { canWorkWithWidgets } = useUserPermissions();
  const canLock = useCanLockDashboard();
  const dashboard = useSelector(activeDashboardItemSelector) as ActiveDashboardItem;
  const isButtonDisabled = dashboard?.locked && !canLock;

  const buttons = canWorkWithWidgets
    ? [
        {
          name: formatMessage(messages.addNewWidget),
          dataAutomationId: 'emptyStateAddWidgetButton',
          isCompact: true,
          isDisabled: isButtonDisabled,
          icon: <PlusIcon />,
          handleButton: action,
        },
      ]
    : [];

  return (
    <div className={cx('empty-widget-grid')}>
      <EmptyStatePage
        title={formatMessage(messages.emptyHeadline)}
        description={
          isDisable
            ? ''
            : formatMessage(canWorkWithWidgets ? messages.emptyText : messages.emptyTextViewer)
        }
        imageType="widgets"
        buttons={isDisable ? [] : buttons}
      />
    </div>
  );
};
