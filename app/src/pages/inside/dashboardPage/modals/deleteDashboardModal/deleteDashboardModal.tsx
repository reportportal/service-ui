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

import { useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import { deleteDashboardAction } from 'controllers/dashboard';
import { BoldText } from 'components/boldText';
import { DeleteConfirmationModal } from 'components/deleteConfirmationModal';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { DashboardItem } from '../../types';

const messages = defineMessages({
  title: {
    id: 'DeleteDashboardModal.title',
    defaultMessage: 'Delete Dashboard',
  },
  description: {
    id: 'DeleteDashboardModal.description',
    defaultMessage:
      'Are you sure you want to delete the dashboard <b>{dashboardName}</b>? This irreversible action will also delete any widgets that were created and configured inside.',
  },
});

interface DeleteDashboardModalProps {
  dashboardItem: DashboardItem;
}

export const DeleteDashboardModal = ({ dashboardItem }: DeleteDashboardModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const handleConfirm = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnButtonDeleteInModalDeleteDashboard(dashboardItem.id));
    dispatch(deleteDashboardAction(dashboardItem));
  };

  return (
    <DeleteConfirmationModal
      title={formatMessage(messages.title)}
      description={formatMessage(messages.description, {
        dashboardName: dashboardItem.name,
        b: BoldText,
      })}
      onConfirm={handleConfirm}
    />
  );
};
