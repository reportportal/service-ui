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
import { setActiveProjectKeyAction, UserInfo, userInfoSelector } from 'controllers/user';
import {
  canDeleteProject,
  canInviteUserToProject,
  canRenameProject,
  canAssignUnassignInternalUser,
} from 'common/utils/permissions/permissions';
import { userRolesSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { deleteProjectAction, renameProjectAction } from 'controllers/organization/projects';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { RenameProjectModal } from '../../modals/renameProjectModal';
import { DeleteProjectModal } from '../../modals/deleteProjectModal';
import { messages } from '../../messages';
import { ActionMenu, ActionItem, LinkItem } from 'components/actionMenu';
import { UnassignProjectModal } from 'pages/inside/common/assignments/unassignProjectModal';

interface ProjectDetails {
  projectName: string;
  projectKey: string;
  projectId: number;
  projectSlug: string;
  projectRole: string;
  organizationSlug: string;
}

interface ProjectActionMenuProps {
  details: ProjectDetails;
}

export const ProjectActionMenu: FC<ProjectActionMenuProps> = ({ details }) => {
  const { projectName, projectKey, projectId, projectSlug, projectRole, organizationSlug } =
    details;
  const roles = useSelector(userRolesSelector);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const user = useSelector(userInfoSelector) as UserInfo;

  const handleDeleteProjectClick = useCallback(() => {
    const data = {
      projectName,
      onConfirm: () => {
        dispatch(deleteProjectAction({ projectName, projectId }));
      },
    };

    dispatch(showModalAction({ component: <DeleteProjectModal data={data} /> }));
  }, [dispatch, projectId, projectName]);

  const handleRenameProjectClick = useCallback(() => {
    const data = {
      projectName,
      onConfirm: (newProjectName: string) => {
        dispatch(renameProjectAction({ projectId, newProjectName }));
      },
    };

    dispatch(showModalAction({ component: <RenameProjectModal data={data} /> }));
  }, [dispatch, projectId, projectName]);

  const handleLinkClick = useCallback(() => {
    dispatch(setActiveProjectKeyAction(projectKey));
  }, [dispatch, projectKey]);

  const handleAssignClick = useCallback(() => {
    // TODO: Implement assign action
  }, []);

  const handleUnassignClick = useCallback(() => {
    dispatch(
      showModalAction({ component: <UnassignProjectModal user={user} project={details} /> }),
    );
  }, [details, dispatch, user]);

  const links = useMemo(
    (): LinkItem[] => [
      {
        label: formatMessage(messages.team),
        to: {
          type: 'PROJECT_MEMBERS_PAGE',
          payload: { projectSlug, organizationSlug },
        },
        onClick: handleLinkClick,
      },
      {
        label: formatMessage(messages.settings),
        to: {
          type: 'PROJECT_SETTINGS_PAGE',
          payload: { projectSlug, organizationSlug },
        },
        onClick: handleLinkClick,
      },
    ],
    [formatMessage, projectSlug, organizationSlug, handleLinkClick],
  );

  const actions = useMemo((): ActionItem[] => {
    const projectUserRoles = { ...roles, projectRole };
    const isAssigned = !!projectRole;

    return [
      {
        label: formatMessage(COMMON_LOCALE_KEYS.RENAME),
        onClick: handleRenameProjectClick,
        hasPermission: canRenameProject(projectUserRoles),
      },
      {
        label: formatMessage(messages.actionInviteUser),
        onClick: () => {},
        hasPermission: canInviteUserToProject(projectUserRoles),
      },
      {
        label: isAssigned
          ? formatMessage(COMMON_LOCALE_KEYS.UNASSIGN)
          : formatMessage(COMMON_LOCALE_KEYS.ASSIGN),
        onClick: isAssigned ? handleUnassignClick : handleAssignClick,
        hasPermission: canAssignUnassignInternalUser(roles),
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        onClick: handleDeleteProjectClick,
        hasPermission: canDeleteProject(projectUserRoles),
        danger: true,
      },
    ];
  }, [
    roles,
    projectRole,
    formatMessage,
    handleRenameProjectClick,
    handleDeleteProjectClick,
    handleAssignClick,
    handleUnassignClick,
  ]);

  return <ActionMenu links={links} actions={actions} showDivider={true} />;
};
