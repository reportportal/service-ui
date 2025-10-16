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
import { useDispatch, useSelector } from 'react-redux';
import { useIntl, MessageDescriptor } from 'react-intl';
import { Modal, Button, Tooltip } from '@reportportal/ui-kit';
import { useTracking } from 'react-tracking';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { UserInfo, idSelector } from 'controllers/user';
import { unassignFromOrganizationAction } from 'controllers/organization/users';
import { Organization, OrganizationType } from 'controllers/organization';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { UPSA } from 'common/constants/accountType';

import { useHandleUnassignSuccess } from '..';

import styles from './manageAssignmentsOrganizationModal.scss';

const cx = createClassnames(styles);

interface ManageAssignmentsOrganizationModalProps {
  user: UserInfo;
  organization: Organization;
  onUnassign?: () => void;
}

export const ManageAssignmentsOrganizationModal = ({
  user,
  organization,
  onUnassign,
}: ManageAssignmentsOrganizationModalProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const currentUserId = useSelector(idSelector) as number;
  const [showUnassignConfirmation, setShowUnassignConfirmation] = useState(false);
  const handleUnassignSuccess = useHandleUnassignSuccess(user, onUnassign);
  const confirmationMessage =
    currentUserId === user.id ? messages.unassignConfirmation : messages.unassignConfirmationUser;

  const handleUnassignClick = () => {
    setShowUnassignConfirmation(true);
    trackEvent(ORGANIZATION_PAGE_EVENTS.manageAssignments('unassign_from_organization'));
  };

  const handleUnassignConfirm = () => {
    dispatch(unassignFromOrganizationAction(user, organization, handleUnassignSuccess));
    trackEvent(ORGANIZATION_PAGE_EVENTS.manageAssignments('yes_unassign'));
  };

  const renderUnassignButton = () => {
    const { id: userId, accountType: userType } = user;
    const { owner_id: ownerId, type: organizationType } = organization;
    const isUpsaUser = userType === UPSA;
    const isExternalOrg = organizationType === OrganizationType.EXTERNAL;
    const isPersonalOrg = organizationType === OrganizationType.PERSONAL;
    const isOrganizationOwner = userId === ownerId;
    const isCurrentUser = currentUserId === userId;

    let isDisabled = false;
    let tooltipMessage: MessageDescriptor = null;

    if (isUpsaUser && isExternalOrg) {
      isDisabled = true;
      tooltipMessage = messages.unassignUpsaMessage;
    }

    if (isPersonalOrg && isOrganizationOwner) {
      isDisabled = true;
      tooltipMessage = isCurrentUser
        ? messages.unassignPersonalOwnerSelfMessage
        : messages.unassignPersonalOwnerMessage;
    }

    const button = (
      <Button variant="text-danger" onClick={handleUnassignClick} disabled={isDisabled}>
        {formatMessage(messages.unassignFromOrganization)}
      </Button>
    );

    return tooltipMessage ? (
      <Tooltip
        placement="top"
        content={formatMessage(tooltipMessage)}
        tooltipClassName={cx('custom-tooltip')}
        wrapperClassName={cx('tooltip-wrapper')}
      >
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  const createFooter = (closeModal: () => void) => {
    if (showUnassignConfirmation) {
      return (
        <div className={cx('footer', 'footer-confirmation')}>
          <div className={cx('confirmation-text')}>{formatMessage(confirmationMessage)}</div>
          <div className={cx('action-buttons')}>
            <Button variant="ghost" onClick={() => setShowUnassignConfirmation(false)}>
              {formatMessage(COMMON_LOCALE_KEYS.NO)}
            </Button>
            <Button variant="danger" onClick={handleUnassignConfirm}>
              {formatMessage(messages.yesUnassign)}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={cx('footer')}>
        {renderUnassignButton()}
        <div className={cx('action-buttons')}>
          <Button variant="ghost" onClick={closeModal}>
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </Button>
          <Button variant="primary">{formatMessage(COMMON_LOCALE_KEYS.SAVE)}</Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={formatMessage(messages.manageAssignmentsHeader, { name: user.fullName })}
      size="large"
      createFooter={createFooter}
    >
      <div className={cx('modal-content')}></div>
    </Modal>
  );
};
