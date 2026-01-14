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

import { useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { redirect } from 'redux-first-router';
import { ActionMenu } from 'components/actionMenu';
import { showModalAction } from 'controllers/modal';
import { activeOrganizationSelector, Organization } from 'controllers/organization';
import { ORGANIZATIONS_PAGE, userRolesSelector } from 'controllers/pages';
import { fetchOrganizationUsersAction } from 'controllers/organization/users';
import { idSelector, UserInfo } from 'controllers/user';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import { ManageAssignmentsOrganizationModal } from 'pages/inside/common/assignments/manageAssignmentsOrganizationModal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import {
  useCanUnassignOrganization,
  UnassignOrganizationModal,
} from 'pages/inside/common/assignments';
import { useUserPermissions } from 'hooks/useUserPermissions';

interface OrganizationUsersActionMenuProps {
  user: UserInfo;
}

export const OrganizationUsersActionMenu = ({ user }: OrganizationUsersActionMenuProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const organization = useSelector(activeOrganizationSelector) as Organization;
  const currentUserId = useSelector(idSelector) as number;
  const userRoles = useSelector(userRolesSelector);
  const { canAssignUnassignInternalUser } = useUserPermissions();
  const isAdmin = userRoles.userRole === ADMINISTRATOR;
  const canUnassign = useCanUnassignOrganization();

  const onUnassign = useCallback(() => {
    dispatch(fetchOrganizationUsersAction(organization.id));

    if (currentUserId === user.id && !isAdmin) {
      dispatch(redirect({ type: ORGANIZATIONS_PAGE }));
    }
  }, [currentUserId, dispatch, organization.id, user.id, isAdmin]);

  const handleManageAssignmentsClick = useCallback(() => {
    dispatch(
      showModalAction({
        component: (
          <ManageAssignmentsOrganizationModal
            user={user}
            organization={organization}
            onUnassign={onUnassign}
          />
        ),
      }),
    );
    trackEvent(ORGANIZATION_PAGE_EVENTS.meatballMenuUsers('manage_assignments_via_menu'));
  }, [dispatch, user, organization, onUnassign, trackEvent]);

  const handleUnassignClick = useCallback(() => {
    dispatch(
      showModalAction({
        component: (
          <UnassignOrganizationModal
            user={user}
            organization={organization}
            onUnassign={() => {
              onUnassign();
              trackEvent(ORGANIZATION_PAGE_EVENTS.unassignUser(currentUserId === user.id));
            }}
          />
        ),
      }),
    );
    trackEvent(ORGANIZATION_PAGE_EVENTS.meatballMenuUsers('unassign_via_menu'));
  }, [dispatch, user, organization, trackEvent, onUnassign, currentUserId]);

  const actions = useMemo(() => {
    return [
      {
        label: formatMessage(messages.manageAssignments),
        onClick: handleManageAssignmentsClick,
        hasPermission: canAssignUnassignInternalUser,
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.UNASSIGN),
        onClick: handleUnassignClick,
        hasPermission: canUnassign(user, organization),
      },
    ];
  }, [
    canUnassign,
    formatMessage,
    handleManageAssignmentsClick,
    handleUnassignClick,
    organization,
    user,
    canAssignUnassignInternalUser,
  ]);

  return <ActionMenu actions={actions} />;
};
