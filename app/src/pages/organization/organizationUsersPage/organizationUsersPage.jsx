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

import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import {
  fetchOrganizationUsersAction,
  loadingSelector,
  usersSelector,
  usersPaginationSelector,
} from 'controllers/organization/users';
import { NAMESPACE, SORTING_KEY } from 'controllers/organization/users/constants';
import { withPagination } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import { DEFAULT_SORT_COLUMN } from 'controllers/members/constants';
import { OrganizationTeamListTable } from 'pages/organization/organizationUsersPage/organizationUsersListTable/organizationUsersListTable';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import {
  activeOrganizationSelector,
  fetchOrganizationBySlugAction,
} from 'controllers/organization';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { InviteUserModal, Level } from 'pages/inside/common/invitations/inviteUserModal';
import { messages } from '../messages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { EmptyMembersPageState as EmptyUsersPageState } from '../common/membersPage/emptyMembersPageState';
import { OrganizationUsersPageHeader } from './organizationUsersPageHeader';
import styles from './organizationUsersPage.scss';

const cx = classNames.bind(styles);

const OrganizationUsersPageComponent = ({
  sortingDirection,
  onChangeSorting,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const users = useSelector(usersSelector);
  const { id: organizationId, slug: organizationSlug } = useSelector(activeOrganizationSelector);
  const isUsersLoading = useSelector(loadingSelector);
  const [searchValue, setSearchValue] = useState(null);
  const isEmptyUsers = users.length === 0;
  const { canInviteUserToOrganization } = useUserPermissions();

  useEffect(() => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.VIEW_ORGANIZATION_USERS);
  }, [trackEvent]);

  const onInvite = (withProject) => {
    dispatch(fetchOrganizationUsersAction(organizationId));
    dispatch(fetchOrganizationBySlugAction(organizationSlug));
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
      <EmptyUsersPageState
        isLoading={isUsersLoading}
        isNotEmpty={!isEmptyUsers}
        hasPermission={canInviteUserToOrganization}
        showInviteUserModal={showInviteUserModal}
      />
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
          hasPermission={canInviteUserToOrganization}
          isUsersLoading={isUsersLoading}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onInvite={showInviteUserModal}
        />
        {isEmptyUsers ? (
          getEmptyPageState()
        ) : (
          <OrganizationTeamListTable
            users={users}
            sortingDirection={sortingDirection}
            onChangeSorting={onChangeSorting}
            pageSize={pageSize}
            activePage={activePage}
            itemCount={itemCount}
            pageCount={pageCount}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        )}
      </div>
    </ScrollWrapper>
  );
};

OrganizationUsersPageComponent.propTypes = {
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};

export const OrganizationUsersPage = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: usersPaginationSelector,
    namespace: NAMESPACE,
  })(OrganizationUsersPageComponent),
);
