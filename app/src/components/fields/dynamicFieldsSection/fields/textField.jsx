import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'components/inputs/input';
import { DynamicField } from '../dynamicField';

export class TextField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
  };

  formatInputValue = (value) => value && value[0];

  parseInputValue = (value) => (value ? [value] : []);

  render() {
    const { field, ...rest } = this.props;
    return (
      <DynamicField
        field={field}
        format={this.formatInputValue}
        parse={this.parseInputValue}
        {...rest}
      >
        <Input mobileDisabled />
      </DynamicField>
    );
  }
}
