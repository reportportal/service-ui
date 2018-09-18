import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { DynamicField } from '../../dynamicField';

export class ArrayField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    customBlock: PropTypes.object,
  };

  static defaultProps = {
    customBlock: {},
  };

  formatOptions = (values = []) => values.map(({ id, label }) => ({ value: id, label }));

  creatable = !this.props.field.definedValues || !this.props.field.definedValues.length;

  formatTags = (tags) => {
    const { field } = this.props;
    const values = [];
    tags &&
      tags.forEach((item) => {
        const foundedItems = field.definedValues.find((defValue) => defValue.label === item);
        foundedItems && values.push(foundedItems);
      });
    return this.formatOptions(values);
  };

  parseTags = (options) => (options && options.map((option) => option.label)) || undefined;

  render() {
    const { field, customBlock } = this.props;
    return (
      <DynamicField
        field={field}
        customBlock={customBlock}
        format={this.creatable ? this.formatOptions : this.formatTags}
        parse={this.parseTags}
      >
        <InputTagsSearch
          options={this.formatOptions(field.definedValues)}
          creatable={this.creatable}
          removeSelected
          mobileDisabled
          multi
        />
      </DynamicField>
    );
  }
}
