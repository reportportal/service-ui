import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { filterValueShape } from 'components/filterEntities';
import { debounce } from 'common/utils/debounce';
import { InputFilter } from './inputFilter';

const parseFilterString = (value = '') => ({
  activities: {
    value,
  },
});

const formatFilterString = (filterString = {}) =>
  filterString.activities ? filterString.activities.value : '';

export class InputFilterContainer extends Component {
  static propTypes = {
    filterValues: PropTypes.objectOf(filterValueShape),
    onChange: PropTypes.func,
    entitiesProvider: PropTypes.elementType,
  };

  static defaultProps = {
    filterValues: {},
    onChange: () => {},
    entitiesProvider: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.filterValues, state.prevValues)) {
      return {
        values: props.filterValues,
        prevValues: props.filterValues,
        filterString: formatFilterString(props.filterValues),
      };
    }
    return null;
  }

  state = {
    values: {},
    prevValues: {},
    filterString: '',
  };

  debouncedChangeHandler = debounce(
    (value) => this.props.onChange({ ...this.props.filterValues, ...parseFilterString(value) }),
    1000,
  );

  handleFilterChange = (values) => {
    this.setState({ values });
  };

  handleFilterApply = () => {
    this.props.onChange(this.state.values);
  };

  handleFilterClear = () => {
    this.setState({ values: {} });
  };

  handleFilterStringChange = (value) => {
    this.setState({ filterString: value }, () => this.debouncedChangeHandler(value));
  };

  render() {
    const { entitiesProvider, filterValues } = this.props;
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
            value={this.state.filterString}
            onFilterStringChange={this.handleFilterStringChange}
            filterActive={Object.keys(filterValues).length > 0}
          />
        )}
      />
    );
  }
}
