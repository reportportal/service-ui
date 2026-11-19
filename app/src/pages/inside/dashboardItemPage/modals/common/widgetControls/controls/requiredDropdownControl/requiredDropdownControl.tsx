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

import { ComponentProps } from 'react';
import { Dropdown, FieldLabel } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import styles from './requiredDropdownControl.scss';

const cx = createClassnames(styles);

type DropdownProps = ComponentProps<typeof Dropdown>;

// value and onChange are injected by FieldProvider, so they are optional here.
type RequiredDropdownControlProps = Omit<DropdownProps, 'label' | 'value' | 'onChange'> &
  Partial<Pick<DropdownProps, 'value' | 'onChange'>> & {
    label: string;
  };

// ui-kit Dropdown only highlights an invalid state: it shows neither the error text
// nor the required asterisk, so both are rendered here.
export const RequiredDropdownControl = ({
  label,
  error,
  touched,
  ...rest
}: RequiredDropdownControlProps) => (
  <div>
    <FieldLabel isRequired>{label}</FieldLabel>
    <Dropdown error={error} touched={touched} {...(rest as DropdownProps)} />
    {error && touched && <div className={cx('error')}>{error}</div>}
  </div>
);
