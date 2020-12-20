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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { AttributeList } from './attributeList';

const NEW_ATTRIBUTE = {
  system: false,
  edited: true,
};

export class EditableAttributeList extends Component {
  static propTypes = {
    attributes: PropTypes.arrayOf(PropTypes.object),
    disabled: PropTypes.bool,
    newAttrMessage: PropTypes.string,
    onChange: PropTypes.func,
    keyURLCreator: PropTypes.func,
    valueURLCreator: PropTypes.func,
    maxLength: PropTypes.number,
    customClass: PropTypes.string,
  };

  static defaultProps = {
    attributes: [],
    disabled: false,
    newAttrMessage: '',
    onChange: () => {},
    keyURLCreator: null,
    valueURLCreator: null,
    maxLength: Infinity,
    customClass: '',
  };

  handleAddNew = () => {
    const { attributes, onChange } = this.props;
    onChange([...attributes, NEW_ATTRIBUTE]);
  };

  handleChange = (attributes) => {
    this.props.onChange(attributes);
  };

  render() {
    const {
      attributes,
      disabled,
      keyURLCreator,
      valueURLCreator,
      newAttrMessage,
      maxLength,
      customClass,
    } = this.props;
    return (
      <AttributeList
        attributes={attributes}
        onChange={this.handleChange}
        onRemove={this.handleChange}
        onAddNew={this.handleAddNew}
        newAttrMessage={newAttrMessage}
        disabled={disabled}
        keyURLCreator={keyURLCreator}
        valueURLCreator={valueURLCreator}
        maxLength={maxLength}
        customClass={customClass}
      />
    );
  }
}
