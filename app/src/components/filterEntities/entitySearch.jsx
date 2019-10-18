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
import { injectIntl, intlShape } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';

@injectIntl
export class EntitySearch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    vertical: false,
    customProps: {},
  };

  onChange = (value) => {
    this.props.onChange({
      condition: this.props.value.condition,
      value: value.map((val) => val.value).join(','),
    });
  };
  formatValue = (values) => values.map((value) => ({ value, label: value }));
  render() {
    const { value, onRemove, removable, title, smallSize, vertical, customProps } = this.props;
    const formattedValue = this.formatValue(value.value.split(','));
    return (
      <FieldFilterEntity
        stretchable
        title={title}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <InputTagsSearch
          value={formattedValue.length && formattedValue[0].value ? formattedValue : []}
          minLength={3}
          async
          makeOptions={this.formatValue}
          creatable
          showNewLabel
          multi
          removeSelected
          onChange={this.onChange}
          {...customProps}
        />
      </FieldFilterEntity>
    );
  }
}
