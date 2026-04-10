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

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { DatePicker, Dropdown } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames, isString } from 'common/utils';

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

const CUSTOM_RANGE_VALUE = '__custom_range__';

interface StartTimeFilterProps {
  value: StartTimeValue | null;
  onChange: (value: StartTimeValue | null) => void;
}

export const StartTimeFilter = ({ value, onChange }: StartTimeFilterProps) => {
  const { formatMessage } = useIntl();

  const presetOptions = useMemo(
    () => [
      { value: START_TIME_PRESETS.TODAY, label: formatMessage(messages.presetToday) },
      { value: START_TIME_PRESETS.LAST_7_DAYS, label: formatMessage(messages.presetLast7Days) },
      { value: START_TIME_PRESETS.LAST_30_DAYS, label: formatMessage(messages.presetLast30Days) },
      { value: START_TIME_PRESETS.LAST_90_DAYS, label: formatMessage(messages.presetLast90Days) },
    ],
    [formatMessage],
  );

  const dropdownValue = useMemo(() => {
    if (!value) {
      return '';
    }
    if (value.preset) {
      return value.preset;
    }
    if (value.startDate && value.endDate) {
      return CUSTOM_RANGE_VALUE;
    }
    return '';
  }, [value]);

  const handleDropdownChange = useCallback(
    (selected: string) => {
      if (!isString(selected) || isEmpty(selected) || selected === CUSTOM_RANGE_VALUE) {
        return;
      }
      const range = getPresetDateRange(selected);

      onChange({ preset: selected, ...range });
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const formatDisplayedValue = useCallback(
    (displayedValue: string | undefined) => {
      if (value && !value.preset && value.startDate && value.endDate) {
        return formatMessage(messages.dateRangeSeparator, {
          startDate: formatDateDisplay(value.startDate),
          endDate: formatDateDisplay(value.endDate),
        });
      }
      return displayedValue ?? '';
    },
    [value, formatMessage],
  );

  const renderFooter = useCallback(
    (closeDropdown: () => void) => {
      const handleDateRangeChange = ([startDate, endDate]: [
        Date | undefined,
        Date | undefined,
      ]) => {
        if (startDate && endDate) {
          const normalizedEnd = new Date(endDate);

          normalizedEnd.setHours(
            END_OF_DAY_HOURS,
            END_OF_DAY_MINUTES,
            END_OF_DAY_SECONDS,
            END_OF_DAY_MS,
          );
          onChange({ startDate, endDate: normalizedEnd });
          closeDropdown();
        } else if (startDate) {
          onChange({ startDate, endDate: undefined });
        }
      };

      return (
        <div className={cx('custom-range-section')}>
          <div className={cx('custom-range-label')}>{formatMessage(messages.customRange)}</div>
          <DatePicker
            selectsRange
            value={value?.preset ? [undefined, undefined] : [value?.startDate, value?.endDate]}
            onChange={handleDateRangeChange}
            dateFormat="MM-dd-yyyy"
            placeholder={formatMessage(messages.customRangePlaceholder)}
          />
        </div>
      );
    },
    [value, onChange, formatMessage],
  );

  return (
    <Dropdown
      options={presetOptions}
      value={dropdownValue}
      onChange={handleDropdownChange}
      placeholder={formatMessage(messages.selectStartTime)}
      formatDisplayedValue={formatDisplayedValue}
      footer={renderFooter}
      clearable
      onClear={handleClear}
      notScrollable
    />
  );
};
