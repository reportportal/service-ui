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

import { forwardRef } from 'react';

import { createClassnames } from 'common/utils';
import { SortingDirection } from 'controllers/sorting/types';

import { DirectionIcon } from '../directionIcon';

import styles from './dropdownSortingOption.scss';

const cx = createClassnames(styles);

interface DropdownSortingOptionProps {
  label: string;
  selected: boolean;
  value: string;
  direction: SortingDirection;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export const DropdownSortingOptionWrapped = (
  { label, selected, value, direction, onChange, onKeyDown }: DropdownSortingOptionProps,
  ref: React.Ref<HTMLButtonElement>,
) => {
  const icon = selected ? <DirectionIcon direction={direction} /> : <DirectionIcon />;

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown(event);
  };

  const onClickHandler = () => {
    onChange(value);
  };

  return (
    <button
      type="button"
      className={cx('dropdown-option', { selected })}
      onClick={onClickHandler}
      onKeyDown={onKeyDownHandler}
      ref={ref}
      tabIndex={-1}
    >
      <div className={cx('icon')}>{icon}</div>
      <div className={cx('label')}>{label}</div>
    </button>
  );
};

export const DropdownSortingOption = forwardRef(DropdownSortingOptionWrapped);
