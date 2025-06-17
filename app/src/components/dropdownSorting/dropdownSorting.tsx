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

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, Popover, DropdownIcon } from '@reportportal/ui-kit';
import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting';
import { SortingDirection } from 'controllers/sorting/types';
import classNames from 'classnames/bind';
import { Keys } from 'common/constants/keyCodes';
import { DropdownSortingOption } from './dropdownSortingOption';
import styles from './dropdownSorting.scss';

const cx = classNames.bind(styles);

interface SortParams {
  value: string;
  direction: SortingDirection;
}

interface DropdownSortingProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  direction: SortingDirection;
  onChange: ({ value, direction }: SortParams) => void;
}

export const DropdownSorting: FC<DropdownSortingProps> = ({
  options,
  value,
  direction,
  onChange,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const displayedValue = options.find((option) => option.value === value)?.label ?? 'Sort by';
  const defaultHighLightedIndex = options.findIndex((option) => option.value === value);
  const [highlightedIndex, setHighlightedIndex] = useState(
    defaultHighLightedIndex > -1 ? defaultHighLightedIndex : 0,
  );
  const listRef = useRef<HTMLDivElement>(null);
  const [keyboardControl, setKeyboardControl] = useState(false);

  useEffect(() => {
    if (isOpened) {
      listRef.current?.focus();
    } else {
      setKeyboardControl(false);
    }
  }, [isOpened]);

  const handleChange = useCallback(
    (selectedValue: string) => {
      const toggleDirection = (current: string) =>
        current === SORTING_ASC ? SORTING_DESC : SORTING_ASC;

      const newDirection = selectedValue === value ? toggleDirection(direction) : SORTING_ASC;
      onChange({ value: selectedValue, direction: newDirection });
      setIsOpened(false);
    },
    [value, direction, onChange],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardControl) {
      setKeyboardControl(true);
      return;
    }

    if ([Keys.ENTER, Keys.SPACE].includes(event.key)) {
      event.preventDefault();
      handleChange(options[highlightedIndex].value);
    }

    if (event.key === Keys.ARROW_DOWN) {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    }

    if (event.key === Keys.ARROW_UP) {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
    }
  };

  const renderOptions = () => {
    return options.map((option, index) => {
      const selected = option.value === value;
      const highlighted = index === highlightedIndex && keyboardControl;

      return (
        <DropdownSortingOption
          key={option.value}
          value={option.value}
          selected={selected}
          label={option.label}
          onChange={handleChange}
          direction={direction}
          highlightHovered={highlighted}
        />
      );
    });
  };

  return (
    <Popover
      content={
        <div
          role="listbox"
          className={cx('select-list')}
          ref={listRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {renderOptions()}
        </div>
      }
      className={cx('popover')}
      placement="bottom-end"
      isOpened={isOpened}
      setIsOpened={setIsOpened}
    >
      <button
        type="button"
        className={cx('value', { open: isOpened })}
        tabIndex={0}
        onKeyDown={() => setKeyboardControl(true)}
      >
        {direction === SORTING_ASC ? <ArrowUpIcon /> : <ArrowDownIcon />}
        {displayedValue}
        <div className={cx('arrow')}>
          <DropdownIcon />
        </div>
      </button>
    </Popover>
  );
};
