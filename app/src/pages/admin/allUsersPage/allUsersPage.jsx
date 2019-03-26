import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { ADMIN_ALL_USERS_PAGE_MODAL_EVENTS } from 'components/main/analytics/events';
import { NoItemMessage } from 'components/main/noItemMessage';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import {
  allUsersSelector,
  allUsersPaginationSelector,
  loadingSelector,
  toggleUserSelectionAction,
  toggleAllUsersAction,
  selectedUsersSelector,
  deleteItemsAction,
  unselectAllUsersAction,
  fetchAllUsersAction,
} from 'controllers/administrate/allUsers';
import { userInfoSelector, userIdSelector } from 'controllers/user';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { UsersToolbar } from './usersToolbar';
import { AllUsersGrid } from './allUsersGrid';

const messages = defineMessages({
  pageTitle: {
    id: 'administrateUsersPage.allUsers',
    defaultMessage: 'All users',
  },
  deleteModalHeader: {
    id: 'administrateUsersPage.deleteModalHeader',
    defaultMessage: 'Delete user',
  },
  deleteModalMultipleHeader: {
    id: 'administrateUsersPage.deleteModalMultipleHeader',
    defaultMessage: "Delete user's",
  },
  deleteModalContent: {
    id: 'administrateUsersPage.deleteModalContent',
    defaultMessage: "Are you sure to delete user <b>'{name}'</b>?",
  },
  deleteModalMultipleContent: {
    id: 'administrateUsersPage.deleteModalMultipleContent',
    defaultMessage: 'Are you sure to delete users? <br> <b>{names}</b>',
  },
  success: {
    id: 'administrateUsersPage.success',
    defaultMessage: 'User was deleted',
  },
  successMultiple: {
    id: 'administrateUsersPage.successMultiple',
    defaultMessage: "User's were deleted",
  },
  error: {
    id: 'administrateUsersPage.error',
    defaultMessage: 'Error when deleting user',
  },
  errorMultiple: {
    id: 'administrateUsersPage.errorMultiple',
    defaultMessage: "Error when deleting user's",
  },
});

@connect(
  (state) => ({
    url: URLS.allUsers(state),
    users: allUsersSelector(state),
    loading: loadingSelector(state),
    selectedUsers: selectedUsersSelector(state),
    userInfo: userInfoSelector(state),
    userId: userIdSelector(state),
  }),
  {
    toggleUserSelectionAction,
    toggleAllUsersAction,
    deleteItemsAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    unselectAllUsersAction,
    fetchAllUsersAction,
  },
)
@withPagination({
  paginationSelector: allUsersPaginationSelector,
})
@injectIntl
export class AllUsersPage extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    users: PropTypes.arrayOf(PropTypes.object),
    selectedUsers: PropTypes.arrayOf(PropTypes.object),
    intl: intlShape.isRequired,
    toggleAllUsersAction: PropTypes.func,
    unselectAllUsersAction: PropTypes.func,
    toggleUserSelectionAction: PropTypes.func,
    userInfo: PropTypes.object,
    deleteItemsAction: PropTypes.func,
    userId: PropTypes.string,
    showScreenLockAction: PropTypes.func,
    hideScreenLockAction: PropTypes.func,
    showNotification: PropTypes.func,
    fetchAllUsersAction: PropTypes.func,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    userId: '',
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    users: [],
    selectedUsers: [],
    toggleAllUsersAction: () => {},
    unselectAllUsersAction: () => {},
    toggleUserSelectionAction: () => {},
    userInfo: {},
    deleteItemsAction: () => {},
    showScreenLockAction: () => {},
    hideScreenLockAction: () => {},
    showNotification: () => {},
    fetchAllUsersAction: () => {},
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(messages.pageTitle),
    },
  ];
  get excludeFromSelection() {
    const { userInfo } = this.props;
    return [userInfo];
  }
  get selectedUsersNames() {
    return this.props.selectedUsers.map((user) => `"${user.fullName}"`).join(', ');
  }
  get usersAvailableForSelection() {
    const {
      users,
      userInfo: { id },
    } = this.props;
    return users.filter((user) => user.id !== id);
  }
  handleOneUserSelection = (value) => {
    this.props.toggleUserSelectionAction(value);
  };
  handleToggleAllUserSelection = () => {
    const users = this.usersAvailableForSelection;
    this.props.toggleAllUsersAction(users);
  };
  confirmDeleteItems = (items) => {
    const ids = items.map((item) => item.id);
    this.props.showScreenLockAction();
    fetch(URLS.user(), {
      method: 'delete',
      data: {
        ids,
      },
    })
      .then(() => {
        this.props.unselectAllUsersAction();
        this.props.fetchAllUsersAction();
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            items.length === 1
              ? this.props.intl.formatMessage(messages.success)
              : this.props.intl.formatMessage(messages.successMultiple),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            items.length === 1
              ? this.props.intl.formatMessage(messages.error)
              : this.props.intl.formatMessage(messages.errorMultiple),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  handlerDelete = () => {
    const { selectedUsers, intl } = this.props;
    this.props.deleteItemsAction(this.props.selectedUsers, {
      onConfirm: this.confirmDeleteItems,
      header:
        selectedUsers.length === 1
          ? intl.formatMessage(messages.deleteModalHeader)
          : intl.formatMessage(messages.deleteModalMultipleHeader),
      mainContent:
        selectedUsers.length === 1
          ? intl.formatMessage(messages.deleteModalContent, { name: this.selectedUsersNames })
          : intl.formatMessage(messages.deleteModalMultipleContent, {
              names: this.selectedUsersNames,
            }),
      eventsInfo: {
        closeIcon: ADMIN_ALL_USERS_PAGE_MODAL_EVENTS.CLOSE_ICON_DELETE_MODAL,
        cancelBtn: ADMIN_ALL_USERS_PAGE_MODAL_EVENTS.CANCEL_BTN_DELETE_MODAL,
        deleteBtn: ADMIN_ALL_USERS_PAGE_MODAL_EVENTS.DELETE_BTN_DELETE_MODAL,
      },
    });
  };
  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      users,
      selectedUsers,
      intl,
    } = this.props;
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <UsersToolbar onDelete={this.handlerDelete} selectedUsers={selectedUsers} />
          <AllUsersGrid
            data={users}
            loading={loading}
            selectedItems={selectedUsers}
            onToggleSelection={this.handleOneUserSelection}
            excludeFromSelection={this.excludeFromSelection}
            onToggleSelectAll={this.handleToggleAllUserSelection}
          />
          {!!pageCount &&
            !loading && (
              <PaginationToolbar
                activePage={activePage}
                itemCount={itemCount}
                pageCount={pageCount}
                pageSize={pageSize}
                onChangePage={onChangePage}
                onChangePageSize={onChangePageSize}
              />
            )}
          {!users.length &&
            !loading && (
              <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
            )}
        </PageSection>
      </PageLayout>
    );
  }
}
