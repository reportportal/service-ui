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
import { activeProjectKeySelector, userRolesSelector } from 'controllers/user';
import { AbsRelTime } from 'components/main/absRelTime';
import { MeatballMenuIcon, Popover, Table } from '@reportportal/ui-kit';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_SORT_COLUMN } from 'controllers/members/constants';
import { fetchMembersAction } from 'controllers/members';
import { canSeeEmailMembers, getRoleTitle } from 'common/utils/permissions';
import { canSeeRowActionMenu } from 'common/utils/permissions/permissions';
import { messages } from './messages';
import styles from './projectTeamListTable.scss';

const cx = classNames.bind(styles);

export const ProjectTeamListTableWrapped = ({ members, onChangeSorting, sortingDirection }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const userRoles = useSelector(userRolesSelector);

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
          const projectRole = assignedProjects?.[projectSlug]?.projectRole;

          return {
            id,
            fullName: {
              content: fullName,
              component: (
                <div className={cx('member-name-column')}>
                  <UserAvatar
                    className={cx('custom-user-avatar')}
                    projectKey={activeProjectKey}
                    userId={userId}
                  />
                  <div className={cx('full-name')}>{fullName}</div>
                </div>
              ),
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
            permissions: formatMessage(getRoleTitle(userRole, organizationRole, projectRole)),
          };
        },
      ),
    [members, activeProjectKey, organizationSlug, projectSlug],
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
      width: 138,
      align: 'left',
    },
    {
      key: 'permissions',
      header: formatMessage(messages.permissions),
      width: 114,
      align: 'left',
    },
  );

  const rowActionMenu = (
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

    if (key === 'fullName') {
      dispatch(fetchMembersAction());
    }
  };

  return (
    <Table
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      rowActionMenu={canSeeRowActionMenu(userRoles) ? rowActionMenu : null}
      className={cx('project-team-list-table')}
      sortingColumn={primaryColumn}
      sortingDirection={sortingDirection.toLowerCase()}
      onChangeSorting={onTableSorting}
    />
  );
};

ProjectTeamListTableWrapped.propTypes = {
  members: PropTypes.array,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
};

ProjectTeamListTableWrapped.defaultProps = {
  members: [],
};

export const ProjectTeamListTable = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
})(ProjectTeamListTableWrapped);
