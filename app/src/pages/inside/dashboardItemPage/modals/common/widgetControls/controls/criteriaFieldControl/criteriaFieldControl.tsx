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
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { RequiredDropdownControl } from '../requiredDropdownControl';

interface CriteriaFieldControlProps {
  label: string;
  options: ComponentProps<typeof RequiredDropdownControl>['options'];
  errorMessage?: string;
  validate?: (value: unknown) => string | false | undefined;
  disabled?: boolean;
  parse?: (value: unknown) => unknown;
  format?: (value: unknown) => unknown;
}

// The required multi-select "Criteria for widget" field shared by the widget controls.
export const CriteriaFieldControl = ({
  label,
  options,
  errorMessage,
  validate,
  disabled = false,
  parse,
  format,
}: CriteriaFieldControlProps) => (
  <FieldProvider
    name="contentParameters.contentFields"
    validate={validate ?? commonValidators.createWidgetContentFieldsValidator(errorMessage)}
    parse={parse}
    format={format}
  >
    <RequiredDropdownControl
      label={label}
      options={options}
      disabled={disabled}
      multiSelect
      isOptionAllVisible
    />
  </FieldProvider>
);
