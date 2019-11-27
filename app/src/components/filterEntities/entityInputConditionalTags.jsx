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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputConditionalTags } from 'components/inputs/inputConditionalTags';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';

const DEFAULT_MAX_LENGHT = 128;

export class EntityInputConditionalTags extends PureComponent {
  static propTypes = {
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    placeholder: '',
    onChange: () => {},
    onRemove: () => {},
    customProps: {},
  };

  render() {
    const { value, onRemove, onChange, removable, title, smallSize, customProps } = this.props;

    return (
      <FieldFilterEntity
        title={title}
        removable={removable}
        smallSize={smallSize}
        onRemove={onRemove}
        stretchable
      >
        <InputConditionalTags
          value={value}
          onChange={onChange}
          inputProps={{ maxLength: customProps.maxLength || DEFAULT_MAX_LENGHT }}
          {...customProps}
        />
      </FieldFilterEntity>
    );
  }
}
