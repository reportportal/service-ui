import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages } from 'react-intl';
import { change } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { userIdSelector, activeProjectSelector } from 'controllers/user/selectors';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch, debounce } from 'common/utils';
import { URLS } from 'common/urls';
import {
  fetchFiltersConcatAction,
  filtersSelector,
  loadingSelector,
  filtersPaginationSelector,
} from 'controllers/filter';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { WIDGET_WIZARD_FORM } from '../../../constants';
import { LockedActiveFilter } from './lockedActiveFilter';
import { FiltersActionPanel } from './filtersActionPanel';
import { ActiveFilter } from './activeFilter';
import { FiltersList } from './filtersList';
import { FilterEdit } from './filterEdit';
import { FilterAdd } from './filterAdd';
import {
  FORM_APPEARANCE_MODE_ADD,
  FORM_APPEARANCE_MODE_EDIT,
  FORM_APPEARANCE_MODE_LOCKED,
  NEW_FILTER_DEFAULT_CONFIG,
} from './common/constants';
import styles from './filtersControl.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  insertFilterSuccess: {
    id: 'FiltersControl.insertFilterSuccess',
    defaultMessage: 'Filter has been created',
  },
  insertFilterError: {
    id: 'FiltersControl.insertFilterError',
    defaultMessage: "Filter don't created",
  },
  updateFilterSuccess: {
    id: 'FiltersControl.updateFilterSuccess',
    defaultMessage: 'Filter has been updated',
  },
  updateFilterError: {
    id: 'FiltersControl.updateFilterError',
    defaultMessage: "Filter don't updated",
  },
  filtersNotFound: {
    id: 'FiltersControl.notFound',
    defaultMessage: `No filters found for "{filter}".`,
  },
});

@connect(
  (state) => ({
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    filters: filtersSelector(state),
    pagination: filtersPaginationSelector(state),
    loading: loadingSelector(state),
  }),
  {
    changeWizardForm: (field, value) => change(WIDGET_WIZARD_FORM, field, value, null),
    fetchFiltersConcatAction,
    notify: showNotification,
  },
)
@injectIntl
export class FiltersControl extends Component {
  static propTypes = {
    intl: intlShape,
    touched: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    userId: PropTypes.string,
    activeProject: PropTypes.string,
    value: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
    filter: PropTypes.string,
    pagination: PropTypes.object.isRequired,
    formAppearance: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    changeWizardForm: PropTypes.func,
    fetchFiltersConcatAction: PropTypes.func,
    onFormAppearanceChange: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
    formAppearance: {},
    touched: false,
    error: '',
    userId: '',
    value: {},
    filter: '',
    activeProject: '',
    loading: false,
    filters: [],
    pagination: {},
    changeWizardForm: () => {},
    fetchFiltersConcatAction: () => {},
    onFormAppearanceChange: () => {},
    notify: () => {},
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

  getFormAppearanceComponent = (activeFilter) => {
    const {
      formAppearance: { mode: formAppearanceMode, filter: formAppearanceFilter },
    } = this.props;

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
              filter={
                formAppearanceFilter.conditions ? formAppearanceFilter : NEW_FILTER_DEFAULT_CONFIG
              }
              onChange={this.handleFilterChange}
              onCancel={this.clearFormAppearance}
              onSave={this.handleFilterInsert}
            />
          );
        }
        case FORM_APPEARANCE_MODE_LOCKED: {
          return activeFilter ? (
            <LockedActiveFilter filter={activeFilter} onEdit={this.clearFormAppearance} />
          ) : null;
        }
        default:
          return null;
      }
    })();

    return <div className={cx('filters-control-form')}>{component}</div>;
  };

  getFilterById = (filterId) => this.props.filters.find((elem) => elem.id === Number(filterId));

  getActiveFilterId = () => this.props.value.value;

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

  clearFormAppearance = () => {
    this.props.onFormAppearanceChange(false, {});
  };

  handleSearchValueChange = debounce(
    (value) => this.fetchFilter({ page: 1, searchValue: value }),
    300,
  );

  handleFormAppearanceMode = (event, mode, filter) => {
    event.preventDefault();
    event.stopPropagation();
    const { onFormAppearanceChange, formAppearance } = this.props;

    onFormAppearanceChange(mode || formAppearance.mode, filter || {});
  };

  handleFilterChange = (newFilter) => {
    const {
      onFormAppearanceChange,
      formAppearance: { mode, filter },
    } = this.props;

    const updatedFilter = {
      ...filter,
      ...newFilter,
    };

    onFormAppearanceChange(mode, updatedFilter);
  };

  handleFilterInsert = () => {
    const {
      intl,
      activeProject,
      notify,
      formAppearance: { filter },
    } = this.props;

    fetch(URLS.filters(activeProject), {
      method: 'post',
      data: filter,
    })
      .then(({ id }) => {
        this.handleActiveFilterChange(String(id));
        this.fetchFilter({ page: 1 });
        notify({
          message: intl.formatMessage(messages.insertFilterSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        notify({
          message: intl.formatMessage(messages.insertFilterError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });

    this.clearFormAppearance();
  };

  handleFilterUpdate = (filter) => {
    const { intl, notify, activeProject } = this.props;

    fetch(URLS.filter(activeProject, filter.id), {
      method: 'put',
      data: filter,
    })
      .then(() => {
        this.fetchFilter({ page: 1 });
        notify({
          message: intl.formatMessage(messages.updateFilterSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        notify({
          message: intl.formatMessage(messages.updateFilterError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });

    this.clearFormAppearance();
  };

  handleFilterListChange = (event) => this.handleActiveFilterChange(event.target.value);

  handleActiveFilterChange = (id) => {
    const filter = this.getFilterById(id);
    const newActiveFilter = {
      value: id,
      name: filter.name,
    };
    this.props.changeWizardForm('filters', [newActiveFilter]);
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

  render() {
    const { filters, formAppearance } = this.props;
    const activeFilterId = this.getActiveFilterId();
    const activeFilter = this.getFilterById(activeFilterId);

    if (formAppearance.mode !== false) {
      return this.getFormAppearanceComponent(activeFilter);
    }

    const { loading, userId, filter, touched, error } = this.props;
    const { searchValue } = this.state;

    return (
      <div className={cx('filters-control')}>
        <FiltersActionPanel
          filter={filter}
          filters={filters}
          value={searchValue}
          onFilterChange={this.handleSearchValueChange}
          onAdd={this.handleFormAppearanceMode}
        />
        <ActiveFilter filter={activeFilter || null} touched={touched} error={error || null} />
        <FiltersList
          search={searchValue}
          userId={userId}
          filters={filters}
          loading={loading}
          activeId={activeFilterId}
          onChange={this.handleFilterListChange}
          onEdit={this.handleFormAppearanceMode}
          onLazyLoad={this.handleFiltersListLoad}
          noItemsMessage={messages.filtersNotFound}
        />
      </div>
    );
  }
}
