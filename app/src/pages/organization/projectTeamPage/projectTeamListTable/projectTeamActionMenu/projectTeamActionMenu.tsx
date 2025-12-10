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
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { idSelector } from 'controllers/user';
import { redirect } from 'redux-first-router';
import { canAssignUnassignInternalUser } from 'common/utils/permissions/permissions';
import { urlOrganizationSlugSelector, userRolesSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { ActionMenu } from 'components/actionMenu';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { UnassignProjectModal } from 'pages/inside/common/assignments/unassignProjectModal';
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
import { MANAGER } from 'common/constants/projectRoles';

interface User {
  id: number;
  fullName: string;
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

  const actions = useMemo(() => {
    return [
      {
        label: formatMessage(COMMON_LOCALE_KEYS.UNASSIGN),
        onClick: handleUnassignClick,
        hasPermission: canAssignUnassignInternalUser(roles),
      },
    ];
  }, [roles, formatMessage, handleUnassignClick]);

  return <ActionMenu actions={actions} />;
};
