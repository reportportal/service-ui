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
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputDropdownOption.scss';

const cx = classNames.bind(styles);

export const DropdownOption = ({
  multiple,
  label,
  disabled,
  selected,
  subOption,
  onChange,
  value,
}) => {
  const onChangeHandler = () => {
    onChange && onChange(value);
  };
  return (
    <div
      className={cx('dropdown-option', {
        selected: !multiple && selected,
        disabled,
        'sub-option': subOption,
      })}
    >
      {multiple ? (
        <InputCheckbox value={selected} disabled={disabled} onChange={onChangeHandler}>
          <span className={cx('option-label')}>{label}</span>
        </InputCheckbox>
      ) : (
        <div className={cx('single-option')} onClick={onChangeHandler}>
          {label}
        </div>
      )}
    </div>
  );
};

DropdownOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  multiple: PropTypes.bool,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  subOption: PropTypes.bool,
  selected: PropTypes.bool,
  onChange: PropTypes.func,
};

DropdownOption.defaultProps = {
  value: '',
  multiple: false,
  label: '',
  disabled: false,
  subOption: false,
  selected: false,
  onChange: () => {},
};
