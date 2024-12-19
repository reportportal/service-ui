import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl, defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION,
  PAGE_KEY,
  withPagination,
} from 'controllers/pagination';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import {
  DEFAULT_SORT_COLUMN,
  allUsersPaginationSelector,
  fetchAllUsersAction,
} from 'controllers/instance/allUsers';
import { MembersListTable } from 'pages/organization/common/membersPage/membersListTable';
import { MeatballMenuIcon } from '@reportportal/ui-kit';
import styles from './allUsersListTable.scss';

const cx = classNames.bind(styles);
const NAMESPACE = 'allUsers';

const messages = defineMessages({
  name: {
    id: 'AllUsersPage.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'AllUsersPage.email',
    defaultMessage: 'Email',
  },
  lastLogin: {
    id: 'AllUsersPage.lastLogin',
    defaultMessage: 'Last login',
  },
  type: {
    id: 'AllUsersPage.type',
    defaultMessage: 'Type',
  },
  organizations: {
    id: 'AllUsersPage.organizations',
    defaultMessage: 'Organizations',
  },
});

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

  const renderRowActions = () => (
    <i className={cx('menu-icon')}>
      <MeatballMenuIcon />
    </i>
  );

  const data = useMemo(
    () =>
      users.map((user) => {
        const organizationsCount = Object.keys(user.assignedOrganizations || {}).length;
        return {
          id: user.id,
          fullName: {
            content: user.fullName,
            component: (
              <div className={cx('member-name-column')}>
                <div className={cx('full-name')}>{user.fullName}</div>
                {user.userRole === ADMINISTRATOR && (
                  <div className={cx('admin-badge')}>
                    <FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} />
                  </div>
                )}
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
    [users],
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
