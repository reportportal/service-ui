import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { InputFilter } from './inputFilter';

export class InputFilterContainer extends Component {
  static propTypes = {
    entities: PropTypes.object,
    onChange: PropTypes.func,
    entitiesProvider: PropTypes.node,
  };
  static defaultProps = {
    entities: {},
    onChange: () => {},
    entitiesProvider: null,
  };
  state = {
    values: {},
  };
  handleFilterChange = (values) => {
    this.setState({ values });
  };
  handleFilterApply = () => {
    this.props.onChange(this.state.values);
  };
  handleFilterClear = () => {
    this.setState({ values: {} });
  };

  render() {
    const { entitiesProvider } = this.props;
    return (
      <FilterEntitiesContainer
        entities={this.state.values}
        entitiesProvider={entitiesProvider}
        onChange={this.handleFilterChange}
        render={({ filterErrors, filterEntities, onFilterChange }) => (
          <InputFilter
            filterErrors={filterErrors}
            filterEntities={filterEntities}
            onFilterChange={onFilterChange}
            onFilterApply={this.handleFilterApply}
            onClear={this.handleFilterClear}
          />
        )}
      />
    );
  }
}
