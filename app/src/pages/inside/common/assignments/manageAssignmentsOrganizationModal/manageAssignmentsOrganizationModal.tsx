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

import {
  buildUpdateAssignmentsPayload,
  getCurrentOrganizationAssignment,
  getManageAssignmentsSaveCondition,
  isAssignmentDirty,
} from '../utils';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { MessageDescriptor, useIntl } from 'react-intl';
import { formValueSelector, reduxForm } from 'redux-form';
import { Button, Modal, Tooltip } from '@reportportal/ui-kit';
import { useTracking } from 'react-tracking';
import { createClassnames, referenceDictionary } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExternalLink } from 'pages/inside/common/externalLink';
import { idSelector } from 'controllers/user';
import {
  fetchUserAssignmentsAction,
  unassignFromOrganizationAction,
  updateUserAssignmentsAction,
  userAssignmentsDataSelector,
  userAssignmentsLoadingSelector,
  userAssignmentsUpdateLoadingSelector,
} from 'controllers/organization/users';
import type { UserOrganizationProjectsResponse } from 'controllers/organization/users/types';
import { Organization } from 'controllers/organization';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { hideModalAction } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { useHandleUnassignSuccess, useAssignmentsUtils } from '..';
import {
  type Organization as OrganizationValue,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';

import styles from './manageAssignmentsOrganizationModal.scss';
import { OrganizationUserInfo } from 'controllers/user/types';

const cx = createClassnames(styles);

const MANAGE_ASSIGNMENTS_FORM = 'manageAssignmentsForm';

interface ManageAssignmentsOrganizationModalOwnProps {
  user: OrganizationUserInfo;
  organization: Organization;
  onUnassign?: () => void;
}

const renderDescriptionLink = (chunks: ReactNode) => (
  // TODO: currently the link does not lead anywhere, as the url is not clarified yet.
  <ExternalLink href={referenceDictionary.rpDoc} variant="compact" isColoredIcon={false}>
    {chunks}
  </ExternalLink>
);

const ManageAssignmentsOrganizationModalView = ({
  user,
  organization,
  onUnassign,
  handleSubmit: formHandleSubmit,
  assignmentsData,
  assignmentsLoading,
  assignmentsUpdateLoading,
  isAddingProject,
}: ManageAssignmentsOrganizationModalOwnProps & {
  handleSubmit: (submit: (values: { organizations?: unknown[] }) => void) => () => void;
  assignmentsData: UserOrganizationProjectsResponse | null;
  assignmentsLoading: boolean;
  assignmentsUpdateLoading: boolean;
  isAddingProject: boolean;
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const currentUserId = useSelector(idSelector) as number;
  const [showUnassignConfirmation, setShowUnassignConfirmation] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationValue | null>(null);
  const [initialOrganization, setInitialOrganization] = useState<OrganizationValue | null>(null);
  const handleUnassignSuccess = useHandleUnassignSuccess(user, onUnassign);
  const isCurrentUser = currentUserId === user?.id;
  const isDirty = isAssignmentDirty(currentOrganization, initialOrganization);
  const isBusy = assignmentsLoading || assignmentsUpdateLoading || !currentOrganization;
  const { unassignTooltip } = useAssignmentsUtils({
    currentUserId,
    userId: user.id,
    userType: user.accountType,
    organizationType: organization.type,
    ownerId: organization.owner_id,
  });

  const initialSnapshotTakenRef = useRef(false);
  const wasLoadingRef = useRef(false);

  const resetModalState = useCallback(() => {
    setShowUnassignConfirmation(false);
    setCurrentOrganization(null);
    setInitialOrganization(null);
    initialSnapshotTakenRef.current = false;
    wasLoadingRef.current = false;
  }, []);

  useEffect(() => {
    dispatch(fetchUserAssignmentsAction(organization.id, user.id));
  }, [dispatch, organization.id, user.id]);

  const handleOrganizationAssignment = useCallback(() => {
    const wasLoading = wasLoadingRef.current;
    wasLoadingRef.current = assignmentsLoading;

    if (!assignmentsLoading && assignmentsData !== null && organization && user) {
      const next = getCurrentOrganizationAssignment(organization, assignmentsData, user);
      const loadingJustFinished = wasLoading === true;
      if (loadingJustFinished && !initialSnapshotTakenRef.current) {
        initialSnapshotTakenRef.current = true;
        setCurrentOrganization(next);
        setInitialOrganization(next);
      }
    }
  }, [assignmentsLoading, assignmentsData, organization, user]);

  useEffect(() => {
    handleOrganizationAssignment();
  }, [handleOrganizationAssignment]);

  const confirmationMessage = isCurrentUser
    ? messages.unassignConfirmation
    : messages.unassignConfirmationUser;

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
    const condition = getManageAssignmentsSaveCondition(initialOrganization, currentOrganization);

    trackEvent(ORGANIZATION_PAGE_EVENTS.manageAssignments('save', condition));
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
    const isDisabled = isBusy || !!unassignTooltip;
    const button = (
      <Button variant="text-danger" onClick={handleUnassignClick} disabled={isDisabled}>
        {formatMessage(messages.unassignFromOrganization)}
      </Button>
    );

    return unassignTooltip ? (
      <Tooltip
        placement="top"
        content={formatMessage(unassignTooltip)}
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

    return (
      <div className={cx('footer')}>
        {renderUnassignButton()}
        <div className={cx('action-buttons')}>
          <Button
            variant="ghost"
            onClick={() => {
              resetModalState();
              closeModal();
            }}
            disabled={isBusy}
          >
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </Button>
          <Button
            variant="primary"
            onClick={() => formHandleSubmit(onSaveAssignments)()}
            disabled={isBusy || !isDirty || isAddingProject}
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
            invitedUserId={user.id}
            formName={MANAGE_ASSIGNMENTS_FORM}
            userType={user.accountType}
            showUnassignProjectTooltip
          />
        )}
      </div>
    </Modal>
  );
};

const formSelector = formValueSelector(MANAGE_ASSIGNMENTS_FORM);

const mapStateToProps = (state: unknown) => {
  const assignmentsData = userAssignmentsDataSelector(
    state as never,
  ) as UserOrganizationProjectsResponse | null;
  const assignmentsLoading = Boolean(userAssignmentsLoadingSelector(state as never));
  const assignmentsUpdateLoading = Boolean(userAssignmentsUpdateLoadingSelector(state as never));
  const isAddingProject = Boolean(formSelector(state as never, 'isAddingProject'));
  return {
    initialValues: { organizations: [] },
    assignmentsData,
    assignmentsLoading,
    assignmentsUpdateLoading,
    isAddingProject,
  };
};

const FormWrapper = reduxForm<
  { organizations?: unknown[] },
  ManageAssignmentsOrganizationModalOwnProps & {
    assignmentsData: UserOrganizationProjectsResponse | null;
    assignmentsLoading: boolean;
    assignmentsUpdateLoading: boolean;
    isAddingProject: boolean
  }
>({
  form: MANAGE_ASSIGNMENTS_FORM,
})(ManageAssignmentsOrganizationModalView);

export const ManageAssignmentsOrganizationModal = connect(mapStateToProps)(FormWrapper);
