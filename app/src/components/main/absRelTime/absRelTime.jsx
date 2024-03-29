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
    startTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    startTimeFormat: PropTypes.oneOf([START_TIME_FORMAT_RELATIVE, START_TIME_FORMAT_ABSOLUTE]),
    setStartTimeFormatAction: PropTypes.func.isRequired,
    customClass: PropTypes.string,
    styles: PropTypes.object,
  };

  static defaultProps = {
    startTime: 0,
    startTimeFormat: START_TIME_FORMAT_RELATIVE,
    customClass: '',
    styles: {},
  };

  toggleFormat = () => {
    this.props.setStartTimeFormatAction(
      this.isRelative() ? START_TIME_FORMAT_ABSOLUTE : START_TIME_FORMAT_RELATIVE,
    );
  };

  isRelative = () => this.props.startTimeFormat === START_TIME_FORMAT_RELATIVE;

  render() {
    const { startTime, styles: style, customClass } = this.props;
    const { value: relativeTime, unit } = getRelativeUnits(new Date(startTime));
    return (
      <div
        className={cx('abs-rel-time', { relative: this.isRelative() }, customClass)}
        onClick={this.toggleFormat}
        style={style}
      >
        <span className={cx('relative-time')}>
          <FormattedRelativeTime value={relativeTime} unit={unit} numeric="auto" />
        </span>
        <span className={cx('absolute-time')}>{dateFormat(startTime)}</span>
      </div>
    );
  }
}

export { AbsRelTime };
