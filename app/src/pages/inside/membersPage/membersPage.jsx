import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import {
  membersPaginationSelector,
  fetchMembersAction,
  membersSelector,
  loadingSelector,
} from 'controllers/members';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { withFilter } from 'controllers/filter';
import { activeProjectSelector } from 'controllers/user';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination } from 'controllers/pagination';
import { PageLayout } from 'layouts/pageLayout';
import { MembersPageToolbar } from './membersPageToolbar';
import { MembersGrid } from './membersGrid';

const messages = defineMessages({
  membersPageTitle: {
    id: 'MembersPage.title',
    defaultMessage: 'Project members',
  },
  memberWasInvited: {
    id: 'MembersPage.memberWasInvited',
    defaultMessage: 'Member {name} was assigned to the project',
  },
  inviteExternalMember: {
    id: 'MembersPage.inviteExternalMember',
    defaultMessage:
      'Invite for member is successfully registered. Confirmation info will be send on provided email. Expiration: 1 day.',
  },
});
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    url: URLS.projectUsers(activeProjectSelector(state)),
    members: membersSelector(state),
    loading: loadingSelector(state),
  }),
  { showScreenLockAction, hideScreenLockAction, showNotification },
)
@withFilter
@withPagination({
  paginationSelector: membersPaginationSelector,
  fetchAction: fetchMembersAction,
})
@injectIntl
export class MembersPage extends Component {
  static propTypes = {
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    onSearchChange: PropTypes.func,
    onFilterChange: PropTypes.func,
    fetchData: PropTypes.func,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    filter: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool,
    activeProject: PropTypes.string.isRequired,
  };
  static defaultProps = {
    onSearchChange: () => {},
    onFilterChange: () => {},
    fetchData: () => {},
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    onChangePage: () => {},
    onChangePageSize: () => {},
    filter: '',
    members: [],
    loading: false,
  };

  inviteUser = (userData) => {
    const data = {};
    if (userData.user.externalUser) {
      this.props.showScreenLockAction();
      data.default_project = this.props.activeProject;
      data.email = userData.user.userLogin;
      data.role = userData.role;
      return fetch(URLS.userInviteExternal(), {
        method: 'post',
        data,
      })
        .then((res) => {
          this.props.showNotification({
            message: this.props.intl.formatMessage(messages.inviteExternalMember),
            type: NOTIFICATION_TYPES.SUCCESS,
          });
          this.props.fetchData();
          this.props.hideScreenLockAction();
          data.backLink = res.backLink;
          return data;
        })
        .catch((err) => {
          this.props.showNotification({ message: err.msg, type: NOTIFICATION_TYPES.ERROR });
          this.props.fetchData();
          this.props.hideScreenLockAction();
          return err;
        });
    }
    data.userNames = {
      [userData.user.userLogin]: userData.role,
    };
    return fetch(URLS.userInviteInternal(this.props.activeProject), {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.memberWasInvited, {
            name: userData.user.userLogin,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchData();
      })
      .catch((err) => {
        this.props.showNotification({ message: err.msg, type: NOTIFICATION_TYPES.ERROR });
        this.props.fetchData();
      });
  };

  render() {
    const {
      filter,
      intl,
      onFilterChange,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      members,
      fetchData,
      loading,
    } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.membersPageTitle)} fullMobileLayout>
        <MembersPageToolbar
          filter={filter}
          onFilterChange={onFilterChange}
          onInvite={this.inviteUser}
        />
        <MembersGrid data={members} fetchData={fetchData} loading={loading} />
        <PaginationToolbar
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      </PageLayout>
    );
  }
}
