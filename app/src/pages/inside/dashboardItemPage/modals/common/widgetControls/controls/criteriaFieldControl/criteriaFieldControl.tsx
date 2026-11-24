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

import { ComponentProps, useMemo } from 'react';
import { omit } from 'es-toolkit';
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { RequiredDropdownControl } from '../requiredDropdownControl';

type DropdownControlProps = ComponentProps<typeof RequiredDropdownControl>;
type CriteriaOptions = NonNullable<DropdownControlProps['options']>;

// Defect type options come flat: a group option carries 'groupId' and its types carry 'groupRef'.
// The dropdown draws nested checkboxes from 'children', so the types are moved under their group.
// Options without groups are returned as they are.
const nestGroupedOptions = (options: CriteriaOptions): CriteriaOptions => {
  const groups = new Map<string, CriteriaOptions[number]>();
  const result: CriteriaOptions = [];

  options.forEach((option) => {
    const { groupId, groupRef } = option as { groupId?: string; groupRef?: string };
    const group = groupRef ? groups.get(groupRef) : undefined;

    if (groupId) {
      const nestedGroup = { ...option, children: [] };

      groups.set(groupId, nestedGroup);
      result.push(nestedGroup);
    } else if (group) {
      // 'groupRef' makes the dropdown add its own label padding, which widens the gap after the
      // checkbox; the nesting itself already gives the type its indent
      const type = omit(option, ['groupRef']) as CriteriaOptions[number];

      // a long name is cut with an ellipsis, so keep the full one in the tooltip
      group.children?.push({ title: type.label, ...type });
    } else {
      result.push(option);
    }
  });

  return result;
};

const CriteriaDropdown = ({ options = [], value, onChange, ...rest }: DropdownControlProps) => {
  const groupValues = useMemo(
    () => new Set(options.filter(({ children }) => children?.length).map(({ value: v }) => v)),
    [options],
  );

  const handleChange: DropdownControlProps['onChange'] = (nextValue) => {
    if (!Array.isArray(nextValue) || !nextValue.length || !Array.isArray(value)) {
      onChange?.(nextValue);
      return;
    }

    const keptTotals = value.filter((item) => groupValues.has(item) && !nextValue.includes(item));

    onChange?.([...nextValue, ...keptTotals]);
  };

  return (
    <RequiredDropdownControl
      {...rest}
      options={options}
      value={value}
      onChange={handleChange}
      includeGroupValue
    />
  );
};

interface CriteriaFieldControlProps {
  label: string;
  options: CriteriaOptions;
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
}: CriteriaFieldControlProps) => {
  const nestedOptions = useMemo(() => nestGroupedOptions(options), [options]);

  return (
    <FieldProvider
      name="contentParameters.contentFields"
      validate={validate ?? commonValidators.createWidgetContentFieldsValidator(errorMessage)}
      parse={parse}
      format={format}
    >
      <CriteriaDropdown
        label={label}
        options={nestedOptions}
        disabled={disabled}
        multiSelect
        isOptionAllVisible
      />
    </FieldProvider>
  );
};
