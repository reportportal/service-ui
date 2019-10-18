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
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { DynamicField } from '../../dynamicField';
import styles from './dateField.scss';

const cx = classNames.bind(styles);

export const DATE_FORMAT = 'YYYY-MM-DD';

export class DateField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
  };

  parseDateValue = (value) => [(value && moment(value).format(DATE_FORMAT)) || ''];

  formatDateValue = (value) => value && value[0];

  render() {
    const { field, ...rest } = this.props;
    return (
      <div className={cx('date-field')}>
        <DynamicField
          field={field}
          parse={this.parseDateValue}
          format={this.formatDateValue}
          {...rest}
        >
          <DatePicker className={cx('date-input')} fixedHeight dateFormat={DATE_FORMAT} />
        </DynamicField>
      </div>
    );
  }
}
