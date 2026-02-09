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

import { ChangeEvent } from 'react';
import { InputCheckbox } from 'components/inputs/inputCheckbox';

export interface CheckboxFieldProps {
  input: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
  label?: string;
}

export const CheckboxField = ({ input, label }: CheckboxFieldProps) => {
  const checked = Boolean(input.value);

  return (
    <InputCheckbox
      value={checked}
      onChange={(e: ChangeEvent<HTMLInputElement>) => input.onChange(e.target.checked)}
    >
      {label}
    </InputCheckbox>
  );
};
