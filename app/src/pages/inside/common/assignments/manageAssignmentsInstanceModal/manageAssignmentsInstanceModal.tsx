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

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  reduxForm,
  change,
  formValueSelector,
  FieldArray,
  type InjectedFormProps,
} from 'redux-form';
import { Modal, SystemMessage } from '@reportportal/ui-kit';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { useTracking } from 'react-tracking';
import { createClassnames, fetch, referenceDictionary } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExternalLink } from 'pages/inside/common/externalLink';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import {
  showDefaultErrorNotification,
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
} from 'controllers/notification';
import { hideModalAction } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { URLS } from 'common/urls';
import {
  InstanceAssignment,
  InstanceAssignmentProps,
  ORGANIZATION,
} from '../instanceAssignment/instanceAssignment';
import type { Organization as OrganizationValue } from 'pages/inside/common/assignments/organizationAssignment';
import { ORGANIZATIONS } from 'pages/instance/allUsersPage/allUsersHeader/createUserModal';
import {
  buildUpdateAssignmentsPayload,
  getManageAssignmentsInstanceChangeSet,
  getManageAssignmentsInstanceSaveCondition,
  mapProjectsFromResponse,
} from '../utils';
import { OrganizationType } from 'controllers/organization';
import { UserOrganizationProjectsResponse } from 'controllers/organization/users/types';
import {
  type OrganizationSearchesItem,
  type OrganizationsSearchesResponseData,
} from 'controllers/instance/organizations';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { ApiError } from 'types/api';

import styles from './manageAssignmentsInstanceModal.scss';

const cx = createClassnames(styles);

const MANAGE_ASSIGNMENTS_FORM = 'manageAssignmentsInstanceForm';

interface InstanceUser {
  id: number;
  fullName: string;
  instanceRole?: string;
  accountType?: string;
  organizations: Array<{
    id: number;
    org_role: string;
    name: string;
    slug: string;
    type?: OrganizationType;
    owner_id?: number;
  }>;
}

interface ManageAssignmentsInstanceModalOwnProps {
  user: InstanceUser;
  onSuccess?: () => void;
}

type ManageAssignmentsFormValues = {
  [ORGANIZATIONS]?: unknown[];
  isAddingOrganization?: boolean;
  isAddingProject?: boolean;
};

type ManageAssignmentsInstanceModalViewProps = ManageAssignmentsInstanceModalOwnProps &
  InjectedFormProps<ManageAssignmentsFormValues, ManageAssignmentsInstanceModalOwnProps>;

const ManageAssignmentsInstanceModalView = ({
  user,
  onSuccess,
  initialize,
  handleSubmit,
}: ManageAssignmentsInstanceModalViewProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const [isSavingAssignments, setIsSavingAssignments] = useState(false);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const initialOrganizationsRef = useRef<OrganizationValue[]>([]);

  const formSelector = formValueSelector(MANAGE_ASSIGNMENTS_FORM);
  const organizationsValue = useSelector(
    (state) => formSelector(state, ORGANIZATIONS) as OrganizationValue[] | undefined,
  );
  const isAddingOrganization = useSelector((state) =>
    Boolean(formSelector(state, 'isAddingOrganization')),
  );
  const isAddingProject = useSelector((state) => Boolean(formSelector(state, 'isAddingProject')));
  const organizations = useMemo(() => organizationsValue || [], [organizationsValue]);
  const isAnyProjectsLoading = organizations.some((org) => Boolean(org.isProjectsLoading));
  const isInlineAssignmentFormOpen = isAddingOrganization || isAddingProject;
  const isAdmin = user.instanceRole === ADMINISTRATOR;

  const mergeOrganizationSearchItemsIntoOrgs = useCallback(
    (orgs: OrganizationValue[], items: OrganizationSearchesItem[]) =>
      orgs.map((org, orgIndex) => {
        const nextOrg = items.find((item) => item.id === org.id);
        const orgField = `${ORGANIZATIONS}[${orgIndex}]`;
        if (nextOrg?.type) {
          dispatch(change(MANAGE_ASSIGNMENTS_FORM, `${orgField}.type`, nextOrg.type));
        }
        if (nextOrg?.owner_id) {
          dispatch(change(MANAGE_ASSIGNMENTS_FORM, `${orgField}.owner_id`, nextOrg.owner_id));
        }
        return { ...org, type: nextOrg?.type, owner_id: nextOrg?.owner_id };
      }),
    [dispatch],
  );

  // Store initial organizations for dirty checking
  useEffect(() => {
    let isActive = true;

    if (!user?.organizations?.length) {
      return;
    }

    let orgs: OrganizationValue[] = user.organizations
      .map((org) => ({
        id: org.id,
        name: org.name,
        type: org.type,
        owner_id: org.owner_id,
        role: org.org_role,
        projects: [],
        isProjectsLoaded: false,
        isExpanded: false,
      }))
      .sort((first, second) => first.name.localeCompare(second.name));

    initialize({ [ORGANIZATIONS]: orgs });
    initialOrganizationsRef.current = orgs;

    setOrganizationsLoading(true);

    fetch(URLS.organizationSearches(), {
      method: 'post',
      data: {
        limit: 300,
        search_criteria: [{ filter_key: 'org_user_id', operation: 'EQ', value: String(user.id) }],
      },
    })
      .then((response: OrganizationsSearchesResponseData) => {
        if (!isActive) {
          return;
        }
        const items = response.items ?? [];
        orgs = mergeOrganizationSearchItemsIntoOrgs(orgs, items);
        initialOrganizationsRef.current = orgs;
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) {
          setOrganizationsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [user, initialize, dispatch, mergeOrganizationSearchItemsIntoOrgs]);

  // Fetch projects for organization when expanded
  const handleExpandOrganization = useCallback(
    (orgId: number) => {
      // Load projects only for initially existing organizations (not newly added ones)
      const initialOrganization = initialOrganizationsRef.current.find((org) => org.id === orgId);
      if (!initialOrganization) {
        return;
      }

      const orgIndex = organizations.findIndex((org) => org.id === orgId);
      if (orgIndex === undefined || orgIndex === -1) {
        return;
      }

      if (organizations[orgIndex]?.isProjectsLoaded || organizations[orgIndex]?.isProjectsLoading) {
        return;
      }

      const orgField = `${ORGANIZATIONS}[${orgIndex}]`;
      dispatch(change(MANAGE_ASSIGNMENTS_FORM, `${orgField}.isProjectsLoading`, true));
      fetch(URLS.organizationUserProjects(orgId, user.id))
        .then((response: UserOrganizationProjectsResponse) => {
          const projects = mapProjectsFromResponse(response);
          const orgField = `${ORGANIZATIONS}[${orgIndex}]`;

          dispatch(change(MANAGE_ASSIGNMENTS_FORM, `${orgField}.projects`, projects));
          dispatch(change(MANAGE_ASSIGNMENTS_FORM, `${orgField}.isProjectsLoaded`, true));
          initialOrganizationsRef.current = initialOrganizationsRef.current.map((org) =>
            org.id === orgId ? { ...org, projects, isProjectsLoaded: true } : org,
          );
        })
        .catch((error: ApiError | Error) => {
          dispatch(showDefaultErrorNotification(error));
        })
        .finally(() => {
          dispatch(change(MANAGE_ASSIGNMENTS_FORM, `${orgField}.isProjectsLoading`, false));
        });
    },
    [user.id, dispatch, organizations],
  );

  const isDirty = useMemo(() => {
    const { modified, added, removed } = getManageAssignmentsInstanceChangeSet(
      initialOrganizationsRef.current,
      organizations,
    );
    return modified.length > 0 || added.length > 0 || removed.length > 0;
  }, [organizations]);

  const handleSave = async () => {
    const { modified, removed } = getManageAssignmentsInstanceChangeSet(
      initialOrganizationsRef.current,
      organizations,
    );
    const saveCondition = getManageAssignmentsInstanceSaveCondition(
      initialOrganizationsRef.current,
      organizations,
    );
    if (saveCondition) {
      trackEvent(ALL_USERS_PAGE_EVENTS.manageAssignmentsSave(saveCondition));
    }

    setIsSavingAssignments(true);

    try {
      const removeOperations = removed.map((org) => ({
        name: org.name,
        promise: fetch(URLS.organizationUserById({ organizationId: org.id, userId: user.id }), {
          method: 'DELETE',
        }),
      }));

      const updateOperations = modified.map((org) => ({
        name: org.name,
        promise: (async () => {
          let orgToSave = org;

          if (org.isProjectsLoaded === false) {
            const response: UserOrganizationProjectsResponse = await fetch(
              URLS.organizationUserProjects(org.id, user.id),
            );

            orgToSave = {
              ...org,
              projects: mapProjectsFromResponse(response),
              isProjectsLoaded: true,
            };
          }

          return fetch(URLS.organizationUserAssignments(org.id, user.id), {
            method: 'PUT',
            data: buildUpdateAssignmentsPayload(orgToSave),
          });
        })(),
      }));

      const operations = [...removeOperations, ...updateOperations];
      const results = await Promise.allSettled(operations.map((op) => op.promise));
      const failedNames = results
        .map((res, i) => (res.status === 'rejected' ? operations[i].name : null))
        .filter(Boolean);

      const allFailed = failedNames.length === operations.length;
      const someFailed = failedNames.length > 0 && !allFailed;

      if (allFailed) {
        dispatch(
          showErrorNotification({
            message: formatMessage(messages.manageAssignmentsUpdateAllFailed),
          }),
        );
        return;
      }

      if (someFailed) {
        const failedOrgNames = failedNames.filter(Boolean).join(', ');
        dispatch(
          showWarningNotification({
            message: formatMessage(messages.manageAssignmentsUpdatePartialFailed, {
              organizations: failedOrgNames,
            }),
          }),
        );
        onSuccess?.();
        dispatch(hideModalAction());
        return;
      }

      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.assignmentUpdatedSuccess, { name: user.fullName }),
        }),
      );
      onSuccess?.();
      dispatch(hideModalAction());
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const handleModalClose = useCallback(() => {
    dispatch(hideModalAction());
  }, [dispatch]);

  const renderDocumentationLink = useCallback(
    (chunks: ReactNode) => (
      <ExternalLink
        href={referenceDictionary.rpDoc}
        variant="compact"
        isColoredIcon={false}
        onClick={() => trackEvent(ALL_USERS_PAGE_EVENTS.MANAGE_ASSIGNMENTS_DOCUMENTATION)}
      >
        {chunks}
      </ExternalLink>
    ),
    [trackEvent],
  );

  const description = useMemo(
    () =>
      formatMessage(messages.manageAssignmentsDescription, {
        link: renderDocumentationLink,
      }),
    [formatMessage, renderDocumentationLink],
  );

  return (
    <Modal
      description={description}
      title={formatMessage(messages.manageAssignmentsHeader, { name: user.fullName })}
      size="large"
      scrollable
      allowCloseOutside={!isDirty}
      onClose={handleModalClose}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.SAVE),
        disabled:
          !isDirty ||
          organizationsLoading ||
          isAnyProjectsLoading ||
          isSavingAssignments ||
          isInlineAssignmentFormOpen,
        onClick: handleSubmit(handleSave) as () => void,
      }}
    >
      <div className={cx('modal-content')}>
        <ModalLoadingOverlay isVisible={organizationsLoading} />
        {isAdmin && (
          <div className={cx('admin-info')}>
            <SystemMessage mode="info">
              {formatMessage(messages.manageAssignmentsAdminInfo)}
            </SystemMessage>
          </div>
        )}
        <FieldArray
          name={ORGANIZATIONS}
          component={InstanceAssignment}
          props={
            {
              formName: MANAGE_ASSIGNMENTS_FORM,
              formNamespace: ORGANIZATION,
              invitedUserId: user.id,
              userType: user.accountType,
              isOrganizationRequired: false,
              header: formatMessage(messages.assignedTo),
              addButtonPlacement: 'header',
              addFormPlacement: 'top',
              withEmptyState: true,
              emptyStateText: formatMessage(messages.noAssignmentsYet),
              onExpandOrganization: handleExpandOrganization,
            } as InstanceAssignmentProps
          }
        />
      </div>
    </Modal>
  );
};

export const ManageAssignmentsInstanceModal = reduxForm<
  ManageAssignmentsFormValues,
  ManageAssignmentsInstanceModalOwnProps
>({
  form: MANAGE_ASSIGNMENTS_FORM,
  enableReinitialize: false,
})(ManageAssignmentsInstanceModalView);
