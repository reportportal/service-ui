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

import React from 'react';
import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { RadioGroup } from 'componentLibrary/radioGroup';
import classNames from 'classnames/bind';
import style from './radioGroupControl.scss';
import { FIELD_LABEL_WIDTH } from './constants';

const cx = classNames.bind(style);

export function RadioGroupControl({ onChange, value, options, fieldLabel }) {
  const handleValueChange = ({ target: { value: radioButtonValue } }) => {
    onChange(JSON.parse(radioButtonValue));
  };

  return (
    <ModalField
      label={fieldLabel}
      labelWidth={FIELD_LABEL_WIDTH}
      className={cx('radio-group-control-wrapper')}
      noMinHeight
    >
      <RadioGroup
        options={options}
        className={cx('radio-group')}
        value={`${value}`}
        onChange={handleValueChange}
      />
    </ModalField>
  );
}

RadioGroupControl.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.bool, disabled: PropTypes.bool }),
  ),
  fieldLabel: PropTypes.string,
};

RadioGroupControl.defaultProps = {
  onChange: () => {},
  value: true,
  options: [],
  fieldLabel: '',
};
