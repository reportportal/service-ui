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

import React from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import styles from './duration.scss';

const cx = classNames.bind(styles);

export const Duration = ({ status, startTime, endTime, approxTime }) => (
  <span className={cx('duration-block')}>
    <DurationBlock
      status={status}
      timing={{
        start: startTime,
        end: endTime,
        approxTime,
      }}
      iconClass={cx('icon')}
      durationClass={cx('duration')}
    />
  </span>
);

Duration.propTypes = {
  status: PropTypes.string,
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  approxTime: PropTypes.number,
};

Duration.defaultProps = {
  status: '',
  startTime: null,
  endTime: null,
  approxTime: null,
};
