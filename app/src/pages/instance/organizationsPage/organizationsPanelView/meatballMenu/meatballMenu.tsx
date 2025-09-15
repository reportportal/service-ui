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
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { useCallback, useMemo } from 'react';
import { ActionMenu } from 'components/actionMenu';
import { showModalAction } from 'controllers/modal';
import { setActiveOrganizationAction } from 'controllers/organization/actionCreators';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { ORGANIZATIONS_ACTIVITY_PAGE } from 'controllers/pages';
import {
  AssignedOrganizations,
  assignedOrganizationsSelector,
  UserInfo,
  userInfoSelector,
} from 'controllers/user';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetchFilteredOrganizationsAction } from 'controllers/instance/organizations';
import { Organization } from 'controllers/organization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import {
  useCanUnassignOrganization,
  UnassignOrganizationModal,
} from 'pages/inside/common/assignments';
import { messages } from '../../messages';

interface MeatballMenuProps {
  organization: Organization;
}

export const MeatballMenu = ({ organization }: MeatballMenuProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { canSeeActivityOption } = useUserPermissions();
  const currentUser = useSelector(userInfoSelector) as UserInfo;
  const assignedOrganizations = useSelector(assignedOrganizationsSelector) as AssignedOrganizations;
  const canUnassign = useCanUnassignOrganization();

  const isAssignedToOrganization = organization.slug in assignedOrganizations;

  const handleActivityClick = useCallback(() => {
    dispatch(setActiveOrganizationAction(organization));
    trackEvent(ORGANIZATION_PAGE_EVENTS.meatballMenu('activity_menu'));
  }, [dispatch, organization, trackEvent]);

  const onUnassign = useCallback(() => {
    dispatch(fetchFilteredOrganizationsAction());
  }, [dispatch]);

  const handleUnassignClick = useCallback(() => {
    dispatch(
      showModalAction({
        component: (
          <UnassignOrganizationModal
            user={currentUser}
            organization={organization}
            onUnassign={onUnassign}
          />
        ),
      }),
    );
    trackEvent(ORGANIZATION_PAGE_EVENTS.UNASSIGN_SELF);
  }, [dispatch, currentUser, organization, onUnassign, trackEvent]);

  const links = useMemo(
    () => [
      {
        label: formatMessage(messages.activity),
        to: {
          type: ORGANIZATIONS_ACTIVITY_PAGE,
          payload: { organizationSlug: organization?.slug },
        },
        hasPermission: canSeeActivityOption,
        onClick: handleActivityClick,
      },
    ],
    [formatMessage, organization?.slug, canSeeActivityOption, handleActivityClick],
  );

  const actions = useMemo(
    () => [
      {
        label: formatMessage(COMMON_LOCALE_KEYS.UNASSIGN),
        onClick: handleUnassignClick,
        hasPermission: isAssignedToOrganization && canUnassign(currentUser, organization),
      },
    ],
    [
      formatMessage,
      handleUnassignClick,
      isAssignedToOrganization,
      canUnassign,
      currentUser,
      organization,
    ],
  );

  return <ActionMenu links={links} actions={actions} />;
};
