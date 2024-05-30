/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat, getMicroSeconds } from 'common/utils/timeDateUtils';
import { LOG_TIME_FORMAT_ABSOLUTE, LOG_TIME_FORMAT_EXTENDED } from 'controllers/user/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setLogTimeFormatAction, userIdSelector } from 'controllers/user';
import { logTimeFormatSelector } from 'controllers/user/selectors';
import { setLogTimeFormatInStorage } from 'controllers/log/storageUtils';
import styles from './flexibleLogTime.scss';

const cx = classNames.bind(styles);

export const FlexibleLogTime = ({ time }) => {
  const dispatch = useDispatch();
  const logTimeFormat = useSelector(logTimeFormatSelector);
  const userId = useSelector(userIdSelector);

  const isAbsolute = () => logTimeFormat === LOG_TIME_FORMAT_ABSOLUTE;
  const toggleFormat = () => {
    const format = isAbsolute() ? LOG_TIME_FORMAT_EXTENDED : LOG_TIME_FORMAT_ABSOLUTE;
    dispatch(setLogTimeFormatAction(format));
    setLogTimeFormatInStorage(userId, format);
  };
  const absoluteTime = dateFormat(time);

  const extractMilliseconds = () => getMicroSeconds(time).slice(0, 3);

  const extractMicroSeconds = () => getMicroSeconds(time).slice(3);

  const extractTime = () => absoluteTime.slice(-8);

  return (
    <button className={cx('flexible-log-time', { extended: !isAbsolute() })} onClick={toggleFormat}>
      <span className={cx('absolute-time')}>{absoluteTime}</span>
      <span className={cx('extended-time')}>
        {extractTime()}.{extractMilliseconds()}
        <span className={cx('micro-seconds')}>{extractMicroSeconds()}</span>
      </span>
    </button>
  );
};

FlexibleLogTime.propTypes = {
  time: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
FlexibleLogTime.defaultProps = {
  time: 0,
};
