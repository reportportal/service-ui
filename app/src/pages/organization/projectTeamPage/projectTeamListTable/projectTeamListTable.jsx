/*!
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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeProjectKeySelector, userIdSelector } from 'controllers/user';
import { AbsRelTime } from 'components/main/absRelTime';
import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { urlOrganizationSlugSelector, userRolesSelector } from 'controllers/pages';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_SORT_COLUMN, NAMESPACE } from 'controllers/members/constants';
import { fetchMembersAction, membersPaginationSelector } from 'controllers/members';
import { canSeeEmailMembers, getRoleTitle, getRoleBadgesData } from 'common/utils/permissions';
import { projectKeySelector } from 'controllers/project';
import { canSeeRowActionMenu } from 'common/utils/permissions/permissions';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION,
  PAGE_KEY,
  withPagination,
} from 'controllers/pagination';
import { UserNameCell } from 'pages/common/membersPage/userNameCell/userNameCell';
import { messages } from '../../../common/users/membersListTable/messages';
import styles from './projectTeamListTable.scss';
import { MembersListTable } from '../../../common/users/membersListTable';

const cx = classNames.bind(styles);

const ProjectTeamListTableWrapped = ({
  members,
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
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectKey = useSelector(projectKeySelector);
  const userRoles = useSelector(userRolesSelector);
  const currentUserId = useSelector(userIdSelector);

  const data = useMemo(
    () =>
      members.map(
        ({
          email,
          fullName,
          id,
          metadata,
          userRole,
          userId,
          assignedOrganizations,
          assignedProjects,
        }) => {
          const organizationRole = assignedOrganizations?.[organizationSlug]?.organizationRole;
          const projectRole = assignedProjects?.[projectKey]?.projectRole;
          const memberBadges = getRoleBadgesData(
            userRole,
            organizationRole,
            currentUserId === userId,
          );
          return {
            id,
            fullName: {
              content: fullName,
              component: <UserNameCell userId={id} fullName={fullName} badges={memberBadges} />,
            },
            email,
            lastLogin: {
              content: metadata.last_login,
              component: metadata.last_login ? (
                <AbsRelTime startTime={metadata.last_login} customClass={cx('date')} />
              ) : (
                <span>n/a</span>
              ),
            },
            permissions: formatMessage(getRoleTitle(projectRole)),
          };
        },
      ),
    [members, activeProjectKey, organizationSlug, projectKey],
  );

  const primaryColumn = {
    key: 'fullName',
    header: formatMessage(messages.name),
  };

  const fixedColumns = [];

  if (canSeeEmailMembers(userRoles)) {
    fixedColumns.push({
      key: 'email',
      header: formatMessage(messages.email),
      width: 208,
      align: 'left',
    });
  }

  fixedColumns.push(
    {
      key: 'lastLogin',
      header: formatMessage(messages.lastLogin),
      width: 156,
      align: 'left',
    },
    {
      key: 'permissions',
      header: formatMessage(messages.permissions),
      width: 114,
      align: 'left',
    },
  );

  const renderRowActions = () => (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('row-action-menu')}>
          <p className={cx('add')}>Add</p>
          <p className={cx('remove')}>Remove</p>
        </div>
      }
    >
      <i className={cx('menu-icon')}>
        <MeatballMenuIcon />
      </i>
    </Popover>
  );

  const onTableSorting = ({ key }) => {
    onChangeSorting(key);
    dispatch(fetchMembersAction());
  };

  return (
    <MembersListTable
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      onTableSorting={onTableSorting}
      showPagination={members.length > 0}
      renderRowActions={canSeeRowActionMenu(userRoles) ? renderRowActions : null}
      sortingDirection={sortingDirection}
      pageSize={pageSize}
      activePage={activePage}
      itemCount={itemCount}
      pageCount={pageCount}
      onChangePage={onChangePage}
      onChangePageSize={onChangePageSize}
    />
  );
};

ProjectTeamListTableWrapped.propTypes = {
  members: PropTypes.array,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageSize: PropTypes.func.isRequired,
};

ProjectTeamListTableWrapped.defaultProps = {
  members: [],
  pageSize: DEFAULT_PAGE_SIZE,
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
};

export const ProjectTeamListTable = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: membersPaginationSelector,
    namespace: NAMESPACE,
  })(ProjectTeamListTableWrapped),
);
