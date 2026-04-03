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

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { DatePicker, ClearIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import {
  START_TIME_PRESETS,
  END_OF_DAY_HOURS,
  END_OF_DAY_MINUTES,
  END_OF_DAY_SECONDS,
  END_OF_DAY_MS,
} from '../constants';
import type { StartTimeValue } from '../types';

import { getPresetDateRange, formatDateDisplay } from './utils';
import { messages } from '../messages';
import styles from './startTimeFilter.scss';

const cx = createClassnames(styles);

interface StartTimeFilterProps {
  value: StartTimeValue | null;
  onChange: (value: StartTimeValue | null) => void;
}

export const StartTimeFilter = ({ value, onChange }: StartTimeFilterProps) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const presetOptions = useMemo(
    () => [
      { value: START_TIME_PRESETS.TODAY, label: formatMessage(messages.presetToday) },
      { value: START_TIME_PRESETS.LAST_7_DAYS, label: formatMessage(messages.presetLast7Days) },
      { value: START_TIME_PRESETS.LAST_30_DAYS, label: formatMessage(messages.presetLast30Days) },
      { value: START_TIME_PRESETS.LAST_90_DAYS, label: formatMessage(messages.presetLast90Days) },
    ],
    [formatMessage],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetClick = useCallback(
    (preset: string) => {
      const range = getPresetDateRange(preset);

      onChange({ preset, ...range });
      setIsOpen(false);
    },
    [onChange],
  );

  const handleDateRangeChange = useCallback(
    ([startDate, endDate]: [Date | undefined, Date | undefined]) => {
      if (startDate && endDate) {
        const normalizedEnd = new Date(endDate);
        normalizedEnd.setHours(END_OF_DAY_HOURS, END_OF_DAY_MINUTES, END_OF_DAY_SECONDS, END_OF_DAY_MS);
        onChange({ startDate, endDate: normalizedEnd });
        setIsOpen(false);
      } else if (startDate) {
        onChange({ startDate, endDate: undefined });
      }
    },
    [onChange],
  );

  const displayValue = useMemo(() => {
    if (!value) {
      return '';
    }
    if (value.preset) {
      return presetOptions.find((opt) => opt.value === value.preset)?.label ?? '';
    }
    if (value.startDate && value.endDate) {
      return formatMessage(messages.dateRangeSeparator, {
        startDate: formatDateDisplay(value.startDate),
        endDate: formatDateDisplay(value.endDate),
      });
    }
    return '';
  }, [value, presetOptions]);

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(null);
    },
    [onChange],
  );

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div className={cx('start-time-filter')} ref={containerRef}>
      <button type="button" className={cx('trigger', { open: isOpen })} onClick={toggleOpen}>
        <span className={cx('trigger-text', { placeholder: !displayValue })}>
          {displayValue || formatMessage(messages.selectStartTime)}
        </span>
        <span className={cx('trigger-icons')}>
          {displayValue && (
            <span
              className={cx('clear-icon')}
              onClick={handleClear}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleClear(e as unknown as React.MouseEvent); }}
            >
              <ClearIcon />
            </span>
          )}
          <span className={cx('trigger-arrow', { open: isOpen })}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>

      {isOpen && (
        <div className={cx('dropdown')}>
          <div className={cx('preset-list')}>
            {presetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cx('preset-option', { selected: value?.preset === option.value })}
                onClick={() => handlePresetClick(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className={cx('divider')} />
          <div className={cx('custom-range-section')}>
            <div className={cx('custom-range-label')}>
              {formatMessage(messages.customRange)}
            </div>
            <DatePicker
              selectsRange
              value={value?.preset ? [undefined, undefined] : [value?.startDate, value?.endDate]}
              onChange={handleDateRangeChange}
              dateFormat="MM-dd-yyyy"
              placeholder={formatMessage(messages.customRangePlaceholder)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
