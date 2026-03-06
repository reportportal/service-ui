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
import {
  buildUpdateAssignmentsPayload,
  getCurrentOrganizationAssignment,
  isAssignmentDirty,
  MANAGE_ASSIGNMENTS_FORM,
} from './constants';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
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

type AssignmentDescriptionLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
};

export const AssignmentDescriptionLink = ({
  children,
  className,
  href,
}: AssignmentDescriptionLinkProps) => (
  <ExternalLink href={href} className={className}>
    {children}
  </ExternalLink>
);

const renderDescriptionLink = (chunks: ReactNode) => (
  <AssignmentDescriptionLink href="#" className={cx('description-link')}>
    {chunks}
  </AssignmentDescriptionLink>
);

const ManageAssignmentsOrganizationModalView = ({
  user,
  organization,
  onUnassign,
  handleSubmit: formHandleSubmit,
  assignmentsData,
  assignmentsLoading,
  assignmentsUpdateLoading,
}: ManageAssignmentsOrganizationModalOwnProps & {
  handleSubmit: (submit: (values: { organizations?: unknown[] }) => void) => () => void;
  assignmentsData: UserOrganizationProjectsResponse | null;
  assignmentsLoading: boolean;
  assignmentsUpdateLoading: boolean;
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const currentUserId = useSelector(idSelector) as number;
  const [showUnassignConfirmation, setShowUnassignConfirmation] = useState(false);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationValue | null>(null);
  const [initialOrganization, setInitialOrganization] = useState<OrganizationValue | null>(null);
  const handleUnassignSuccess = useHandleUnassignSuccess(user, onUnassign);

  const isDirty = isAssignmentDirty(currentOrganization, initialOrganization);
  const isBusy = assignmentsLoading || assignmentsUpdateLoading || !currentOrganization;

  const initialSnapshotTakenRef = useRef(false);

  const resetModalState = useCallback(() => {
    setShowUnassignConfirmation(false);
    setShowDiscardConfirmation(false);
    setCurrentOrganization(null);
    setInitialOrganization(null);
    initialSnapshotTakenRef.current = false;
  }, []);

  useEffect(() => {
    dispatch(fetchUserAssignmentsAction(organization.id, user.id));
  }, [dispatch, organization.id, user.id]);

  const handleOrganizationAssignment = useCallback(() => {
    if (!assignmentsLoading && assignmentsData !== null && organization && user) {
      const next = getCurrentOrganizationAssignment(organization, assignmentsData, user);
      if (!initialSnapshotTakenRef.current) {
        initialSnapshotTakenRef.current = true;
        setCurrentOrganization(next);
        setInitialOrganization(next);
      }
    }
  }, [assignmentsLoading, assignmentsData, organization, user]);

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
    if (!currentOrganization || !isDirty) return;
    trackEvent(ORGANIZATION_PAGE_EVENTS.manageAssignments('save'));
    const payload = buildUpdateAssignmentsPayload(currentOrganization);
    dispatch(
      updateUserAssignmentsAction(
        organization.id,
        user.id,
        payload,
        () => {
          resetModalState();
          dispatch(hideModalAction());
        },
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

    let isDisabled = isBusy;
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

  const handleCancelClick = (closeModal: () => void) => {
    if (isBusy) return;
    if (isDirty) {
      setShowDiscardConfirmation(true);
    } else {
      resetModalState();
      closeModal();
    }
  };

  const handleDiscardConfirm = (closeModal: () => void) => {
    setShowDiscardConfirmation(false);
    resetModalState();
    closeModal();
  };

  const createFooter = (closeModal: () => void) => {
    if (showUnassignConfirmation) {
      return (
        <div className={cx('footer', 'footer-confirmation')}>
          <div className={cx('confirmation-text')}>{formatMessage(confirmationMessage)}</div>
          <div className={cx('action-buttons')}>
            <Button
              variant="ghost"
              onClick={() => setShowUnassignConfirmation(false)}
              disabled={isBusy}
            >
              {formatMessage(COMMON_LOCALE_KEYS.NO)}
            </Button>
            <Button variant="danger" onClick={handleUnassignConfirm} disabled={isBusy}>
              {formatMessage(messages.yesUnassign)}
            </Button>
          </div>
        </div>
      );
    }

    if (showDiscardConfirmation) {
      return (
        <div className={cx('footer', 'footer-confirmation')}>
          <div className={cx('confirmation-text')}>
            {formatMessage(messages.discardChangesConfirmation as MessageDescriptor)}
          </div>
          <div className={cx('action-buttons')}>
            <Button
              variant="ghost"
              onClick={() => setShowDiscardConfirmation(false)}
              disabled={isBusy}
            >
              {formatMessage(COMMON_LOCALE_KEYS.NO)}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDiscardConfirm(closeModal)}
              disabled={isBusy}
            >
              {formatMessage(COMMON_LOCALE_KEYS.DISCARD)}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={cx('footer')}>
        {renderUnassignButton()}
        <div className={cx('action-buttons')}>
          <Button
            variant="ghost"
            onClick={() => handleCancelClick(closeModal)}
            disabled={isBusy}
          >
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </Button>
          <Button
            variant="primary"
            onClick={() => formHandleSubmit(onSaveAssignments)()}
            disabled={isBusy || !isDirty}
          >
            {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
          </Button>
        </div>
      </div>
    );
  };

  const description = formatMessage(messages.manageAssignmentsDescription, {
    link: renderDescriptionLink,
  });

  const handleOrganizationChange = (value: OrganizationValue | OrganizationValue[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    if (next) setCurrentOrganization(next);
  };
  const handleModalClose = useCallback(() => {
    resetModalState();
    dispatch(hideModalAction());
  }, [resetModalState, dispatch]);

  return (
    <Modal
      description={description}
      title={formatMessage(messages.manageAssignmentsHeader, { name: user.fullName })}
      size="large"
      createFooter={createFooter}
      scrollable
      allowCloseOutside={!isDirty}
      onClose={handleModalClose}
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

const mapStateToProps = (state: unknown) => {
  const assignmentsData = userAssignmentsDataSelector(
    state as never,
  ) as UserOrganizationProjectsResponse | null;
  const assignmentsLoading = Boolean(userAssignmentsLoadingSelector(state as never));
  const assignmentsUpdateLoading = Boolean(userAssignmentsUpdateLoadingSelector(state as never));
  return {
    initialValues: { organizations: [] },
    assignmentsData,
    assignmentsLoading,
    assignmentsUpdateLoading,
  };
};

const FormWrapper = reduxForm<
  { organizations?: unknown[] },
  ManageAssignmentsOrganizationModalOwnProps & {
    assignmentsData: UserOrganizationProjectsResponse | null;
    assignmentsLoading: boolean;
    assignmentsUpdateLoading: boolean;
  }
>({
  form: MANAGE_ASSIGNMENTS_FORM,
})(ManageAssignmentsOrganizationModalView);

export const ManageAssignmentsOrganizationModal = connect(mapStateToProps)(FormWrapper);
