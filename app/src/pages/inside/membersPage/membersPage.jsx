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
});
@connect((state) => ({
  url: URLS.projectUsers(activeProjectSelector(state)),
  activeProject: activeProjectSelector(state),
}), { showScreenLockAction, hideScreenLockAction, showNotification },)
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
          this.props.fetchData();
          this.props.hideScreenLockAction();
          this.props.showNotification(res.msg, 'success');
          data.backLink = res.backLink;
          return data;
        })
        .catch((err) => {
          this.props.fetchData();
          this.props.hideScreenLockAction();
          this.props.showNotification(err.msg, 'error');
          return err;
        });
    }
    data.userNames = {};
    data.userNames[userData.user.userLogin] = userData.role;
    return fetch(`/api/v1/project/${this.props.activeProject}/assign`, {
      method: 'put',
      data,
    })
      .then((res) => {
        this.props.fetchData();
        this.props.showNotification(res.msg, 'success');
      })
      .catch((err) => {
        this.props.fetchData();
        this.props.showNotification(err.msg, 'error');
      });
  };

  render() {
    const { filter, intl, onFilterChange, ...rest } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.membersPageTitle)} fullMobileLayout>
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
