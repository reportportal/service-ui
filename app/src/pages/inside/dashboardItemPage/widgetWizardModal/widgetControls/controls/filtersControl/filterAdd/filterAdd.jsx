import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { validate } from 'common/utils';
import { messages } from '../common/messages';
import { FILTER_ADD_FORM, FILTER_NAME_KEY } from '../common/constants';
import { AddEditFilter } from '../common/addEditFilter';
import { FilterAddFormBlock } from './filterAddFormBlock';

const selector = formValueSelector(FILTER_ADD_FORM);

@connect((state) => ({
  name: selector(state, FILTER_NAME_KEY),
}))
export class FilterAdd extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string,
  };

  static defaultProps = {
    name: '',
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
  };

  handleFilterChange = (filter = {}) =>
    this.props.onChange({
      ...filter,
      name: this.props.name,
    });

  render() {
    const { onCancel, filter, name, onSave } = this.props;

    const customBlock = <FilterAddFormBlock onChange={this.handleFilterChange} />;

    return (
      <AddEditFilter
        filter={filter}
        onCancel={onCancel}
        onSubmit={onSave}
        onChange={this.handleFilterChange}
        canSubmit={Boolean(name && validate.filterName(name))}
        blockTitle={messages.addTitle}
        customBlock={customBlock}
      />
    );
  }
}
