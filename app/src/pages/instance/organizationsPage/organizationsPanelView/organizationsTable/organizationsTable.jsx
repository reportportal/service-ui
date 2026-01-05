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
import { Table } from '@reportportal/ui-kit';
import { NavLink } from 'components/main/navLink';
import { ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { userRolesSelector } from 'controllers/pages';
import { assignedOrganizationsSelector } from 'controllers/user';
import { AbsRelTime } from 'components/main/absRelTime';
import { MANAGER } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { useTracking } from 'react-tracking';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import {
  ORGANIZATIONS_DEFAULT_SORT_COLUMN,
  SortingFields,
} from 'controllers/instance/organizations/constants';
import { canWorkWithOrganizationsSorting } from 'common/utils/permissions';
import { SORTING_ASC } from 'controllers/sorting';
import { IconsBlock } from '../iconsBlock';
import { MeatballMenu } from '../meatballMenu';
import { messages } from '../../messages';
import styles from './organizationsTable.scss';

const cx = classNames.bind(styles);

export const OrganizationsTable = ({
  organizationsList,
  sortingColumn,
  sortingDirection,
  onChangeSorting,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { userRole } = useSelector(userRolesSelector);
  const assignedOrganizations = useSelector(assignedOrganizationsSelector);

  const data = useMemo(
    () =>
      organizationsList.map((organization) => {
        const { id, name, relationships, type, slug } = organization;
        const lastLaunch = relationships.launches.meta.last_occurred_at;
        const hasPermission =
          userRole === ADMINISTRATOR || assignedOrganizations[slug]?.organizationRole === MANAGER;

        const mainColumns = {
          id,
          metaData: organization,
          [SortingFields.NAME]: {
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
          [SortingFields.PROJECTS]: '',
          [SortingFields.USERS]: '',
          launchesCount: '',
          [SortingFields.LAST_LAUNCH_DATE]: '',
        };

        return {
          ...mainColumns,
          ...(hasPermission
            ? {
                [SortingFields.PROJECTS]: relationships.projects.meta.count,
                [SortingFields.USERS]: relationships.users.meta.count,
                launchesCount: relationships.launches.meta.count,
                [SortingFields.LAST_LAUNCH_DATE]: {
                  content: lastLaunch,
                  component: lastLaunch ? (
                    <AbsRelTime startTime={lastLaunch} customClass={cx('date')} />
                  ) : (
                    <span>n/a</span>
                  ),
                },
              }
            : {}),
        };
      }),
    [organizationsList, userRole, assignedOrganizations],
  );

  const primaryColumn = {
    key: SortingFields.NAME,
    header: formatMessage(messages.organizationName),
  };

  const fixedColumns = [
    {
      key: SortingFields.PROJECTS,
      header: formatMessage(messages.projects),
      width: 100,
      align: 'right',
    },
    {
      key: SortingFields.USERS,
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
      key: SortingFields.LAST_LAUNCH_DATE,
      header: formatMessage(messages.lastLaunchDate),
      width: 156,
      align: 'left',
    },
  ];

  const renderRowActions = (data) => {
    return <MeatballMenu organization={data} />;
  };

  const getSortingColumn = (key) => {
    if (key === SortingFields.NAME) {
      return primaryColumn;
    }

    return fixedColumns.find((column) => column.key === key) || null;
  };

  const getSortableColumns = () => {
    if (canWorkWithOrganizationsSorting({ userRole })) {
      return Object.values(SortingFields);
    }

    return [];
  };

  const handleChangeSorting = ({ key }) => {
    onChangeSorting(key);
    trackEvent(ORGANIZATION_PAGE_EVENTS.organizationsSorting(key, true));
  };

  return (
    <div className={cx('table-container')}>
      <Table
        headerClassName={cx('table-header')}
        data={data}
        primaryColumn={primaryColumn}
        fixedColumns={fixedColumns}
        renderRowActions={renderRowActions}
        sortingColumn={getSortingColumn(sortingColumn)}
        sortingDirection={sortingDirection}
        sortableColumns={getSortableColumns()}
        onChangeSorting={handleChangeSorting}
      />
    </div>
  );
};

OrganizationsTable.propTypes = {
  organizationsList: PropTypes.array,
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
};

OrganizationsTable.defaultProps = {
  organizationsList: [],
  sortingColumn: ORGANIZATIONS_DEFAULT_SORT_COLUMN,
  sortingDirection: SORTING_ASC,
  onChangeSorting: () => {},
};
