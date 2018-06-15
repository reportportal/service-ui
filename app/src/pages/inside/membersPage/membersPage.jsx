import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
});
@connect((state) => ({
  url: URLS.projectUsers(activeProjectSelector(state)),
}))
@withFilter
@withPagination()
@injectIntl
export class MembersPage extends PureComponent {
  static propTypes = {
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
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
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
    data: [],
    loading: false,
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
      data,
      fetchData,
      loading,
    } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.membersPageTitle)} fullMobileLayout>
        <MembersPageToolbar filter={filter} onFilterChange={onFilterChange} />
        <MembersGrid data={data} fetchData={fetchData} loading={loading} />
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
