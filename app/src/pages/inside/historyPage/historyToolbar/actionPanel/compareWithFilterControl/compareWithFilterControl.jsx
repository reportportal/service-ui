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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { userIdSelector, activeProjectSelector } from 'controllers/user/selectors';
import { debounce } from 'common/utils';
import CompareIcon from 'common/img/compare-inline.svg';
import { GhostButton } from 'components/buttons/ghostButton';
import {
  fetchFiltersConcatAction,
  loadingSelector,
  filtersSelector,
  filtersPaginationSelector,
} from 'controllers/filter';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { SearchableFilterList } from 'pages/inside/common/searchableFilterList';
import styles from './compareWithFilterControl.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    filters: filtersSelector(state),
    pagination: filtersPaginationSelector(state),
    loading: loadingSelector(state),
  }),
  {
    fetchFiltersConcatAction,
  },
)
@injectIntl
export class CompareWithFilterControl extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    pagination: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    fetchFiltersConcatAction: PropTypes.func.isRequired,
    filters: PropTypes.array,
    disabled: PropTypes.bool,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.string,
    onChangeActiveFilter: PropTypes.func,
    onChangeSearchParams: PropTypes.func,
  };

  static defaultProps = {
    filters: [],
    disabled: false,
    activeFilterId: '',
    userId: '',
    editable: false,
    onChangeActiveFilter: () => {},
    onChangeSearchParams: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      size: 10,
      searchValue: '',
      filterListShown: false,
    };
  }

  componentDidMount() {
    const { page } = this.state;

    this.fetchFilter({ page });
  }

  getFilterById = (filterId) => this.props.filters.find((elem) => elem.id === Number(filterId));

  fetchFilter = ({ page, size, searchValue }) => {
    const { size: stateSize, page: statePage } = this.state;

    let params = {
      [PAGE_KEY]: page || statePage,
      [SIZE_KEY]: size || stateSize,
    };

    if (searchValue) {
      params = { ...params, 'filter.cnt.name': searchValue };
    }

    const concat = page > 1;

    this.props.fetchFiltersConcatAction({ params, concat });
    this.setState({ page: page + 1, searchValue });
  };

  handleSearchValueChange = debounce(
    (value) =>
      // TODO: add callback to track event here
      // this.props.tracking.trackEvent(this.props.eventsInfo.enterSearchParams);
      this.fetchFilter({ page: 1, searchValue: value }),
    300,
  );

  handleFilterListChange = (event) => {
    // TODO: add callback to track event here
    // this.props.tracking.trackEvent(this.props.eventsInfo.chooseFilter);
    this.props.onChangeActiveFilter(event.target.value);
  };

  handleFiltersListLoad = () => {
    const { page, searchValue } = this.state;
    const {
      filters,
      pagination: { totalElements, totalPages },
      loading,
    } = this.props;

    if ((filters.length >= totalElements && page >= totalPages) || loading) {
      return;
    }

    this.fetchFilter({ page, searchValue });
  };

  toggleFilterList = () => {
    this.setState({
      filterListShown: !this.state.filterListShown,
    });
  };

  render() {
    const { filters, pagination, activeFilterId, loading, disabled } = this.props;
    const { searchValue } = this.state;
    const activeFilter = this.getFilterById(activeFilterId);

    return (
      <div className={cx('compare-with-filter-control')}>
        <GhostButton icon={CompareIcon} onClick={this.toggleFilterList} disabled={disabled}>
          <FormattedMessage id="Common.compare" defaultMessage="Compare" />
        </GhostButton>
        {this.state.filterListShown && (
          <div className={cx('filter-control')}>
            <SearchableFilterList
              activeFilter={activeFilter}
              searchValue={searchValue}
              loading={loading}
              pagination={pagination}
              onLazyLoad={this.handleFiltersListLoad}
              onChangeActiveFilter={this.handleFilterListChange}
              onSearchChange={this.handleSearchValueChange}
              filters={filters}
              onEditItem={this.handleEditFilterListItem}
              filterListCustomClass={cx('filter-list')}
            />
          </div>
        )}
      </div>
    );
  }
}
