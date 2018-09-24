import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change, formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { userIdSelector, activeProjectSelector } from 'controllers/user/selectors';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
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
import { FilterEdit } from './filterEdit';
import { FilterAdd } from './fitlerAdd';
import { WIDGET_WIZARD_FORM } from '../../../widgetWizardContent/wizardControlsSection/constants';
import { FORM_APPEARANCE_MODE_ADD, FORM_APPEARANCE_MODE_EDIT } from './constants';

const cx = classNames.bind(styles);
const selector = formValueSelector(WIDGET_WIZARD_FORM);

@connect(
  (state) => ({
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    activeFilterId: selector(state, 'filterId'),
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
    touched: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    userId: PropTypes.string,
    activeProject: PropTypes.string,
    activeFilterId: PropTypes.string,
    filter: PropTypes.string,
    pagination: PropTypes.object.isRequired,
    formAppearance: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    changeWizardForm: PropTypes.func,
    fetchFiltersConcatAction: PropTypes.func,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    formAppearance: {},
    touched: false,
    error: '',
    userId: '',
    activeFilterId: '',
    filter: '',
    activeProject: '',
    loading: false,
    filters: [],
    pagination: {},
    changeWizardForm: () => {},
    fetchFiltersConcatAction: () => {},
    onFormAppearanceChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      size: 10,
      searchValue: false,
    };
  }

  componentDidMount() {
    const { page } = this.state;
    this.fetchFilter({ page });
  }

  fetchFilter = ({ page, size, searchValue }) => {
    const { size: stateSize, page: statePage } = this.state;

    let params = {
      'page.page': page || statePage,
      'page.size': size || stateSize,
    };

    if (searchValue) {
      params = { ...params, 'filter.cnt.name': searchValue };
    }

    const concat = page > 1;

    this.props.fetchFiltersConcatAction({ params, concat });
    this.setState({ page: page + 1, searchValue });
  };

  clearFormAppearance = () => {
    this.props.onFormAppearanceChange(false, {});
  };

  handleSearchValueChange = (value) => {
    this.fetchFilter({ page: 1, searchValue: value });
  };

  handleFormAppearanceMode = (event, mode, filter) => {
    event.preventDefault();
    event.stopPropagation();
    const { onFormAppearanceChange, formAppearance } = this.props;

    onFormAppearanceChange(mode || formAppearance.mode, filter || {});
  };

  handleFilterChange = (filter) => {
    const {
      onFormAppearanceChange,
      formAppearance: { mode },
    } = this.props;

    onFormAppearanceChange(mode, filter);
  };

  handleFilterInsert = (filter) => {
    const { activeProject } = this.props;

    fetch(URLS.filters(activeProject), {
      method: 'post',
      data: { elements: [filter] },
    }).then(() => this.fetchFilter({ page: 1 }));

    this.clearFormAppearance();
  };

  handleFilterUpdate = (filter) => {
    const { activeProject } = this.props;

    fetch(URLS.filter(activeProject, filter.id), {
      method: 'put',
      data: filter,
    }).then(() => this.fetchFilter({ page: 1 }));

    this.clearFormAppearance();
  };

  handleFilterListChange = (event) => {
    this.props.changeWizardForm('filterId', event.target.value);
  };

  handleFilterListLoad = () => {
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

  render() {
    const {
      formAppearance: { mode: formAppearanceMode, filter: formAppearanceFilter },
    } = this.props;

    if (formAppearanceMode !== false) {
      const component = (() => {
        switch (formAppearanceMode) {
          case FORM_APPEARANCE_MODE_EDIT: {
            return (
              <FilterEdit
                filter={formAppearanceFilter}
                onChange={this.handleFilterChange}
                onCancel={this.clearFormAppearance}
                onSave={this.handleFilterUpdate}
              />
            );
          }
          case FORM_APPEARANCE_MODE_ADD: {
            return (
              <FilterAdd
                filter={formAppearanceFilter}
                onChange={this.handleFilterChange}
                onCancel={this.clearFormAppearance}
                onSave={this.handleFilterInsert}
              />
            );
          }
          default:
            return null;
        }
      })();

      return <div className={cx('filters-control-form')}>{component}</div>;
    }

    const { activeFilterId, filters, loading, userId, filter, touched, error } = this.props;
    const { searchValue } = this.state;
    const activeFilter = filters.find((elem) => elem.id === activeFilterId);

    return (
      <div className={cx('filters-control')}>
        <FiltersActionPanel
          filter={filter}
          filters={filters}
          value={searchValue}
          onFilterChange={this.handleSearchValueChange}
          onAdd={this.handleFormAppearanceMode}
        />
        <ActiveFilter filter={activeFilter || false} touched={touched} error={error} />
        <FiltersList
          search={searchValue}
          userId={userId}
          filters={filters}
          loading={loading}
          activeId={activeFilterId}
          onChange={this.handleFilterListChange}
          onEdit={this.handleFormAppearanceMode}
          onLazyLoad={this.handleFilterListLoad}
        />
      </div>
    );
  }
}
