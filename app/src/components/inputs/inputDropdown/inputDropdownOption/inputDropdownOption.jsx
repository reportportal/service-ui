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
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import styles from './inputDropdownOption.scss';

const cx = classNames.bind(styles);

export const DropdownOption = ({
  multiple,
  label,
  disabled,
  hidden,
  selected,
  subOption,
  onChange,
  value,
  independentSelection,
  title,
}) => {
  const onChangeHandler = () => {
    onChange && onChange(value);
  };

  const renderOptionComponent = () => {
    let component;
    if (multiple) {
      component = (
        <InputCheckbox value={selected} disabled={disabled} onChange={onChangeHandler}>
          <span className={cx('option-label')}>{label}</span>
        </InputCheckbox>
      );
    } else if (independentSelection) {
      component = (
        <InputRadio
          name="dropdownOption"
          disabled={disabled}
          value={selected ? value : null}
          ownValue={value}
          onChange={onChangeHandler}
        >
          <span className={cx('option-label')}>{label}</span>
        </InputRadio>
      );
    } else {
      component = (
        <div className={cx('single-option')} onClick={onChangeHandler}>
          {label}
        </div>
      );
    }

    return component;
  };
  return (
    <div
      className={cx('dropdown-option', {
        selected: !multiple && selected,
        disabled,
        hidden,
        'sub-option': subOption,
      })}
      title={disabled && title}
    >
      {renderOptionComponent()}
    </div>
  );
};

DropdownOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  multiple: PropTypes.bool,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool,
  subOption: PropTypes.bool,
  selected: PropTypes.bool,
  independentSelection: PropTypes.bool,
  onChange: PropTypes.func,
  title: PropTypes.string,
};

DropdownOption.defaultProps = {
  value: '',
  multiple: false,
  label: '',
  disabled: false,
  hidden: false,
  subOption: false,
  selected: false,
  independentSelection: false,
  onChange: () => {},
  title: '',
};
