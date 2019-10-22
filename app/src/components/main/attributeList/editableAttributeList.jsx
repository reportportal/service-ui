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
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    keyURLCreator: PropTypes.func,
    valueURLCreator: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    onChange: () => {},
    disabled: false,
    keyURLCreator: null,
    valueURLCreator: null,
  };

  handleAddNew = () => {
    const { attributes, onChange } = this.props;
    onChange([...attributes, NEW_ATTRIBUTE]);
  };

  handleChange = (attributes) => {
    this.props.onChange(attributes);
  };

  render() {
    return (
      <AttributeList
        attributes={this.props.attributes}
        onChange={this.handleChange}
        onRemove={this.handleChange}
        onAddNew={this.handleAddNew}
        disabled={this.props.disabled}
        keyURLCreator={this.props.keyURLCreator}
        valueURLCreator={this.props.valueURLCreator}
      />
    );
  }
}
