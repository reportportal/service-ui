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

import type { ReactNode } from 'react';
import classNames from 'classnames/bind';
import { FormField, type FormFieldProps } from 'components/fields/formField';
import styles from './integrationFormField.scss';

const cx = classNames.bind(styles);

export type IntegrationFormFieldProps = FormFieldProps & {
  lineAlign?: boolean;
  formFieldContainerClassName?: string;
  children: ReactNode;
};

export const IntegrationFormField = ({
  lineAlign = false,
  children,
  formFieldContainerClassName = '',
  ...rest
}: IntegrationFormFieldProps) => (
  <FormField
    containerClassName={cx(
      'form-field-container',
      { 'line-align': lineAlign },
      formFieldContainerClassName,
    )}
    fieldWrapperClassName={cx('form-field-wrapper')}
    labelClassName={cx('label')}
    {...rest}
  >
    {children}
  </FormField>
);
