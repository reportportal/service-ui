/*
 * Copyright 2019 EPAM Systems
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

import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import {
  membersPaginationSelector,
  fetchMembersAction,
  membersSelector,
  loadingSelector,
} from 'controllers/members';
import { withFilter } from 'controllers/filter';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY } from 'controllers/pagination';
import { MEMBERS_PAGE, MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { NoResultsForFilter } from 'pages/inside/common/noResultsForFilter';
import { MembersPageToolbar } from './membersPageToolbar';
import { MembersGrid } from './membersGrid';

const messages = defineMessages({
  membersNotFound: {
    id: 'MembersPage.notFound',
    defaultMessage: 'No members found for "{filter}"',
  },
});
@connect(
  (state) => ({
    members: membersSelector(state),
    loading: loadingSelector(state),
  }),
  {
    fetchMembersAction,
  },
)
@withFilter({
  filterKey: 'filter.cnt.fullName',
})
@withPagination({
  paginationSelector: membersPaginationSelector,
})
@injectIntl
@track({ page: MEMBERS_PAGE })
export class MembersPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onSearchChange: PropTypes.func,
    onFilterChange: PropTypes.func,
    fetchMembersAction: PropTypes.func,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    filter: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    onSearchChange: () => {},
    onFilterChange: () => {},
    fetchMembersAction: () => {},
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: 0,
    pageCount: 0,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    onChangePage: () => {},
    onChangePageSize: () => {},
    filter: '',
    members: [],
    loading: false,
  };

  searchUser = (filterQuery) => {
    this.props.tracking.trackEvent(MEMBERS_PAGE_EVENTS.ENTER_SEARCH_PARAM);
    this.props.onFilterChange(filterQuery);
  };

  renderPageSectionFooter = () => {
    const {
      filter,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      members,
    } = this.props;

    if (members.length) {
      return (
        <PaginationToolbar
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      );
    }
    return (
      !!filter && (
        <NoResultsForFilter filter={this.props.filter} notFoundMessage={messages.membersNotFound} />
      )
    );
  };

  render() {
    const { filter, members, loading } = this.props;

    return (
      <Fragment>
        <MembersPageToolbar
          initialValues={{ filter }}
          onFilterChange={this.searchUser}
          onInvite={this.props.fetchMembersAction}
        />
        <MembersGrid data={members} fetchData={this.props.fetchMembersAction} loading={loading} />
        {!loading && this.renderPageSectionFooter()}
      </Fragment>
    );
  }
}
