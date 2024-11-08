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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { MeatballMenuIcon, Popover, Table } from '@reportportal/ui-kit';
import { NavLink } from 'components/main/navLink';
import { ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { userRolesSelector } from 'controllers/pages';
import { assignedOrganizationsSelector } from 'controllers/user';
import { AbsRelTime } from 'components/main/absRelTime';
import { MANAGER } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { IconsBlock } from '../iconsBlock';
import styles from './organizationsTable.scss';
import { messages } from '../../messages';

const cx = classNames.bind(styles);

export const OrganizationsTable = ({ organizationsList }) => {
  const { formatMessage } = useIntl();
  const { userRole } = useSelector(userRolesSelector);
  const assignedOrganizations = useSelector(assignedOrganizationsSelector);

  const data = useMemo(
    () =>
      organizationsList.map(({ id, name, relationships, type, slug }) => {
        const lastLaunch = relationships.launches.meta.last_occurred_at;
        const hasPermission =
          userRole === ADMINISTRATOR || assignedOrganizations[slug]?.organizationRole === MANAGER;

        return {
          id,
          name: {
            content: name,
            component: (
              <div className={cx('name-column')}>
                <NavLink
                  to={{
                    type: ORGANIZATION_PROJECTS_PAGE,
                    payload: { organizationSlug: slug },
                  }}
                  className={cx('organization-link')}
                  title={name}
                >
                  {name}
                </NavLink>
                <IconsBlock
                  lastLaunchDate={lastLaunch}
                  hasPermission={hasPermission}
                  organizationType={type}
                />
              </div>
            ),
          },
          projectsCount: relationships.projects.meta.count,
          usersCount: relationships.users.meta.count,
          launchesCount: relationships.launches.meta.count,
          lastLaunch: {
            content: lastLaunch,
            component: lastLaunch ? (
              <AbsRelTime startTime={lastLaunch} customClass={cx('date')} />
            ) : (
              <span>n/a</span>
            ),
          },
        };
      }),
    [organizationsList, assignedOrganizations],
  );

  const primaryColumn = {
    key: 'name',
    header: formatMessage(messages.organizationName),
  };

  const fixedColumns = [
    {
      key: 'projectsCount',
      header: formatMessage(messages.projects),
      width: 100,
      align: 'right',
    },
    {
      key: 'usersCount',
      header: formatMessage(messages.users),
      width: 100,
      align: 'right',
    },
    {
      key: 'launchesCount',
      header: formatMessage(messages.launches),
      width: 100,
      align: 'right',
    },
    {
      key: 'lastLaunch',
      header: formatMessage(messages.lastLaunchDate),
      width: 156,
      align: 'left',
    },
  ];

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

  return (
    <div className={cx('table-container')}>
      <Table
        data={data}
        primaryColumn={primaryColumn}
        fixedColumns={fixedColumns}
        renderRowActions={renderRowActions}
        sortableColumns={[]}
      />
    </div>
  );
};

OrganizationsTable.propTypes = {
  organizationsList: PropTypes.array,
};

OrganizationsTable.defaultProps = {
  organizationsList: [],
};
