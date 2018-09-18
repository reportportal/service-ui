import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change, formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { FieldProvider } from 'components/fields/fieldProvider';
import { userIdSelector } from 'controllers/user/selectors';
import {
  fetchFiltersConcatAction,
  filtersSelector,
  loadingSelector,
  filtersPaginationSelector,
} from 'controllers/filter';

import styles from './filtersControl.scss';
import { FiltersActionPanel } from './filtersActionPanel';
import { ActiveFilter } from './activeFilter';
import { FiltersList } from './filtersList';
import { WIDGET_WIZARD_FORM } from '../../../widgetWizardContent/wizardControlsSection/constants';

const cx = classNames.bind(styles);
const selector = formValueSelector(WIDGET_WIZARD_FORM);

@connect(
  (state) => ({
    userId: userIdSelector(state),
    activeFilterId: selector(state, 'filterItem'),
    filters: filtersSelector(state),
    pagination: filtersPaginationSelector(state),
    loading: loadingSelector(state),
  }),
  {
    changeWizardForm: (field, value) => change(WIDGET_WIZARD_FORM, field, value, null),
    fetchFiltersConcatAction,
  },
)
export class FiltersControl extends Component {
  static propTypes = {
    userId: PropTypes.string,
    activeFilterId: PropTypes.string,
    filter: PropTypes.string,
    activeProject: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    filters: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    changeWizardForm: PropTypes.func,
    fetchFiltersConcatAction: PropTypes.func,
  };

  static defaultProps = {
    userId: '',
    activeFilterId: '',
    activeProject: '',
    filter: '',
    filters: [],
    pagination: {},
    changeWizardForm: () => {},
    fetchFiltersConcatAction: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      size: 10,
      search: false,
    };
  }

  componentDidMount() {
    const { page } = this.state;
    this.fetchFilter({ page });
  }

  onFilterChange = (search) => {
    this.setState({ page: 1, search });
    this.fetchFilter({ page: 1, search });
  };

  fetchFilter = ({ page, size, search } = {}) => {
    const { filters } = this.props;
    const { size: stateSize, page: statePage } = this.state;

    let params = {
      'page.page': page || statePage,
      'page.size': size || stateSize,
    };

    if (search) {
      params = { ...params, 'filter.cnt.name': search };
    }

    this.props.fetchFiltersConcatAction({ params, filters: page === 1 ? [] : filters });
    this.setState({ page: page + 1 });
  };

  handleFilterListChange = (event) => {
    this.props.changeWizardForm('filterItem', event.target.value);
  };

  handleFilterListLoad = () => {
    const { page } = this.state;
    const {
      filters,
      pagination: { totalElements, totalPages },
      loading,
    } = this.props;

    if ((filters.length >= totalElements && page >= totalPages) || loading) {
      return;
    }

    this.fetchFilter({ page });
  };

  render() {
    const { activeFilterId, filters, loading, userId, filter } = this.props;

    const activeFilter = filters.find((elem) => elem.id === activeFilterId);

    return (
      <div className={cx('filters-control')}>
        <FiltersActionPanel filter={filter} onFilterChange={this.onFilterChange} />
        <FieldProvider name={'filterItem'}>
          <ActiveFilter filter={activeFilter || false} />
        </FieldProvider>
        <FiltersList
          userId={userId}
          filters={filters}
          loading={loading}
          activeId={activeFilterId}
          onChange={this.handleFilterListChange}
          onLazyLoad={this.handleFilterListLoad}
        />
      </div>
    );
  }
}
