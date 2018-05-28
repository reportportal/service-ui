import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { fetch } from 'common/utils';
import { withFilter } from 'controllers/filter';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification } from 'controllers/notification';
import { activeProjectSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { PageLayout } from 'layouts/pageLayout';
import { MembersPageToolbar } from './membersPageToolbar';
import { MembersTable } from './membersTable';

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
    url: URLS.projectUsers(activeProjectSelector(state)),
    activeProject: activeProjectSelector(state),
  }),
  { showScreenLockAction, hideScreenLockAction, showNotification },
)
@withFilter
@withPagination()
@injectIntl
export class MembersPage extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    onSearchChange: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onFilterChange: PropTypes.func,
    fetchData: PropTypes.func,
    showScreenLockAction: PropTypes.func,
    hideScreenLockAction: PropTypes.func,
    showNotification: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    filter: PropTypes.string,
    activeProject: PropTypes.string,
  };

  static defaultProps = {
    onSearchChange: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    showScreenLockAction: () => {},
    hideScreenLockAction: () => {},
    showNotification: () => {},
    onFilterChange: () => {},
    fetchData: () => {},
    data: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    filter: '',
    activeProject: '',
  };

  inviteUser = (userData) => {
    const data = {};
    if (userData.user.externalUser) {
      this.props.showScreenLockAction();
      data.default_project = this.props.activeProject;
      data.email = userData.user.userLogin;
      data.role = userData.role;
      return fetch(`/api/v1/user/bid`, {
        method: 'post',
        data,
      })
        .then((res) => {
          this.props.showNotification({
            message: this.props.intl.formatMessage(messages.inviteExternalMember),
            type: 'success',
          });
          this.props.fetchData();
          this.props.hideScreenLockAction();
          data.backLink = res.backLink;
          return data;
        })
        .catch((err) => {
          this.props.showNotification({ message: err.msg, type: 'error' });
          this.props.fetchData();
          this.props.hideScreenLockAction();
          return err;
        });
    }
    data.userNames = {};
    data.userNames[userData.user.userLogin] = userData.role;
    return fetch(`/api/v1/project/${this.props.activeProject}/assign`, {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.memberWasInvited, {
            name: userData.user.userLogin,
          }),
          type: 'success',
        });
        this.props.fetchData();
      })
      .catch((err) => {
        this.props.showNotification({ message: err.msg, type: 'error' });
        this.props.fetchData();
      });
  };

  render() {
    const { filter, intl, onFilterChange, ...rest } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.membersPageTitle)}>
        <MembersPageToolbar
          filter={filter}
          onFilterChange={onFilterChange}
          onInvite={this.inviteUser}
        />
        <MembersTable {...rest} />
      </PageLayout>
    );
  }
}
