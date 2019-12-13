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
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';

export class EntityDropdown extends Component {
  static propTypes = {
    value: PropTypes.object,
    entityId: PropTypes.string,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    entityId: '',
    title: '',
    smallSize: false,
    value: {},
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    vertical: false,
    customProps: {},
  };

  getValue = () => {
    const {
      value,
      customProps: { multiple },
    } = this.props;
    if (!multiple) {
      return value.value;
    } else if (!value.value) {
      return [];
    }
    return value.value.split(',');
  };

  handleChange = (value) => {
    const {
      customProps: { multiple },
    } = this.props;
    this.props.onChange({
      condition: this.props.value.condition,
      value: multiple ? value.join(',') : value,
    });
  };

  render() {
    const { onRemove, removable, entityId, smallSize, title, vertical, customProps } = this.props;
    return (
      <FieldFilterEntity
        title={title || entityId}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <InputDropdown value={this.getValue()} onChange={this.handleChange} {...customProps} />
      </FieldFilterEntity>
    );
  }
}
