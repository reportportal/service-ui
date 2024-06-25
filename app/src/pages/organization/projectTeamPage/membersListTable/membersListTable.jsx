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
import { useSelector } from 'react-redux';
import { activeProjectKeySelector, userRolesSelector } from 'controllers/user';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { EDITOR, MANAGER, VIEWER } from 'common/constants/projectRoles';
import { AbsRelTime } from 'components/main/absRelTime';
import { MeatballMenuIcon, Popover, Table } from '@reportportal/ui-kit';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_SORT_COLUMN } from 'controllers/administrate/allUsers';
import { messages } from './messages';
import styles from './membersListTable.scss';

const cx = classNames.bind(styles);

export const MembersListTableWrapped = ({ members }) => {
  const { formatMessage } = useIntl();
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const { userRole: role, organizationRole, projectRole } = useSelector(userRolesSelector);
  const hasPermission = role === ADMINISTRATOR || organizationRole === MANAGER;
  const isViewer = projectRole === VIEWER;

  const getPermission = (memberRole, memberOrganizationRole, memberProjectRole) => {
    if (memberRole === ADMINISTRATOR) {
      return formatMessage(messages.adminRole);
    }
    if (memberOrganizationRole === MANAGER) {
      return formatMessage(messages.managerRole);
    }
    if (memberProjectRole === EDITOR) {
      return formatMessage(messages.editorRole);
    } else {
      return formatMessage(messages.viewerRole);
    }
  };

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
          assignedOrganization,
          assignedProject,
        }) => {
          const memberOrganizationRole = assignedOrganization?.[organizationSlug]?.organizationRole;
          const memberProjectRole = assignedProject?.[projectSlug]?.projectRole;

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
            permissions: getPermission(userRole, memberOrganizationRole, memberProjectRole),
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

  if (hasPermission) {
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
      align: 'center',
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

  return (
    <Table
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      rowActionMenu={isViewer ? null : rowActionMenu}
      className={cx('members-list-table')}
    />
  );
};

MembersListTableWrapped.propTypes = {
  members: PropTypes.array,
};

MembersListTableWrapped.defaultProps = {
  members: [],
};

export const MembersListTable = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
})(MembersListTableWrapped);
