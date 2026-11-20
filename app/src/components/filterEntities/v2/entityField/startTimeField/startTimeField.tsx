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

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import moment from 'moment';
import { Checkbox, Dropdown } from '@reportportal/ui-kit';
import { DropdownValue } from '@reportportal/ui-kit/dropdown';
import { DATE_FORMAT_DROPDOWN } from 'common/constants/timeDateFormat';
import { createClassnames, getMinutesFromTimestamp, parseDateTimeRange } from 'common/utils';
import { CONDITION_BETWEEN } from 'components/filterEntities/constants';
import { getTimeDateRangePresets } from 'components/filterEntities';
import { DateRangeFormField } from 'components/main/dateRange';
import { FieldRow } from '../../fieldRow';
import { FilterEntityCustomProps, FilterEntityValue } from '../../types';
import styles from './startTimeField.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined' ? undefined : document.getElementById('tooltip-root') || document.body;

const messages = defineMessages({
  anyTime: {
    id: 'InputTimeDateRange.anyTime',
    defaultMessage: 'Any',
  },
  today: {
    id: 'EntityItemStartTime.today',
    defaultMessage: 'Today',
  },
  last2days: {
    id: 'EntityItemStartTime.last2days',
    defaultMessage: 'Last 2 days',
  },
  last7days: {
    id: 'EntityItemStartTime.last7days',
    defaultMessage: 'Last 7 days',
  },
  last30days: {
    id: 'EntityItemStartTime.last30days',
    defaultMessage: 'Last 30 days',
  },
  dynamicUpdate: {
    id: 'InputTimeDateRange.dynamicUpdate',
    defaultMessage: 'Dynamic update',
  },
  dynamicUpdateHint: {
    id: 'InputTimeDateRange.dynamicUpdateHint',
    defaultMessage: 'Your time range will be updated every day',
  },
});

const PRESET_LABELS = [messages.today, messages.last2days, messages.last7days, messages.last30days];

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const formatDateValue = ({
  start,
  end,
  dynamic,
}: {
  start: number;
  end: number;
  dynamic?: boolean;
}) => {
  if (!dynamic) {
    return `${start},${end}`;
  }

  return `${getMinutesFromTimestamp(start)};${getMinutesFromTimestamp(end)};${moment().format('ZZ')}`;
};

const toDateRange = (value: FilterEntityValue): DateRange => {
  const { start, end } = parseDateTimeRange(value);

  return {
    startDate: start ? new Date(start) : null,
    endDate: end ? new Date(end) : null,
  };
};

const isValidDateRange = (dateRange: DateRange) =>
  Boolean(
    dateRange.startDate && dateRange.endDate && dateRange.startDate <= dateRange.endDate,
  );

interface StartTimeFieldProps {
  title: string;
  value: FilterEntityValue;
  removable: boolean;
  disabled: boolean;
  customProps: FilterEntityCustomProps;
  shouldFocus: boolean;
  onChange: (value: FilterEntityValue, isConditionChange?: boolean) => void;
  onRemove: () => void;
  onAutoFocus?: () => void;
}

export const StartTimeField = ({
  title,
  value,
  removable,
  disabled,
  customProps,
  shouldFocus,
  onChange,
  onRemove,
  onAutoFocus,
}: StartTimeFieldProps) => {
  const { formatMessage } = useIntl();
  const withoutDynamic = Boolean(customProps.withoutDynamic);
  const currentValue = value.value || '';
  const parsedRange = parseDateTimeRange(value);

  const [customDateRange, setCustomDateRange] = useState<DateRange>(() => toDateRange(value));
  const [isDynamic, setIsDynamic] = useState(() => parsedRange.dynamic);

  const options = useMemo(
    () =>
      getTimeDateRangePresets().map((preset, index) => {
        const { start, end } = preset.getValue();

        return {
          label: formatMessage(PRESET_LABELS[index]),
          value: formatDateValue({ start, end, dynamic: true }),
        };
      }),
    [formatMessage],
  );

  const presetValues = useMemo(() => options.map((option) => option.value), [options]);

  const resetCustomDateRange = useCallback(() => {
    setCustomDateRange(toDateRange(value));
    setIsDynamic(parseDateTimeRange(value).dynamic);
  }, [value]);

  useEffect(() => {
    resetCustomDateRange();
  }, [resetCustomDateRange]);

  const commitDateRange = useCallback(
    (dateRange: DateRange, dynamic: boolean) => {
      if (!isValidDateRange(dateRange) || !dateRange.startDate || !dateRange.endDate) {
        return;
      }

      onChange({
        condition: CONDITION_BETWEEN,
        value: formatDateValue({
          start: dateRange.startDate.valueOf(),
          end: dateRange.endDate.valueOf(),
          dynamic,
        }),
      });
    },
    [onChange],
  );

  const handleDropdownChange = useCallback(
    (nextValue?: DropdownValue | DropdownValue[]) => {
      if (nextValue === undefined || Array.isArray(nextValue)) {
        return;
      }

      onChange({ condition: CONDITION_BETWEEN, value: String(nextValue) });
    },
    [onChange],
  );

  const handleCustomDateChange = useCallback(
    (dateRange: DateRange) => {
      setCustomDateRange(dateRange);

      if (isValidDateRange(dateRange)) {
        commitDateRange(dateRange, isDynamic);
      }
    },
    [commitDateRange, isDynamic],
  );

  const handleDynamicChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextDynamic = event.target.checked;
      setIsDynamic(nextDynamic);

      if (isValidDateRange(customDateRange)) {
        commitDateRange(customDateRange, nextDynamic);
      }
    },
    [commitDateRange, customDateRange],
  );

  const footer = useCallback(
    (closeDropdown: () => void) => (
      <div className={cx('footer')}>
        <DateRangeFormField
          input={{
            value: customDateRange,
            onChange: handleCustomDateChange,
          }}
          onClose={closeDropdown}
        />
        {!withoutDynamic && (
          <div className={cx('dynamic-update')}>
            <Checkbox value={isDynamic} onChange={handleDynamicChange}>
              {formatMessage(messages.dynamicUpdate)}
            </Checkbox>
            {isDynamic && (
              <span className={cx('dynamic-update-hint')}>
                {formatMessage(messages.dynamicUpdateHint)}
              </span>
            )}
          </div>
        )}
      </div>
    ),
    [
      customDateRange,
      formatMessage,
      handleCustomDateChange,
      handleDynamicChange,
      isDynamic,
      withoutDynamic,
    ],
  );

  const formatDisplayedValue = useCallback(() => {
    if (!currentValue) {
      return formatMessage(messages.anyTime);
    }

    if (presetValues.includes(currentValue)) {
      return options.find((option) => option.value === currentValue)?.label || currentValue;
    }

    if (!parsedRange.start || !parsedRange.end) {
      return formatMessage(messages.anyTime);
    }

    return `${moment(parsedRange.start).format(DATE_FORMAT_DROPDOWN)} — ${moment(
      parsedRange.end,
    ).format(DATE_FORMAT_DROPDOWN)}`;
  }, [currentValue, formatMessage, options, parsedRange.end, parsedRange.start, presetValues]);

  return (
    <FieldRow
      title={title}
      removable={removable}
      disabled={disabled}
      shouldFocus={shouldFocus}
      onRemove={onRemove}
      onAutoFocus={onAutoFocus}
    >
      <Dropdown
        options={options}
        value={currentValue}
        disabled={disabled}
        notScrollable
        placeholder={formatMessage(messages.anyTime)}
        formatDisplayedValue={formatDisplayedValue}
        footer={footer}
        menuPortalRoot={menuPortalRoot}
        selectListClassName={cx('select-list')}
        onChange={handleDropdownChange}
        onBlur={resetCustomDateRange}
      />
    </FieldRow>
  );
};
