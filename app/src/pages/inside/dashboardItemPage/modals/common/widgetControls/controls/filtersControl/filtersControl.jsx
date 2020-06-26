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
import track from 'react-tracking';
import { injectIntl, defineMessages } from 'react-intl';
import { change } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { userIdSelector, activeProjectSelector } from 'controllers/user/selectors';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import { fetch, debounce } from 'common/utils';
import { URLS } from 'common/urls';
import {
  fetchFiltersConcatAction,
  filtersSelector,
  loadingSelector,
  filtersPaginationSelector,
  updateFilterSuccessAction,
} from 'controllers/filter';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { GhostButton } from 'components/buttons/ghostButton';
import { SearchableFilterList } from 'pages/inside/common/searchableFilterList';
import { WIDGET_WIZARD_FORM } from '../../../constants';
import { LockedActiveFilter } from './lockedActiveFilter';
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
  filtersNotFoundOnProject: {
    id: 'FiltersControl.notFoundOnProject',
    defaultMessage: `No filters on a project`,
  },
  filtersNotFoundAdditional: {
    id: 'FiltersControl.notFoundAdditionalInfo',
    defaultMessage: `Be the first to add a new filter`,
  },
  addFilterButton: {
    id: 'FiltersActionPanel.addFilterButton',
    defaultMessage: 'Add filter',
  },
});

@track()
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
    updateFilterSuccessAction,
    notify: showNotification,
  },
)
@injectIntl
export class FiltersControl extends Component {
  static propTypes = {
    intl: PropTypes.object,
    touched: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    userId: PropTypes.string,
    activeProject: PropTypes.string,
    value: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
    pagination: PropTypes.object.isRequired,
    formAppearance: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    changeWizardForm: PropTypes.func,
    fetchFiltersConcatAction: PropTypes.func,
    updateFilterSuccessAction: PropTypes.func,
    onFormAppearanceChange: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    intl: {},
    formAppearance: {},
    touched: false,
    error: '',
    userId: '',
    value: {},
    activeProject: '',
    loading: false,
    filters: [],
    pagination: {},
    changeWizardForm: () => {},
    fetchFiltersConcatAction: () => {},
    updateFilterSuccessAction: () => {},
    onFormAppearanceChange: () => {},
    notify: () => {},
    eventsInfo: {},
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
    const { formAppearance } = this.props;
    const { predefinedFilter } = formAppearance;

    this.fetchFilter({ page });

    if (predefinedFilter) {
      this.handleActiveFilterChange(predefinedFilter.id.toString());
    }
  }

  onFilterAdd = (event) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.addFilter);
    this.handleFormAppearanceMode(event, FORM_APPEARANCE_MODE_ADD);
  };

  getFormAppearanceComponent = (activeFilter) => {
    const {
      formAppearance: { mode: formAppearanceMode, filter: formAppearanceFilter },
      activeProject,
      eventsInfo,
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
              eventsInfo={eventsInfo}
            />
          );
        }
        case FORM_APPEARANCE_MODE_ADD: {
          return (
            <FilterAdd
              filter={
                formAppearanceFilter.conditions ? formAppearanceFilter : NEW_FILTER_DEFAULT_CONFIG
              }
              activeProject={activeProject}
              onChange={this.handleFilterChange}
              onCancel={this.clearFormAppearance}
              onSave={this.handleFilterInsert}
              eventsInfo={eventsInfo}
            />
          );
        }
        case FORM_APPEARANCE_MODE_LOCKED: {
          return <LockedActiveFilter filter={activeFilter} onEdit={this.editLockedActiveFilter} />;
        }
        default:
          return null;
      }
    })();

    return <div className={cx('filters-control-form')}>{component}</div>;
  };

  getFilterById = (filterId) => this.getFiltersList().find((elem) => elem.id === Number(filterId));

  getActiveFilterId = () => this.props.value.value;

  getFilterForSubmit = (filter) => ({
    ...filter,
    conditions: filter.conditions.filter((item) => item.value.trim()),
  });

  getFiltersList = () => {
    const {
      filters,
      formAppearance: { predefinedFilter },
    } = this.props;

    if (!predefinedFilter) return filters;

    const filtersList = filters.filter((el) => el.id !== predefinedFilter.id);

    filtersList.unshift(predefinedFilter);

    return filtersList;
  };

  getCustomActionBlock = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <GhostButton
        icon={AddFilterIcon}
        title={formatMessage(messages.addFilterButton)}
        onClick={this.onFilterAdd}
      >
        {formatMessage(messages.addFilterButton)}
      </GhostButton>
    );
  };

  handleEditFilterListItem = (event, item) =>
    this.handleFormAppearanceMode(event, FORM_APPEARANCE_MODE_EDIT, item);

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

  handleSearchValueChange = debounce((value) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.enterSearchParams);
    return this.fetchFilter({ page: 1, searchValue: value });
  }, 300);

  editLockedActiveFilter = () => {
    this.props.tracking.trackEvent(this.props.eventsInfo.editFilterIcon);
    this.clearFormAppearance();
  };

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
      data: this.getFilterForSubmit(filter),
    })
      .then(({ id }) => {
        this.handleActiveFilterChange(String(id), filter);
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
    const data = this.getFilterForSubmit(filter);

    fetch(URLS.filter(activeProject, filter.id), {
      method: 'put',
      data,
    })
      .then(() => {
        this.fetchFilter({ page: 1 });
        this.props.updateFilterSuccessAction(data);
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

  handleFilterListChange = (event) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.chooseFilter);
    return this.handleActiveFilterChange(event.target.value);
  };

  handleActiveFilterChange = (id, newFilter) => {
    const filter = this.getFilterById(id);
    const name = filter ? filter.name : newFilter && newFilter.name;
    const newActiveFilter = {
      value: id,
      name,
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
    const { formAppearance } = this.props;
    const activeFilterId = this.getActiveFilterId();
    const activeFilter = this.getFilterById(activeFilterId);
    const filtersList = this.getFiltersList();

    if (formAppearance.mode !== false) {
      return this.getFormAppearanceComponent(activeFilter);
    }

    const { loading, touched, error } = this.props;
    const { searchValue } = this.state;

    return (
      <div className={cx('filters-control')}>
        <SearchableFilterList
          customActionBlock={this.getCustomActionBlock()}
          activeFilter={activeFilter}
          searchValue={searchValue}
          loading={loading}
          touched={touched}
          error={error}
          onLazyLoad={this.handleFiltersListLoad}
          onChangeActiveFilter={this.handleFilterListChange}
          onSearchChange={this.handleSearchValueChange}
          filters={filtersList}
          editable
          onEditItem={this.handleEditFilterListItem}
        />
      </div>
    );
  }
}
