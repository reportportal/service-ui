/*
 * Copyright 2025 EPAM Systems
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

import { ReactNode } from 'react';
import classNames from 'classnames/bind';
import { Dropdown } from '@reportportal/ui-kit';

import styles from './dropdownWithDescription.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface DropdownWithDescriptionProps {
  label: string;
  options: DropdownOption[];
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  touched?: boolean;
  selectedItem?: DropdownOption;
}

export const DropdownWithDescription = ({
  label,
  options,
  className = '',
  value,
  onChange,
  selectedItem,
  error,
  touched,
}: DropdownWithDescriptionProps) => {
  const currentValue = value || selectedItem?.value || '';
  const currentIcon =
    selectedItem?.icon || options.find(({ value: itemValue }) => itemValue === currentValue)?.icon;

  return (
    <Dropdown
      label={label}
      value={currentValue}
      icon={currentIcon}
      options={options}
      className={className}
      renderOption={({ option, selected }) => {
        const dropdownOption = option as DropdownOption;

        return (
          <div
            className={cx('dropdown-with-description', {
              [cx('dropdown-with-description__selected')]: selected,
            })}
          >
            {dropdownOption.icon}
            <div>
              <div className={cx('dropdown-with-description__label')}>{dropdownOption.label}</div>
              <div className={cx('dropdown-with-description__description')}>
                {dropdownOption.description}
              </div>
            </div>
          </div>
        );
      }}
      error={error}
      touched={touched}
      onChange={onChange}
    />
  );
};
