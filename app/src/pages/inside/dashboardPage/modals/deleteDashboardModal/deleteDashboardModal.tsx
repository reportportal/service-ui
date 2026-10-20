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

import { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { deleteDashboardAction } from 'controllers/dashboard';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { ModalButtonProps } from 'types/common';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { DashboardItem } from '../../types';
import styles from './deleteDashboardModal.scss';

const cx = createClassnames(styles);

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

const Bold = (chunks: ReactNode) => <b>{chunks}</b>;

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
    dispatch(hideModalAction());
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    variant: 'danger',
    onClick: handleConfirm,
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>
        {formatMessage(messages.description, {
          dashboardName: dashboardItem.name,
          b: Bold,
        })}
      </div>
    </Modal>
  );
};
