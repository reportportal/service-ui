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
    customBlock: {},
  };

  getInputOptions = (values = []) => values.map(({ id, label }) => ({ value: id, label }));

  render() {
    const { field, customBlock } = this.props;
    return (
      <DynamicField field={field} customBlock={customBlock}>
        <InputDropdown mobileDisabled options={this.getInputOptions(field.definedValues)} />
      </DynamicField>
    );
  }
}
