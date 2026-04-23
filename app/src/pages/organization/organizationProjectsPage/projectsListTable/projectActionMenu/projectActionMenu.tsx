/*!
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

import { useDispatch, useSelector } from 'react-redux';
import { FC, useCallback, useMemo } from 'react';
import { useTracking } from 'react-tracking';
import { UserInfo, userInfoSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import {canRenameProject as canRenameProjectPermission, canInviteUserToProject as canInviteUserToProjectPermission, canAssignUnassignInternalUser as canAssignUnassignInternalUserPermission } from 'common/utils/permissions';
import {
  deleteProjectAction,
  fetchFilteredProjectAction,
  renameProjectAction,
} from 'controllers/organization/projects';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { RenameProjectModal } from '../../modals/renameProjectModal';
import { DeleteProjectModal } from '../../modals/deleteProjectModal';
import { messages } from '../../messages';
import { ActionItem, ActionMenu, LinkItem } from 'components/actionMenu';
import { UnassignProjectModal } from 'pages/inside/common/assignments/unassignProjectModal';
import { AssignProjectModal } from 'pages/inside/common/assignments';
import { ProjectDetails } from 'pages/organization/constants';
import { PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/projectsPageEvents';
import { InviteUserModal, Level } from 'pages/inside/common/invitations/inviteUserModal';
import { ORGANIZATION_PAGE_EVENTS } from 'analyticsEvents/organizationsPageEvents';
import { userRolesSelector } from 'controllers/pages';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { resolveUserRolesForProjectRow } from 'pages/inside/common/assignments/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';

interface ProjectActionMenuProps {
  details: ProjectDetails;
}

export const ProjectActionMenu: FC<ProjectActionMenuProps> = ({ details }) => {
  const { projectName, projectKey, projectId, projectSlug, projectRole, organizationSlug } =
    details;
  const userRoles = useSelector(userRolesSelector);
  const {
    canRenameProject,
    canInviteUserToProject,
    canDeleteProject,
    canAssignUnassignInternalUser,
  } = useUserPermissions();
  const ssoOnlyEnabled = useSelector(ssoUsersOnlySelector);

  const projectRowPermissions = useMemo(() => {
    const roles = resolveUserRolesForProjectRow(userRoles, projectRole);
    return {
      canRenameProject: canRenameProjectPermission(roles),
      canInviteUserToProject: canInviteUserToProjectPermission(roles),
      canAssignUnassignInternalUser: canAssignUnassignInternalUserPermission(roles),
    };
  }, [projectRole, userRoles]);

  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const user = useSelector(userInfoSelector) as UserInfo;
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);
  const action = ssoUsersOnly ? 'assign' : 'invite';
  const elementName = `${action}_menu`;
  const buttonElementName = `button_${action}_user`;
  const modalName = `${action}_user`;

  const handleDeleteProjectClick = useCallback(() => {
    trackEvent(PROJECTS_PAGE_EVENTS.projectPageMenuOptionClick('delete_menu', projectId));
    const data = {
      projectName,
      projectId,
      onConfirm: () => {
        dispatch(deleteProjectAction({ projectName, projectId }));
      },
    };

    dispatch(showModalAction({ component: <DeleteProjectModal data={data} /> }));
  }, [dispatch, trackEvent, projectId, projectName]);

  const handleRenameProjectClick = useCallback(() => {
    trackEvent(PROJECTS_PAGE_EVENTS.projectPageMenuOptionClick('rename_menu', projectId));
    const data = {
      projectName,
      projectId,
      onConfirm: (newProjectName: string) => {
        dispatch(renameProjectAction({ projectId, newProjectName }));
      },
    };

    dispatch(showModalAction({ component: <RenameProjectModal data={data} /> }));
  }, [dispatch, trackEvent, projectId, projectName]);

  const handleAssignClick = useCallback(() => {
    const onSuccess = () => {
      dispatch(fetchFilteredProjectAction());
    };

    dispatch(
      showModalAction({
        component: <AssignProjectModal project={details} onSuccess={onSuccess} />,
      }),
    );
    trackEvent(ORGANIZATION_PAGE_EVENTS.assignToProject());
  }, [details, dispatch, trackEvent]);

  const handleUnassignClick = useCallback(() => {
    const onSuccess = () => {
      dispatch(fetchFilteredProjectAction());
    };

    dispatch(
      showModalAction({
        component: <UnassignProjectModal user={user} project={details} onSuccess={onSuccess} />,
      }),
    );
  }, [details, dispatch, user]);

  const handleInviteUserClick = useCallback(() => {
    const onInvite = () => {
      dispatch(fetchFilteredProjectAction());
      trackEvent(
        PROJECTS_PAGE_EVENTS.projectPageModalSubmitSuccess(buttonElementName, modalName, projectId),
      );
    };

    dispatch(
      showModalAction({
        component: (
          <InviteUserModal
            level={Level.PROJECT}
            onInvite={onInvite}
            projectId={projectId}
            projectName={projectName}
          />
        ),
      }),
    );
    trackEvent(PROJECTS_PAGE_EVENTS.projectPageMenuOptionClick(elementName, projectId));
  }, [dispatch, projectId, projectName, trackEvent, elementName, buttonElementName, modalName]);

  const links = useMemo(
    (): LinkItem[] => [
      {
        label: formatMessage(messages.team),
        to: {
          type: 'PROJECT_MEMBERS_PAGE',
          payload: { projectSlug, organizationSlug, projectKey },
        },
        onClick: () => {
          trackEvent(PROJECTS_PAGE_EVENTS.projectPageMenuOptionClick('team_menu', projectId));
        },
      },
      {
        label: formatMessage(messages.settings),
        to: {
          type: 'PROJECT_SETTINGS_PAGE',
          payload: { projectSlug, organizationSlug, projectKey },
        },
        onClick: () => {
          trackEvent(PROJECTS_PAGE_EVENTS.projectPageMenuOptionClick('settings_menu', projectId));
        },
      },
    ],
    [formatMessage, projectSlug, organizationSlug, projectKey, projectId, trackEvent],
  );

  const actions = useMemo((): ActionItem[] => {
    const isAssigned = !!projectRole;

    return [
      {
        label: formatMessage(COMMON_LOCALE_KEYS.RENAME),
        onClick: handleRenameProjectClick,
        hasPermission: projectRowPermissions.canRenameProject ?? canRenameProject,
      },
      {
        label: ssoOnlyEnabled ? formatMessage(messages.actionAssignUser) : formatMessage(messages.actionInviteUser),
        onClick: handleInviteUserClick,
        hasPermission: projectRowPermissions.canInviteUserToProject ?? canInviteUserToProject,
      },
      {
        label: isAssigned
          ? formatMessage(COMMON_LOCALE_KEYS.UNASSIGN)
          : formatMessage(COMMON_LOCALE_KEYS.ASSIGN),
        onClick: isAssigned ? handleUnassignClick : handleAssignClick,
        hasPermission:
          projectRowPermissions.canAssignUnassignInternalUser ?? canAssignUnassignInternalUser,
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        onClick: handleDeleteProjectClick,
        hasPermission: canDeleteProject,
        danger: true,
      },
    ];
  }, [
    projectRole,
    formatMessage,
    handleRenameProjectClick,
    projectRowPermissions,
    handleInviteUserClick,
    handleUnassignClick,
    handleAssignClick,
    canAssignUnassignInternalUser,
    canInviteUserToProject,
    canRenameProject,
    handleDeleteProjectClick,
    canDeleteProject,
    ssoOnlyEnabled,
  ]);

  return <ActionMenu links={links} actions={actions} showDivider />;
};
