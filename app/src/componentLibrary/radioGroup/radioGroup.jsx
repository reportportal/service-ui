/*
 * Copyright 2022 EPAM Systems
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
import React from 'react';
import styles from './radioGroup.scss';
import { RadioButton } from './radioButton';

const cx = classNames.bind(styles);

export const RadioGroup = ({ options, value, ...rest }) => (
  <div className={cx('radio-group')}>
    {options.map((option) => (
      <RadioButton option={option} value={value} {...rest} />
    ))}
  </div>
);
RadioGroup.propTypes = {
  variant: PropTypes.oneOf(['light', 'dark']),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
      disabled: PropTypes.bool,
    }),
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
};
RadioGroup.defaultProps = {
  variant: 'light',
  options: [],
  value: '',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  className: '',
};
