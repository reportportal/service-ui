import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { DynamicField } from '../../dynamicField';

export class DropdownField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
  };

  getInputOptions = (values = []) =>
    values.map(({ valueName }) => ({ value: valueName, label: valueName }));

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
