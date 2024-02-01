/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MultipleAutocomplete } from 'componentLibrary/autocompletes/multipleAutocomplete';
import { DynamicField } from '../dynamicField';

export class ArrayField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    defaultOptionValueKey: PropTypes.string.isRequired,
    darkView: PropTypes.bool,
  };

  static defaultProps = {
    darkView: false,
  };

  formatOptions = (values = []) =>
    values.map((item) => ({
      value: item[this.props.defaultOptionValueKey],
      label: item.valueName,
    }));

  creatable = !this.props.field?.definedValues?.length;

  formatTags = (tags) => {
    const { field, defaultOptionValueKey } = this.props;
    const values = [];
    tags?.forEach((item) => {
      const foundedItems = field.definedValues.find(
        (defValue) => defValue[defaultOptionValueKey] === item,
      );
      foundedItems && values.push(foundedItems);
    });
    return this.formatOptions(values);
  };

  parseValueToString = (option) => option?.value || '';

  parseTags = (options) => options?.map(this.parseValueToString) || undefined;

  render() {
    const { field, darkView, ...rest } = this.props;

    return (
      <DynamicField
        field={field}
        format={this.creatable ? this.formatOptions : this.formatTags}
        parse={this.parseTags}
        darkView={darkView}
        {...rest}
      >
        <MultipleAutocomplete
          options={this.formatOptions(field.definedValues)}
          parseValueToString={this.parseValueToString}
          creatable={this.creatable}
          variant={darkView ? 'dark' : 'light'}
          mobileDisabled
        />
      </DynamicField>
    );
  }
}
