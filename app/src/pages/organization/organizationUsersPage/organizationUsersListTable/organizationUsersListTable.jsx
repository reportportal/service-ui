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
import { FormattedMessage, useIntl } from 'react-intl';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AbsRelTime } from 'components/main/absRelTime';
import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_SORT_COLUMN } from 'controllers/members/constants';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION,
  PAGE_KEY,
  withPagination,
} from 'controllers/pagination';
import {
  prepareActiveOrganizationUsersAction,
  usersPaginationSelector,
} from 'controllers/organization/users';
import { SORTING_KEY } from 'controllers/organization/projects';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { MembersListTable } from '../../common/membersPage/membersListTable';
import { messages } from '../../common/membersPage/messages';
import styles from './organizationUsersListTable.scss';

const cx = classNames.bind(styles);

const OrgTeamListTableWrapped = ({
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
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const showPagination = users.length > 0;
  const data = useMemo(
    () =>
      users.map(
        ({
          id,
          email,
          full_name: fullName,
          stats,
          instance_role: instanceRole,
          last_login_at: lastLogin,
          org_role: orgRole,
        }) => {
          const projectsCount = stats.project_stats.total_count;
          return {
            id,
            fullName: {
              content: fullName,
              component: (
                <div className={cx('member-name-column')}>
                  <div className={cx('full-name')}>{fullName}</div>
                  {instanceRole === ADMINISTRATOR && (
                    <div className={cx('admin-badge')}>
                      <FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} />
                    </div>
                  )}
                </div>
              ),
            },
            email,
            lastLogin: {
              content: lastLogin,
              component: lastLogin ? (
                <AbsRelTime startTime={lastLogin} customClass={cx('date')} />
              ) : (
                <span>n/a</span>
              ),
            },
            permissions: orgRole,
            projects: projectsCount,
          };
        },
      ),
    [users, organizationSlug, projectSlug],
  );

  const primaryColumn = {
    key: 'fullName',
    header: formatMessage(messages.name),
  };

  const fixedColumns = useMemo(
    () => [
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
        key: 'permissions',
        header: formatMessage(messages.role),
        width: 114,
        align: 'left',
      },
      {
        key: 'projects',
        header: formatMessage(messages.projects),
        width: 104,
        align: 'right',
      },
    ],
    [formatMessage],
  );

  const rowActionMenu = (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('row-action-menu')}>
          <p>Manage assignments</p>
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
    dispatch(prepareActiveOrganizationUsersAction());
  };

  return (
    <MembersListTable
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      onTableSorting={onTableSorting}
      showPagination={showPagination}
      rowActionMenu={rowActionMenu}
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

OrgTeamListTableWrapped.propTypes = {
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

OrgTeamListTableWrapped.defaultProps = {
  users: [],
  pageSize: DEFAULT_PAGE_SIZE,
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
};

export const OrganizationTeamListTable = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
})(
  withPagination({
    paginationSelector: usersPaginationSelector,
  })(OrgTeamListTableWrapped),
);
