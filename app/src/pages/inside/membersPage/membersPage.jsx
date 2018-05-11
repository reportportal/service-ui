import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
    onFilterChange: () => {},
  };

  render() {
    const { filter, intl, onFilterChange, ...rest } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.membersPageTitle)} fullMobileLayout>
        <MembersPageToolbar filter={filter} onFilterChange={onFilterChange} />
        <MembersTable {...rest} />
      </PageLayout>
    );
  }
}
