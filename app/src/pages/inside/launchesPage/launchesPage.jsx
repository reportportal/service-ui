import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { withSorting, SORTING_DESC } from 'controllers/sorting';
import { LaunchSuiteGrid } from './launchSuiteGrid';
import { LaunchToolbar } from './LaunchToolbar';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'LaunchesPage.title',
    defaultMessage: 'Launches',
  },
});

@connect((state) => ({
  userId: userIdSelector(state),
  url: `/api/v1/${activeProjectSelector(state)}/launch`,
}))
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_DESC,
})
@withPagination()
@injectIntl
export class LaunchesPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: null,
    sortingColumn: null,
    sortingDirection: null,
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
  };

  state = {
    selectedLaunches: [],
  };

  getTitle = () =>
    !this.state.selectedLaunches.length && this.props.intl.formatMessage(messages.filtersPageTitle);

  handleLaunchSelection = (launch) => {
    const { selectedLaunches } = this.state;
    if (!selectedLaunches.find((item) => item.id === launch.id)) {
      this.setState({ selectedLaunches: [...selectedLaunches, launch] });
      return;
    }
    this.setState({ selectedLaunches: selectedLaunches.filter((item) => item.id !== launch.id) });
  };

  handleAllLaunchesSelection = () => {
    const { selectedLaunches } = this.state;
    const launches = this.props.data;
    if (launches.length === selectedLaunches.length) {
      this.setState({ selectedLaunches: [] });
      return;
    }
    this.setState({ selectedLaunches: this.props.data });
  };

  unselectLaunch = (launch) =>
    this.setState({
      selectedLaunches: this.state.selectedLaunches.filter((item) => item.id !== launch.id),
    });

  resetSelection = () => this.setState({ selectedLaunches: [] });

  render() {
    const {
      data,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;
    return (
      <PageLayout title={this.getTitle()}>
        <LaunchToolbar
          selectedLaunches={this.state.selectedLaunches}
          onUnselect={this.unselectLaunch}
          onUnselectAll={this.resetSelection}
        />
        <LaunchSuiteGrid
          data={data}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          selectedLaunches={this.state.selectedLaunches}
          onLaunchSelect={this.handleLaunchSelection}
          onAllLaunchesSelect={this.handleAllLaunchesSelection}
        />
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
