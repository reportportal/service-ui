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
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';

@injectIntl
export class EntityRadioGroup extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    removable: PropTypes.bool,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    title: PropTypes.string,
    customProps: PropTypes.object,
    smallSize: PropTypes.bool,
    vertical: PropTypes.bool,
  };
  static defaultProps = {
    title: '',
    removable: true,
    onChange: () => {},
    onRemove: () => {},
    smallSize: false,
    vertical: false,
    customProps: {},
  };
  onChange = (value) => {
    const {
      value: { condition },
    } = this.props;
    this.props.onChange({ value, condition });
  };
  render() {
    const {
      value: { value },
      onRemove,
      removable,
      title,
      vertical,
      smallSize,
      customProps,
    } = this.props;
    return (
      <FieldFilterEntity
        title={title}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
        smallSize={smallSize}
      >
        <InputRadioGroup value={value} onChange={this.onChange} {...customProps} />
      </FieldFilterEntity>
    );
  }
}
