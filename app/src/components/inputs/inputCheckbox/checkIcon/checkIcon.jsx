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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './checkIcon.scss';

const cx = classNames.bind(styles);

export const CheckIcon = ({ disabled, centered, checked }) => (
  <div className={cx('square', { centered, checked, disabled })}>
    <svg
      className={cx('icon')}
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="10"
      viewBox="0 0 8 7"
    >
      <polygon
        fill={disabled ? '#999' : '#fff'}
        fillRule="evenodd"
        points="0 3.111 3 6.222 8 1.037 7 0 3 4.148 1 2.074"
      />
    </svg>
  </div>
);

CheckIcon.propTypes = {
  disabled: PropTypes.bool,
  centered: PropTypes.bool,
  checked: PropTypes.bool,
};

CheckIcon.defaultProps = {
  disabled: false,
  centered: PropTypes.bool,
  checked: PropTypes.bool,
};
