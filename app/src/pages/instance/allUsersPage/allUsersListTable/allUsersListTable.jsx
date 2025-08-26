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

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { userInfoSelector } from 'controllers/user';
import { getRoleBadgesData } from 'common/utils/permissions/getRoleTitle';
import { UserNameCell } from 'pages/common/membersPage/userNameCell/userNameCell';
import { ACCOUNT_TYPE_DISPLAY_MAP } from 'common/constants/accountType';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGINATION, PAGE_KEY } from 'controllers/pagination';
import { fetchAllUsersAction } from 'controllers/instance/allUsers';
import { useTracking } from 'react-tracking';
import { MembersListTable } from 'pages/common/users/membersListTable';
import { messages } from 'pages/common/users/membersListTable/messages';
import { canUpdateUserInstanceRole } from 'common/utils/permissions';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { UpdateUserInstanceRole } from './updateUserInstanceRole';
import { DeleteUser } from './deleteUser';
import styles from './allUsersListTable.scss';

const cx = classNames.bind(styles);

const getDisplayAccountType = (accountType) => ACCOUNT_TYPE_DISPLAY_MAP[accountType] || accountType;

export const AllUsersListTable = ({
  users,
  onChangeSorting,
  sortingDirection,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const currentUser = useSelector(userInfoSelector);
  const { trackEvent } = useTracking();

  const renderRowActions = ({ userId, email, fullName, instanceRole, isCurrentUser }) => {
    const actions = [];

    if (canUpdateUserInstanceRole && !isCurrentUser) {
      actions.push(
        <UpdateUserInstanceRole
          key="update-role"
          email={email}
          fullName={fullName}
          instanceRole={instanceRole}
          className={cx('menu-item')}
        />,
      );
    }

    if (!isCurrentUser) {
      actions.push(
        <DeleteUser
          key="delete-user"
          fullName={fullName}
          userId={userId}
          className={cx('delete-user-item')}
        />,
      );
    }

    return (
      <Popover
        className={cx('popover')}
        placement={'bottom-end'}
        content={<div className={cx('row-action-menu')}>{actions.map((action) => action)}</div>}
      >
        <i className={cx('menu-icon')}>
          <MeatballMenuIcon />
        </i>
      </Popover>
    );
  };

  const data = useMemo(
    () =>
      users.map((user) => {
        const organizationsCount = Object.keys(user.organizations || {}).length;
        const isCurrentUser = user.id === currentUser.id;
        const memberBadges = getRoleBadgesData(user.instance_role, null, isCurrentUser);

        return {
          id: user.id,
          full_name: {
            content: user.full_name,
            component: (
              <UserNameCell userId={user.id} fullName={user.full_name} badges={memberBadges} />
            ),
          },
          email: user.email,
          lastLogin: {
            content: user.last_login_at,
            component: user.last_login_at ? (
              <AbsRelTime startTime={user.last_login_at} customClass={cx('date')} />
            ) : (
              <span>n/a</span>
            ),
          },
          accountType: getDisplayAccountType(user.account_type),
          organizations: organizationsCount,
          metaData: {
            email: user.email,
            fullName: user.full_name,
            instanceRole: user.instance_role,
            isCurrentUser,
            userId: user.id,
          },
        };
      }),
    [users, currentUser.id],
  );

  const primaryColumn = {
    key: 'full_name',
    header: formatMessage(messages.name),
  };

  const fixedColumns = [
    {
      key: 'email',
      header: formatMessage(messages.email),
      width: 208,
      align: 'left',
    },
    {
      key: 'lastLogin',
      header: formatMessage(messages.lastLogin),
      width: 156,
      align: 'left',
    },
    {
      key: 'accountType',
      header: formatMessage(messages.type),
      width: 114,
      align: 'left',
    },
    {
      key: 'organizations',
      header: formatMessage(messages.organizations),
      width: 104,
      align: 'right',
    },
  ];

  const onTableSorting = ({ key }) => {
    onChangeSorting(key);
    dispatch(fetchAllUsersAction());
    trackEvent(ALL_USERS_PAGE_EVENTS.SORTING);
  };

  return (
    <MembersListTable
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      onTableSorting={onTableSorting}
      showPagination={itemCount > 0}
      sortingDirection={sortingDirection}
      pageSize={pageSize}
      activePage={activePage}
      itemCount={itemCount}
      pageCount={pageCount}
      onChangePage={onChangePage}
      onChangePageSize={onChangePageSize}
      renderRowActions={renderRowActions}
    />
  );
};

AllUsersListTable.propTypes = {
  users: PropTypes.array,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageSize: PropTypes.func.isRequired,
};

AllUsersListTable.defaultProps = {
  users: [],
  pageSize: DEFAULT_PAGE_SIZE,
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
};
