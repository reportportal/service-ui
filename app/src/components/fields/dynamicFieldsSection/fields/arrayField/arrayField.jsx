import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { DynamicField } from '../../dynamicField';

export class ArrayField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
  };

  formatOptions = (values = []) =>
    values.map(({ valueName }) => ({ value: valueName, label: valueName }));

  creatable = !this.props.field.definedValues || !this.props.field.definedValues.length;

  formatTags = (tags) => {
    const { field } = this.props;
    const values = [];
    tags &&
      tags.forEach((item) => {
        const foundedItems = field.definedValues.find((defValue) => defValue.valueName === item);
        foundedItems && values.push(foundedItems);
      });
    return this.formatOptions(values);
  };

  parseTags = (options) => (options && options.map((option) => option.value)) || undefined;

  render() {
    const { field, ...rest } = this.props;

    return (
      <DynamicField
        field={field}
        format={this.creatable ? this.formatOptions : this.formatTags}
        parse={this.parseTags}
        {...rest}
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
