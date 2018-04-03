import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { fetch } from 'common/utils';
import { withFilter } from 'controllers/filter';
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
}))
@withFilter
@withPagination()
@injectIntl
export class MembersPage extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    onSearchChange: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    filter: PropTypes.string,
    onFilterChange: PropTypes.func,
    activeProject: PropTypes.string,
    fetchData: PropTypes.func,
  };

  static defaultProps = {
    onSearchChange: () => {},
    data: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    onChangePage: () => {},
    onChangePageSize: () => {},
    filter: '',
    onFilterChange: () => {
    },
    fetchData: () => {},
    activeProject: '',
  };

  inviteUser = (userData) => {
    const data = {};
    if (userData.user.externalUser) {
      data.default_project = this.props.activeProject;
      data.email = userData.user.userLogin;
      data.role = userData.role;
      return fetch(`/api/v1/user/bid`, {
        method: 'post',
        data,
      }).then((res) => {
        this.props.fetchData();
        return res;
      });
    }
    data.userNames = {};
    data.userNames[userData.user.userLogin] = userData.role;
    return fetch(`/api/v1/project/${this.props.activeProject}/assign`, {
      method: 'put',
      data,
    }).then(this.props.fetchData);
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
