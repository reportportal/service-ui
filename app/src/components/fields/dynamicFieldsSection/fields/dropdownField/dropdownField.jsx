import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { DynamicField } from '../../dynamicField';

export class DropdownField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    customBlock: PropTypes.object,
  };

  static defaultProps = {
    customBlock: null,
  };

  getInputOptions = (values = []) =>
    values.map(({ valueId, valueName }) => ({ value: valueId, label: valueName }));

  parseDropdownValue = (value) => value && [value];

  formatDropdownValue = (value) => value && value[0];

  render() {
    const { field, customBlock, ...rest } = this.props;
    return (
      <DynamicField
        field={field}
        parse={this.parseDropdownValue}
        format={this.formatDropdownValue}
        customBlock={customBlock}
        {...rest}
      >
        <InputDropdown mobileDisabled options={this.getInputOptions(field.definedValues)} />
      </DynamicField>
    );
  }
}
