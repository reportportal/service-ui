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
import { Dropdown, ThemeProvider } from '@reportportal/ui-kit';
import { DynamicField } from '../dynamicField';

export class DropdownField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    defaultOptionValueKey: PropTypes.string.isRequired,
    darkView: PropTypes.bool,
  };

  getInputOptions = (values = []) =>
    values.map((item) => ({
      value: item[this.props.defaultOptionValueKey],
      label: item.valueName,
    }));

  parseDropdownValue = (value) => value && [value];

  formatDropdownValue = (value) => value?.[0];

  render() {
    const { field, darkView, ...rest } = this.props;
    return (
      <ThemeProvider theme={darkView ? 'dark' : 'light'}>
        <DynamicField
          field={field}
          parse={this.parseDropdownValue}
          format={this.formatDropdownValue}
          darkView={darkView}
          {...rest}
        >
          <Dropdown mobileDisabled options={this.getInputOptions(field.definedValues)} />
        </DynamicField>
      </ThemeProvider>
    );
  }
}
