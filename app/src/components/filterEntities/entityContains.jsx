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
import { injectIntl } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { Input } from 'components/inputs/input';

@injectIntl
export class EntityContains extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    vertical: PropTypes.bool,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    onBlur: () => {},
    vertical: false,
    customProps: {},
  };
  onChangeInput = (e) => {
    this.props.onChange({ value: e.target.value });
  };
  onBlurInput = (e) => {
    this.props.onBlur({ value: e.target.value });
  };

  render() {
    const { onRemove, removable, title, smallSize, vertical, value, customProps } = this.props;

    return (
      <FieldFilterEntity
        stretchable
        title={title}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <Input
          value={value.value}
          maxLength={'128'}
          touched
          onChange={this.onChangeInput}
          onBlur={this.onBlurInput}
          {...customProps}
        />
      </FieldFilterEntity>
    );
  }
}
