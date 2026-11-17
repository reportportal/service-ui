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

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import styles from './projectTeamActionMenu.scss';
import { idSelector } from 'controllers/user';
import { redirect } from 'redux-first-router';
import {
  canAssignUnassignInternalUser,
  canChangeUserRole,
} from 'common/utils/permissions/permissions';
import { urlOrganizationSlugSelector, userRolesSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { ActionMenu } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages as assignmentMessages } from 'common/constants/localization/assignmentsLocalization';
import { UnassignProjectModal } from 'pages/inside/common/assignments/unassignProjectModal';
import { changeProjectRoleAction } from 'controllers/organization/projects';
import {
  projectInfoIdSelector,
  projectNameSelector,
  projectKeySelector,
  fetchProjectAction,
} from 'controllers/project';
import { useTracking } from 'react-tracking';
import { PROJECT_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/projectPageEvents';
import { fetchMembersAction } from 'controllers/members';
import { ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { EDITOR, MANAGER, VIEWER } from 'common/constants/projectRoles';

const cx = createClassnames(styles);

interface User {
  id: number;
  fullName: string;
  userId: string;
  projectRole?: string;
  organizationRole?: string;
}

interface ProjectTeamActionMenuProps {
  user: User;
}

export const ProjectTeamActionMenu = ({ user }: ProjectTeamActionMenuProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const roles = useSelector(userRolesSelector);
  const currentUserId = useSelector(idSelector) as number;
  const projectId = useSelector(projectInfoIdSelector);
  const projectName = useSelector(projectNameSelector);
  const projectKey = useSelector(projectKeySelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);

  const handleUnassignClick = useCallback(() => {
    const isCurrentUser = currentUserId === user.id;
    const isAdmin = roles.userRole === ADMINISTRATOR;
    const isManager = roles.organizationRole === MANAGER;

    const onSuccess = () => {
      dispatch(fetchMembersAction());
      dispatch(fetchProjectAction(projectKey, true));
      trackEvent(PROJECT_PAGE_EVENTS.unassignUser(isCurrentUser));

      if (isCurrentUser && organizationSlug && !isAdmin && !isManager) {
        dispatch(
          redirect({
            type: ORGANIZATION_PROJECTS_PAGE,
            payload: { organizationSlug },
          }),
        );
      }
    };

    dispatch(
      showModalAction({
        component: (
          <UnassignProjectModal
            user={user}
            project={{ projectId, projectName }}
            onSuccess={onSuccess}
          />
        ),
      }),
    );
  }, [
    currentUserId,
    dispatch,
    projectId,
    projectName,
    trackEvent,
    user,
    organizationSlug,
    roles,
    projectKey,
  ]);

  const handleChangeRoleClick = useCallback(
    (newProjectRole: string) => {
      const onSuccess = () => {
        dispatch(fetchMembersAction());
        dispatch(fetchProjectAction(projectKey, true));
        if (newProjectRole === VIEWER) {
          trackEvent(PROJECT_PAGE_EVENTS.CHANGE_TO_VIEW_ONLY);
        } else if (newProjectRole === EDITOR) {
          trackEvent(PROJECT_PAGE_EVENTS.CHANGE_TO_CAN_EDIT);
        }
      };
      dispatch(
        changeProjectRoleAction(user, projectKey, newProjectRole, onSuccess),
      );
    },
    [dispatch, user, projectKey, trackEvent],
  );

  const isCurrentUser = currentUserId === user.id;
  const isTargetManager = user.organizationRole === MANAGER;
  const canShowChangeRole =
    !isCurrentUser && !isTargetManager && canChangeUserRole(roles);
  const showChangeToView = canShowChangeRole && user.projectRole === EDITOR;
  const showChangeToEdit = canShowChangeRole && user.projectRole === VIEWER;

  const items = useMemo(
    () => [
      {
        id: 'unassign',
        label: formatMessage(COMMON_LOCALE_KEYS.UNASSIGN),
        onClick: handleUnassignClick,
        hasPermission: canAssignUnassignInternalUser(roles),
      },
      ...(showChangeToView
        ? [
            {
              id: 'changeToView',
              label: formatMessage(assignmentMessages.changeToCanView),
              onClick: () => handleChangeRoleClick(VIEWER),
              hasPermission: true,
            },
          ]
        : []),
      ...(showChangeToEdit
        ? [
            {
              id: 'changeToEdit',
              label: formatMessage(assignmentMessages.changeToCanEdit),
              onClick: () => handleChangeRoleClick(EDITOR),
              hasPermission: true,
            },
          ]
        : []),
    ],
    [
    roles,
    formatMessage,
    handleUnassignClick,
    handleChangeRoleClick,
    showChangeToView,
    showChangeToEdit,
  ]);

  return (
    <ActionMenu
      items={items}
      popoverClassName={cx('popover')}
    />
  );
};
