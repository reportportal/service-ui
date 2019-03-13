import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'components/inputs/input';
import { DynamicField } from '../../dynamicField';

export class TextField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    customBlock: PropTypes.object,
  };

  static defaultProps = {
    customBlock: null,
  };

  formatInputValue = (value) => value && value[0];

  parseInputValue = (value) => [value || ''];

  render() {
    const { field, customBlock, ...rest } = this.props;
    return (
      <DynamicField
        field={field}
        format={this.formatInputValue}
        parse={this.parseInputValue}
        customBlock={customBlock}
        {...rest}
      >
        <Input mobileDisabled />
      </DynamicField>
    );
  }
}
