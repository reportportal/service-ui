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

import React from 'react';
import { FieldLabel, Radio } from '@reportportal/ui-kit';
import { RadioValue } from '@reportportal/ui-kit/components/radio/radio';
import { createClassnames } from 'common/utils';
import styles from './radioGroupControl.scss';

const cx = createClassnames(styles);

type Option = {
  value: string | number;
  label: React.ReactNode;
  help?: React.ReactNode;
  disabled?: boolean;
};

interface RadioGroupControlProps {
  options: Option[];
  name?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  value?: RadioValue;
  onChange?: (value: unknown) => void;
}

export const RadioGroupControl = ({ options, name, label, disabled = false, value, onChange }: RadioGroupControlProps) => (
  <div>
    {label && <FieldLabel className={cx('label')}>{label}</FieldLabel>}
    <div className={cx('items')}>
      {options.map((opt) => (
        <div key={String(opt.value)} className={cx('item')}>
          <Radio
            option={{ value: opt.value, label: opt.label, disabled: !!(disabled || opt.disabled) }}
            name={name}
            value={value}
            onChange={() => onChange && onChange(opt.value)}
            disabled={disabled || !!opt.disabled}
          />
          {opt.help && <div className={cx('help')}>{opt.help}</div>}
        </div>
      ))}
    </div>
  </div>
);
