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
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { filterValueShape } from 'components/filterEntities';
import { debounce } from 'common/utils/debounce';
import { InputFilter } from './inputFilter';

const parseFilterString = (value = '', key) => ({
  [key]: {
    value,
  },
});

const formatFilterString = (filterString = {}, key) =>
  filterString[key] ? filterString[key].value : '';

export class InputFilterContainer extends Component {
  static propTypes = {
    filterValues: PropTypes.objectOf(filterValueShape),
    onChange: PropTypes.func,
    entitiesProvider: PropTypes.elementType,
    id: PropTypes.string.isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    filterValues: {},
    onChange: () => {},
    entitiesProvider: null,
    eventsInfo: {},
  };

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.filterValues, state.prevValues)) {
      const { id } = props;
      return {
        values: props.filterValues,
        prevValues: props.filterValues,
        filterString: formatFilterString(props.filterValues, id),
      };
    }
    return null;
  }

  state = {
    values: {},
    prevValues: {},
    filterString: '',
  };

  debouncedChangeHandler = debounce((value) => {
    const { id } = this.props;
    return this.props.onChange({ ...this.props.filterValues, ...parseFilterString(value, id) });
  }, 1000);

  handleFilterChange = (values) => {
    this.setState({ values });
  };

  handleFilterApply = () => {
    this.props.onChange(this.state.values);
  };

  handleFilterClear = () => {
    this.setState({ values: {} });
  };

  handleQuickClear = () => {
    this.setState({ filterString: '', values: {} }, () => this.props.onChange({}));
  };

  handleFilterStringChange = (value) => {
    this.setState({ filterString: value }, () => this.debouncedChangeHandler(value));
  };

  handleCancel = () => this.setState({ values: this.state.prevValues });

  render() {
    const { entitiesProvider, filterValues, eventsInfo } = this.props;
    return (
      <FilterEntitiesContainer
        entities={this.state.values}
        entitiesProvider={entitiesProvider}
        onChange={this.handleFilterChange}
        render={({ filterErrors, filterEntities, onFilterChange, onFilterValidate }) => (
          <InputFilter
            filterErrors={filterErrors}
            filterEntities={filterEntities}
            onFilterChange={onFilterChange}
            onFilterApply={this.handleFilterApply}
            onFilterValidate={onFilterValidate}
            onClear={this.handleFilterClear}
            onQuickClear={this.handleQuickClear}
            onCancel={this.handleCancel}
            value={this.state.filterString}
            onFilterStringChange={this.handleFilterStringChange}
            filterActive={Object.keys(filterValues).length > 0}
            eventsInfo={eventsInfo}
          />
        )}
      />
    );
  }
}
