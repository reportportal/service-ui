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

import { FC } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { SORTING_ASC } from 'controllers/sorting';
import { SortingDirection } from 'controllers/sorting/types';
import styles from './dropdownSortingOption.scss';

const cx = classNames.bind(styles);

interface DropdownSortingOptionProps {
  label: string;
  selected: boolean;
  value: string;
  direction: SortingDirection;
  onChange?: (value: string) => void;
  highlightHovered?: boolean;
}

export const DropdownSortingOption: FC<DropdownSortingOptionProps> = ({
  label,
  selected,
  onChange,
  value,
  direction,
  highlightHovered = false,
}: DropdownSortingOptionProps) => {
  let icon = <ArrowUpIcon />;
  if (selected) {
    icon = direction === SORTING_ASC ? <ArrowUpIcon /> : <ArrowDownIcon />;
  }

  const onClickHandler = () => {
    onChange?.(value);
  };

  return (
    <div
      role="option"
      aria-selected={selected}
      className={cx('dropdown-option', {
        selected,
        hover: highlightHovered,
      })}
      onClick={onClickHandler}
      onKeyDown={() => {}}
      tabIndex={-1}
    >
      <div className={cx('icon')}>{icon}</div>
      <div className={cx('label')}>{label}</div>
    </div>
  );
};
