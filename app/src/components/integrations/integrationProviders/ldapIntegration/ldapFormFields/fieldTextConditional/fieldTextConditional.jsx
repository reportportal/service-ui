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
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import {
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_NOT_CNT,
  CONDITION_NOT_EQ,
} from 'components/filterEntities/constants';
import styles from './fieldTextConditional.scss';

const cx = classNames.bind(styles);

export function FieldTextConditional({
  value,
  placeholder,
  disabled,
  error,
  touched,
  onChange,
  conditions,
}) {
  const onClickConditionItem = (condition) => {
    if (condition !== value.condition) {
      onChange({ value: value.value, condition });
    }
  };
  const onChangeInput = (e) => {
    onChange({ value: e.target.value, condition: value.condition });
  };

  return (
    <div className={cx('field-text-conditional')}>
      <Dropdown
        options={conditions}
        onChange={(condition) => onClickConditionItem(condition)}
        value={value.condition}
        className={cx('dropdown')}
      />
      <div className={cx('input-wrapper')}>
        <FieldText
          value={value.value}
          error={error}
          placeholder={placeholder}
          touched={touched}
          disabled={disabled}
          onChange={onChangeInput}
          defaultWidth={false}
        />
      </div>
    </div>
  );
}
FieldTextConditional.propTypes = {
  value: PropTypes.shape({
    value: PropTypes.string,
    condition: PropTypes.string,
  }),
  conditions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
        shortLabel: PropTypes.string,
      }),
    ]),
  ),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  touched: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
};
FieldTextConditional.defaultProps = {
  value: {},
  placeholder: '',
  disabled: false,
  touched: false,
  error: '',
  onChange: () => {},
  conditions: [CONDITION_CNT, CONDITION_NOT_CNT, CONDITION_EQ, CONDITION_NOT_EQ],
};
