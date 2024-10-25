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

import { useSelector } from 'react-redux';
import { loadingSelector, usersSelector } from 'controllers/organization/users';
import { OrganizationTeamListTable } from 'pages/organization/organizationUsersPage/organizationUsersListTable/organizationUsersListTable';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import classNames from 'classnames/bind';
import styles from './organizationUsersPage.scss';
import { EmptyMembersPageState as EmptyUsersPageState } from '../common/membersPage/emptyMembersPageState';
import { OrganizationUsersPageHeader } from './organizationUsersPageHeader';

const cx = classNames.bind(styles);

export const OrganizationUsersPage = () => {
  const users = useSelector(usersSelector);
  const isUsersLoading = useSelector(loadingSelector);
  const isEmptyUsers = users.length === 0;

  return (
    <ScrollWrapper>
      <div className={cx('organization-users-page')}>
        <OrganizationUsersPageHeader isNotEmpty={!isEmptyUsers} />
        {isEmptyUsers ? (
          <EmptyUsersPageState
            isLoading={isUsersLoading}
            isNotEmpty={!isEmptyUsers}
            hasPermission
          />
        ) : (
          <OrganizationTeamListTable users={users} />
        )}
      </div>
    </ScrollWrapper>
  );
};
