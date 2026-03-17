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

import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useBulkPanelCaptions } from 'common/hooks';
import {
  loadingSelector,
  allUsersSelector,
  allUsersPaginationSelector,
  fetchAllUsersAction,
} from 'controllers/instance/allUsers';
import {
  NAMESPACE,
  DEFAULT_SORT_COLUMN,
  SORTING_KEY,
} from 'controllers/instance/allUsers/constants';
import { withPagination } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import { showModalAction } from 'controllers/modal';
import classNames from 'classnames/bind';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { InviteUserModalInstance } from './allUsersHeader/inviteUserModal';
import { AllUsersHeader } from './allUsersHeader';
import { AllUsersListTable } from './allUsersListTable';
import { useDeleteUsersAction } from './hooks/useDeleteUsersAction';
import styles from './allUsersPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noResultsDescription: {
    id: 'AllUsersPage.noResultsDescription',
    defaultMessage: `Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.`,
  },
});

const AllUsersPageComponent = ({
  sortingDirection,
  onChangeSorting,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const users = useSelector(allUsersSelector);
  const isLoading = useSelector(loadingSelector);
  const { canDeleteUser } = useUserPermissions();
  const [searchValue, setSearchValue] = useState(null);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleBulkActionSuccess = useCallback(() => {
    setSelectedUsers([]);
    dispatch(fetchAllUsersAction());
  }, [dispatch]);

  const deleteAction = useDeleteUsersAction({ onSuccess: handleBulkActionSuccess });
  const bulkActions = useMemo(() => [deleteAction], [deleteAction]);
  const bulkPanelCaptions = useBulkPanelCaptions();

  const bulkPanelItems = useMemo(
    () => selectedUsers.map((user) => ({ id: user.id, name: user.full_name })),
    [selectedUsers],
  );

  const handleToggleUserSelection = useCallback((user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      return isSelected ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
  }, []);

  const handleToggleAllUsersSelection = useCallback(
    (selectableUserIds) => {
      const allUsersSelected = (selectedUsers) =>
        selectableUserIds.every((id) => selectedUsers.some((u) => u.id === id));
      const newUsersSelected = (selectedUsers) =>
        users.filter(
          (u) => selectableUserIds.includes(u.id) && !selectedUsers.some((s) => s.id === u.id),
        );

      setSelectedUsers((prev) => {
        const allSelected = allUsersSelected(prev);
        if (allSelected) {
          return prev.filter((u) => !selectableUserIds.includes(u.id));
        }
        const newUsers = newUsersSelected(prev);
        return [...prev, ...newUsers];
      });
    },
    [users],
  );

  const handleRemoveBulkItem = useCallback((id) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const onInvite = (condition) => {
    dispatch(fetchAllUsersAction());
    trackEvent(ALL_USERS_PAGE_EVENTS.inviteUser(condition));
  };

  const showInviteUserModal = () => {
    dispatch(
      showModalAction({
        component: <InviteUserModalInstance onInvite={onInvite} />,
      }),
    );
  };

  const bulkPanelProps = useMemo(
    () =>
      canDeleteUser && selectedUsers.length > 0
        ? {
            items: bulkPanelItems,
            actions: bulkActions,
            captions: bulkPanelCaptions,
            onRemoveItem: handleRemoveBulkItem,
            onClearSelection: handleClearSelection,
          }
        : null,
    [
      canDeleteUser,
      selectedUsers.length,
      bulkPanelItems,
      bulkActions,
      bulkPanelCaptions,
      handleRemoveBulkItem,
      handleClearSelection,
    ],
  );

  return (
    <div className={cx('all-users-page')}>
      <AllUsersHeader
        isLoading={isLoading}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        appliedFiltersCount={appliedFiltersCount}
        setAppliedFiltersCount={setAppliedFiltersCount}
        onInvite={showInviteUserModal}
      />
      {itemCount === 0 && !isLoading ? (
        <EmptyPageState
          label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
          description={formatMessage(messages.noResultsDescription)}
          emptyIcon={NoResultsIcon}
        />
      ) : (
        <AllUsersListTable
          users={users}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          pageSize={pageSize}
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
          selectable={!!canDeleteUser}
          selectedUsers={selectedUsers}
          onToggleUserSelection={handleToggleUserSelection}
          onToggleAllUsersSelection={handleToggleAllUsersSelection}
          bulkPanelProps={bulkPanelProps}
        />
      )}
    </div>
  );
};

AllUsersPageComponent.propTypes = {
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};

export const AllUsersPage = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: allUsersPaginationSelector,
    namespace: NAMESPACE,
  })(AllUsersPageComponent),
);
