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
import styles from './toggleButton.scss';

const cx = classNames.bind(styles);

export const ToggleButton = ({ items, value, separated, onChange, mobileDisabled, disabled }) => (
  <div className={cx('toggle-button', { separated })}>
    {items.map((item) => (
      <div
        key={item.value}
        className={cx('button-item', {
          active: item.value === value,
          'mobile-disabled': mobileDisabled,
          disabled,
        })}
        style={{ width: `${100 / items.length}%` }}
        onClick={!disabled ? () => onChange(item.value) : null}
      >
        <span className={cx('item-label')}>{item.label}</span>
      </div>
    ))}
  </div>
);
ToggleButton.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  separated: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  onChange: PropTypes.func,
};
ToggleButton.defaultProps = {
  items: [],
  value: '',
  disabled: false,
  mobileDisabled: false,
  separated: false,
  onChange: () => {},
};
