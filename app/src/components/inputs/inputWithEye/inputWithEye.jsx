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
import Parser from 'html-react-parser';
import EyeIcon from 'common/img/newIcons/eye-inline.svg';
import CrossEyeIcon from 'common/img/newIcons/cross-eye-inline.svg';
import styles from './inputWithEye.scss';

const cx = classNames.bind(styles);

export const InputWithEye = ({ value, disabled, onChange, onFocus, onBlur, className }) => (
  // eslint-disable-next-line
  <label className={cx('input-with-eye', className)} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
    <input
      type="checkbox"
      className={cx('input')}
      checked={value}
      disabled={disabled}
      onChange={onChange}
    />
    <div
      className={cx('eye', {
        disabled,
      })}
    >
      {Parser(value ? EyeIcon : CrossEyeIcon)}
    </div>
  </label>
);
InputWithEye.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  iconTransparentBackground: PropTypes.bool,
  className: PropTypes.string,
  darkView: PropTypes.bool,
  responsive: PropTypes.bool,
};
InputWithEye.defaultProps = {
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  iconTransparentBackground: false,
  className: '',
  darkView: false,
  responsive: false,
};
