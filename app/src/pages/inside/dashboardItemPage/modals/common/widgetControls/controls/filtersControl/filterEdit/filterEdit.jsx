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
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import { messages } from '../common/messages';
import { AddEditFilter } from '../common/addEditFilter';
import styles from './filterEdit.scss';

const cx = classNames.bind(styles);

export class FilterEdit extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
  };

  onFilterSave = () => {
    this.props.onSave(this.props.filter);
  };

  onFilterCancel = () => {
    this.props.onCancel(this.props.filter);
  };

  onFilterChange = (data) => {
    this.props.onChange(data);
  };

  getCustomBlock = (filter) => (
    <div className={cx('filter-edit-header')}>
      <InputRadio value={filter.id} ownValue={filter.id} name="filter-item" circleAtTop>
        {filter.name}
      </InputRadio>
    </div>
  );

  render() {
    const { filter } = this.props;

    return (
      <AddEditFilter
        filter={filter}
        onCancel={this.onFilterCancel}
        onSubmit={this.onFilterSave}
        onChange={this.onFilterChange}
        customBlock={this.getCustomBlock(filter)}
        blockTitle={messages.editTitle}
      />
    );
  }
}
