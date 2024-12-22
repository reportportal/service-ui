import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import { MeatballMenuIcon, Popover, Tooltip } from '@reportportal/ui-kit';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { userInfoSelector, activeProjectKeySelector } from 'controllers/user';
import { getRoleBadgesData } from 'common/utils/permissions/getRoleTitle';
import { ADMIN_TYPE } from 'common/utils/permissions/constants';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION,
  PAGE_KEY,
  withPagination,
} from 'controllers/pagination';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import {
  DEFAULT_SORT_COLUMN,
  allUsersPaginationSelector,
  fetchAllUsersAction,
} from 'controllers/instance/allUsers';
import { MembersListTable } from 'pages/organization/common/membersPage/membersListTable';
import { messages } from 'pages/organization/common/membersPage/messages';
import styles from './allUsersListTable.scss';

const cx = classNames.bind(styles);
const NAMESPACE = 'allUsers';

const AllUsersListTableComponent = ({
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
  const activeProjectKey = useSelector(activeProjectKeySelector);

  const renderRowActions = () => (
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

  const data = useMemo(
    () =>
      users.map((user) => {
        const organizationsCount = Object.keys(user.assignedOrganizations || {}).length;
        const isCurrentUser = user.id === currentUser.id;
        const memberBadges = getRoleBadgesData(user.userRole, null, isCurrentUser);

        return {
          id: user.id,
          fullName: {
            content: user.fullName,
            component: (
              <div className={cx('member-name-column')}>
                <UserAvatar
                  className={cx('custom-user-avatar')}
                  projectKey={activeProjectKey}
                  userId={user.userId}
                />
                <div className={cx('full-name')}>{user.fullName}</div>
                <div className={cx('badges')}>
                  {memberBadges.map(({ title, type }) => {
                    const badgeContent = (
                      <div key={`${user.userId}-${type}`} className={cx('badge', type)}>
                        {formatMessage(title)}
                      </div>
                    );

                    return type === ADMIN_TYPE ? (
                      <Tooltip
                        key={`${user.userId}-${type}-tooltip`}
                        content={formatMessage(messages.adminAccessInfo)}
                        placement="top"
                        width={248}
                      >
                        {badgeContent}
                      </Tooltip>
                    ) : (
                      badgeContent
                    );
                  })}
                </div>
              </div>
            ),
          },
          email: user.email,
          lastLogin: {
            content: user.metadata?.last_login,
            component: user.metadata?.last_login ? (
              <AbsRelTime startTime={user.metadata.last_login} customClass={cx('date')} />
            ) : (
              <span>n/a</span>
            ),
          },
          accountType: user.accountType.toLowerCase(),
          organizations: organizationsCount,
        };
      }),
    [users, currentUser.id, activeProjectKey, formatMessage],
  );

  const primaryColumn = {
    key: 'fullName',
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
      header: formatMessage(messages.role),
      width: 114,
      align: 'left',
    },
    {
      key: 'organizations',
      header: formatMessage(messages.projects),
      width: 104,
      align: 'right',
    },
  ];

  const onTableSorting = ({ key }) => {
    onChangeSorting(key);
    dispatch(fetchAllUsersAction());
  };

  return (
    <MembersListTable
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      onTableSorting={onTableSorting}
      showPagination={users.length > 0}
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

AllUsersListTableComponent.propTypes = {
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

AllUsersListTableComponent.defaultProps = {
  users: [],
  pageSize: DEFAULT_PAGE_SIZE,
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
};

export const AllUsersListTable = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: allUsersPaginationSelector,
    namespace: NAMESPACE,
  })(AllUsersListTableComponent),
);
