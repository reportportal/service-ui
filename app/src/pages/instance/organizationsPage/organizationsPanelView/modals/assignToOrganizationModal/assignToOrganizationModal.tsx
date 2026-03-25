/*!
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
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalButtonProps } from 'types/common';
import { Organization } from 'controllers/organization';
import { assignToOrganizationAction } from 'controllers/organization/users';
import { fetchUserInfoAction } from 'controllers/user';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { messages } from 'pages/instance/organizationsPage/messages';

import styles from './assignToOrganizationModal.scss';

const cx = createClassnames(styles);

interface AssignToOrganizationModalProps {
  organization: Organization;
  onAssign?: () => void;
}

export const AssignToOrganizationModal = ({
  organization,
  onAssign,
}: AssignToOrganizationModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const handleAssignSuccess = () => {
    dispatch(fetchUserInfoAction());
    dispatch(hideModalAction());
    onAssign?.();
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(messages.assignToOrganization),
    onClick: () => {
      dispatch(assignToOrganizationAction(organization, handleAssignSuccess));
      trackEvent(ORGANIZATION_PAGE_EVENTS.CLICK_ASSIGN_BUTTON);
    },
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.assignToOrganizationModalTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>
        {formatMessage(messages.assignToOrganizationModalDescription, {
          organizationName: organization.name,
          b: (data) => <b>{data}</b>,
        })}
      </div>
    </Modal>
  );
};
