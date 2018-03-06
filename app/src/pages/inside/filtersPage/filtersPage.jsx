import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withFilter } from 'controllers/filter';
import { userIdSelector } from 'controllers/user';
import { withPagination } from 'components/containers/pagination';
import { PageLayout } from 'layouts/pageLayout';
import { FilterTable } from './filterTable';
import { FilterPageToolbar } from './filterPageToolbar';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
});

@withFilter
@withPagination({
  url: activeProject => `/api/v1/${activeProject}/filter`,
})
@connect(state => ({
  userId: userIdSelector(state),
}))
@injectIntl
export class FiltersPage extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    userId: PropTypes.string,
    filter: PropTypes.string,
    onFilterChange: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    userId: '',
    filter: '',
    onFilterChange: () => {
    },
    onChangePage: () => {
    },
    onChangePageSize: () => {
    },
  };

  render() {
    const { filter, intl, onFilterChange, ...rest } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
        <FilterPageToolbar
          filter={filter}
          onFilterChange={onFilterChange}
        />
        <FilterTable
          {...rest}
        />
      </PageLayout>
    );
  }
}
