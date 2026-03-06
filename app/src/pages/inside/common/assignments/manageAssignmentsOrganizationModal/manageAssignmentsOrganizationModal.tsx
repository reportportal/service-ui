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

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { MessageDescriptor, useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Button, Modal, Tooltip } from '@reportportal/ui-kit';
import { useTracking } from 'react-tracking';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExternalLink } from 'pages/inside/common/externalLink';
import { idSelector, UserInfo } from 'controllers/user';
import {
  fetchUserAssignmentsAction,
  unassignFromOrganizationAction,
  updateUserAssignmentsAction,
  userAssignmentsDataSelector,
  userAssignmentsLoadingSelector,
  userAssignmentsUpdateLoadingSelector,
} from 'controllers/organization/users';
import type { UserOrganizationProjectsResponse } from 'controllers/organization/users/types';
import { Organization, OrganizationType } from 'controllers/organization';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { UPSA } from 'common/constants/accountType';
import { hideModalAction } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { useHandleUnassignSuccess } from '..';
import { buildUpdateAssignmentsPayload, getCurrentOrganizationAssignment, MANAGE_ASSIGNMENTS_FORM, } from './constants';
import {
  type Organization as OrganizationValue,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';

import styles from './manageAssignmentsOrganizationModal.scss';

const cx = createClassnames(styles);

interface ManageAssignmentsOrganizationModalOwnProps {
  user: UserInfo;
  organization: Organization;
  onUnassign?: () => void;
}

const ManageAssignmentsOrganizationModalView = ({
  user,
  organization,
  onUnassign,
  handleSubmit: formHandleSubmit,
  assignmentsData,
  assignmentsLoading,
  assignmentsUpdateLoading,
  hasNoAssignments: _hasNoAssignments,
}: ManageAssignmentsOrganizationModalOwnProps & {
  handleSubmit: (submit: (values: { organizations?: unknown[] }) => void) => () => void;
  assignmentsData: UserOrganizationProjectsResponse | null;
  assignmentsLoading: boolean;
  assignmentsUpdateLoading: boolean;
  hasNoAssignments: boolean;
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const currentUserId = useSelector(idSelector) as number;
  const [showUnassignConfirmation, setShowUnassignConfirmation] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationValue | null>(null);
  const handleUnassignSuccess = useHandleUnassignSuccess(user, onUnassign);

  useEffect(() => {
    dispatch(fetchUserAssignmentsAction(organization.id, user.id));
  }, [dispatch, organization.id, user.id]);

  const handleOrganizationAssignment = useCallback(() => {
    if (!assignmentsLoading && organization && user) {
      setCurrentOrganization(
        getCurrentOrganizationAssignment(organization, assignmentsData, user)
      );
    }
  }, [assignmentsLoading, assignmentsData, organization, user, setCurrentOrganization]);


  useEffect(() => {
    handleOrganizationAssignment();
  }, [handleOrganizationAssignment]);


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

  const onSaveAssignments = (_values: { organizations?: Organization[] }) => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.manageAssignments('save'));
    if (!currentOrganization) return;
    const payload = buildUpdateAssignmentsPayload(currentOrganization);
    dispatch(
      updateUserAssignmentsAction(
        organization.id,
        user.id,
        payload,
        () => dispatch(hideModalAction()),
        user,
      ),
    );
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

    if (isCurrentUser) {
      isDisabled = true;
      tooltipMessage =
        isPersonalOrg && isOrganizationOwner
          ? messages.unassignPersonalOwnerSelfMessage
          : messages.unassignSelfMessage;
    } else if (isUpsaUser && isExternalOrg) {
      isDisabled = true;
      tooltipMessage = messages.unassignUpsaMessage;
    } else if (isPersonalOrg && isOrganizationOwner) {
      isDisabled = true;
      tooltipMessage = messages.unassignPersonalOwnerMessage;
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
          <Button
            variant="primary"
            onClick={() => formHandleSubmit(onSaveAssignments)()}
            disabled={assignmentsUpdateLoading}
          >
            {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
          </Button>
        </div>
      </div>
    );
  };

  const description = formatMessage(messages.manageAssignmentsDescription, {
    link: (chunks: ReactNode) => (
      <ExternalLink
        href={'#'}
        className={cx('description-link')}
      >
        {chunks}
      </ExternalLink>
    ),
  });

  const handleOrganizationChange = (value: OrganizationValue | OrganizationValue[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    if (next) setCurrentOrganization(next);
  };

  return (
    <Modal
      description={description}
      title={formatMessage(messages.manageAssignmentsHeader, { name: user.fullName })}
      size="large"
      createFooter={createFooter}
      scrollable
    >
      <div className={cx('modal-content')}>
        <ModalLoadingOverlay isVisible={assignmentsLoading || assignmentsUpdateLoading} />
        <div className={cx('assigned-to-header')}>
          <span className={cx('assigned-to-label')}>
            {formatMessage(messages.assignedTo as MessageDescriptor)}
          </span>
        </div>
        {currentOrganization && (
          <OrganizationAssignment
            isMultiple={false}
            value={currentOrganization}
            onChange={handleOrganizationChange}
          />
        )}
      </div>
    </Modal>
  );
};

function isEmptyAssignmentsResponse(data: UserOrganizationProjectsResponse | null): boolean {
  return data == null || !data.items || data.items.length === 0;
}

const mapStateToProps = (state: unknown) => {
  const assignmentsData = userAssignmentsDataSelector(state as never) as UserOrganizationProjectsResponse | null;
  const assignmentsLoading = Boolean(userAssignmentsLoadingSelector(state as never)) ;
  let hasNoAssignments = false;
  if (!assignmentsLoading) {
    hasNoAssignments = assignmentsData != null && isEmptyAssignmentsResponse(assignmentsData) ;
  }
  const assignmentsUpdateLoading = Boolean(userAssignmentsUpdateLoadingSelector(state as never));
  return {
    initialValues: { organizations: [] },
    assignmentsData,
    assignmentsLoading,
    assignmentsUpdateLoading,
    hasNoAssignments,
  };
};

const FormWrapper = reduxForm<
  { organizations?: unknown[] },
  ManageAssignmentsOrganizationModalOwnProps & {
    assignmentsData: UserOrganizationProjectsResponse | null;
    assignmentsLoading: boolean;
    assignmentsUpdateLoading: boolean;
    hasNoAssignments: boolean;
  }
>({
  form: MANAGE_ASSIGNMENTS_FORM,
})(ManageAssignmentsOrganizationModalView);

export const ManageAssignmentsOrganizationModal = connect(mapStateToProps)(FormWrapper);
