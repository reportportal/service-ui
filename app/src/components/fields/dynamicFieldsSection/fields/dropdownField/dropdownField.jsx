import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { DynamicField } from '../../dynamicField';

export class DropdownField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    defaultOptionValueKey: PropTypes.string.isRequired,
  };

  getInputOptions = (values = []) =>
    values.map((item) => ({
      value: item[this.props.defaultOptionValueKey],
      label: item.valueName,
    }));

  parseDropdownValue = (value) => value && [value];

  formatDropdownValue = (value) => value && value[0];

  render() {
    const { field, ...rest } = this.props;
    return (
      <DynamicField
        field={field}
        parse={this.parseDropdownValue}
        format={this.formatDropdownValue}
        {...rest}
      >
        <InputDropdown mobileDisabled options={this.getInputOptions(field.definedValues)} />
      </DynamicField>
    );
  }
}
