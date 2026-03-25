/*
 * Copyright 2026 EPAM Systems
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

import { isString } from 'es-toolkit';
import { DatePicker, FieldLabel } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { parseDateOnly, toDateOnlyString } from '../milestoneDateUtils';

import styles from './milestoneDateField.scss';

import type { MilestoneDateFieldProps } from './types';

const cx = createClassnames(styles);

export const MilestoneDateField = (props: MilestoneDateFieldProps) => {
  const { input, meta, label, disabled, placeholder, shortcutSlot } = props;
  const value = parseDateOnly(isString(input.value) ? input.value : '');

  return (
    <div className={cx('milestone-date-field')}>
      <FieldLabel isRequired>{label}</FieldLabel>
      <div className={cx('milestone-date-field__picker-root')}>
        <DatePicker
          selectsRange={false}
          value={value}
          onChange={(date) => input.onChange(date ? toDateOnlyString(date) : '')}
          disabled={disabled}
          customClassName={cx('milestone-date-field__picker')}
          dateFormat="MM-dd-yyyy"
          placeholder={placeholder}
        />
      </div>
      {shortcutSlot}
      {meta.touched && isString(meta.error) && (
        <div className={cx('milestone-date-field__error')}>{meta.error}</div>
      )}
    </div>
  );
};
