import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import {
  allUsersSelector,
  allUsersPaginationSelector,
  loadingSelector,
} from 'controllers/administrate/allUsers';

import { UsersToolbar } from './usersToolbar';
import { AllUsersGrid } from './allUsersGrid';

const titleMessage = defineMessages({
  pageTitle: {
    id: 'AdminSidebar.allUsers',
    defaultMessage: 'All users',
  },
});

@connect((state) => ({
  url: URLS.allUsers(state),
  users: allUsersSelector(state),
  loading: loadingSelector(state),
}))
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
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    users: [],
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(titleMessage.pageTitle),
    },
  ];

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
    } = this.props;
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <UsersToolbar />
          <AllUsersGrid data={users} loading={loading} />
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
        </PageSection>
      </PageLayout>
    );
  }
}
