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
import { FormattedRelativeTime } from 'react-intl';
import { START_TIME_FORMAT_RELATIVE, START_TIME_FORMAT_ABSOLUTE } from 'controllers/user';
import { dateFormat, getRelativeUnits } from 'common/utils/timeDateUtils';
import styles from './absRelTime.scss';

const cx = classNames.bind(styles);

class AbsRelTime extends Component {
  static propTypes = {
    startTime: PropTypes.number,
    startTimeFormat: PropTypes.oneOf([START_TIME_FORMAT_RELATIVE, START_TIME_FORMAT_ABSOLUTE]),
    setStartTimeFormatAction: PropTypes.func.isRequired,
    customClass: PropTypes.string,
  };

  static defaultProps = {
    startTime: 0,
    startTimeFormat: START_TIME_FORMAT_RELATIVE,
    customClass: '',
  };

  toggleFormat = () => {
    this.props.setStartTimeFormatAction(
      this.isRelative() ? START_TIME_FORMAT_ABSOLUTE : START_TIME_FORMAT_RELATIVE,
    );
  };

  isRelative = () => this.props.startTimeFormat === START_TIME_FORMAT_RELATIVE;

  render() {
    const { value: startTime, unit } = getRelativeUnits(this.props.startTime);
    return (
      <div
        className={cx('abs-rel-time', { relative: this.isRelative() }, this.props.customClass)}
        onClick={this.toggleFormat}
      >
        <span className={cx('relative-time')}>
          <FormattedRelativeTime value={startTime} unit={unit} numeric="auto" />
        </span>
        <span className={cx('absolute-time')}>{dateFormat(this.props.startTime)}</span>
      </div>
    );
  }
}

export { AbsRelTime };
