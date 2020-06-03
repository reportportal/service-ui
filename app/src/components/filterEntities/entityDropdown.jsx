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
import track from 'react-tracking';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';

@track()
export class EntityDropdown extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    value: PropTypes.object,
    entityId: PropTypes.string,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
    customProps: PropTypes.object,
    events: PropTypes.object,
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
    events: {},
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

  getOptionLabelByValue = (value) => {
    const {
      customProps: { options },
    } = this.props;

    return options.filter((item) => item.value === value)[0].label;
  };

  handleChange = (value) => {
    const {
      customProps: { multiple },
      events,
      tracking,
      title,
    } = this.props;
    if (!multiple && events.getChangeFilterEvent) {
      const label = this.getOptionLabelByValue(value);
      tracking.trackEvent(events.getChangeFilterEvent(title, label));
    }
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
