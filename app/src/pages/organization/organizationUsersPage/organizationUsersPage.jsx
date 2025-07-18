/*
 * Copyright 2024 EPAM Systems
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
import classNames from 'classnames/bind';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import {
  fetchOrganizationUsersAction,
  loadingSelector,
  usersSelector,
} from 'controllers/organization/users';
import { OrganizationTeamListTable } from 'pages/organization/organizationUsersPage/organizationUsersListTable/organizationUsersListTable';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { InviteUserModal, Level } from 'pages/inside/common/invitations/inviteUserModal';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { userRolesSelector } from 'controllers/pages';
import { canInviteUserToOrganization } from 'common/utils/permissions';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { messages } from '../common/membersPage/membersPageHeader/messages';
import { EmptyMembersPageState as EmptyUsersPageState } from '../common/membersPage/emptyMembersPageState';
import { OrganizationUsersPageHeader } from './organizationUsersPageHeader';
import styles from './organizationUsersPage.scss';

const cx = classNames.bind(styles);

export const OrganizationUsersPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const users = useSelector(usersSelector);
  const organizationId = useSelector(activeOrganizationIdSelector);
  const isUsersLoading = useSelector(loadingSelector);
  const [searchValue, setSearchValue] = useState(null);
  const isEmptyUsers = users.length === 0;
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canInviteUserToOrganization(userRoles);

  const onInvite = (withProject) => {
    dispatch(fetchOrganizationUsersAction(organizationId));
    trackEvent(ORGANIZATION_PAGE_EVENTS.inviteUser(withProject));
  };

  const showInviteUserModal = () => {
    dispatch(
      showModalAction({
        component: <InviteUserModal level={Level.ORGANIZATION} onInvite={onInvite} />,
      }),
    );
  };

  const getEmptyPageState = () => {
    return searchValue === null ? (
      <EmptyUsersPageState isLoading={isUsersLoading} isNotEmpty={!isEmptyUsers} hasPermission />
    ) : (
      <EmptyPageState
        label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
        description={formatMessage(messages.noResultsDescription)}
        emptyIcon={NoResultsIcon}
        hasPermission={false}
      />
    );
  };

  return (
    <ScrollWrapper>
      <div className={cx('organization-users-page')}>
        <OrganizationUsersPageHeader
          hasPermission={hasPermission}
          isUsersLoading={isUsersLoading}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onInvite={showInviteUserModal}
        />
        {isEmptyUsers ? getEmptyPageState() : <OrganizationTeamListTable users={users} />}
      </div>
    </ScrollWrapper>
  );
};
