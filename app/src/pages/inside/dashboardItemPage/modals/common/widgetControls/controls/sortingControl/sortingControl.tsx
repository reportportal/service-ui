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

import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Dropdown } from '@reportportal/ui-kit';
import { DropdownValue } from '@reportportal/ui-kit/dropdown';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { STATS_TOTAL, STATS_FAILED } from 'common/constants/statistics';
import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting';
import { createClassnames } from 'common/utils';
import { WIDGET_OPTIONS } from '../../constants';
import styles from './sortingControl.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined'
    ? undefined
    : document.getElementById('tooltip-root') || document.body;

const messages = defineMessages({
  sortByCustomColumn: {
    id: 'SortingControl.sortByCustomColumn',
    defaultMessage: 'Custom column (A-Z 1- N)',
  },
  sortByTotal: {
    id: 'SortingControl.sortByTotal',
    defaultMessage: 'Total',
  },
  sortByPassingRate: {
    id: 'SortingControl.sortByPassingRate',
    defaultMessage: 'Passing rate',
  },
  sortByFailedItems: {
    id: 'SortingControl.sortByFailedItems',
    defaultMessage: 'Failed items',
  },
});

export interface SortingValue {
  sortingColumn: string;
  asc: boolean;
}

interface SortingControlProps {
  value?: SortingValue | null;
  onChange?: (value: SortingValue) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
}

const DEFAULT_SORT: SortingValue = {
  sortingColumn: WIDGET_OPTIONS.SORT.PASSING_RATE,
  asc: false,
};

export const SortingControl = ({
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = '',
  touched = false,
}: SortingControlProps) => {
  const { formatMessage } = useIntl();
  const sort = value ?? DEFAULT_SORT;

  const columnOptions = useMemo(
    () => [
      {
        value: WIDGET_OPTIONS.SORT.CUSTOM_COLUMN,
        label: formatMessage(messages.sortByCustomColumn),
      },
      {
        value: STATS_TOTAL,
        label: formatMessage(messages.sortByTotal),
      },
      {
        value: WIDGET_OPTIONS.SORT.PASSING_RATE,
        label: formatMessage(messages.sortByPassingRate),
      },
      {
        value: STATS_FAILED,
        label: formatMessage(messages.sortByFailedItems),
      },
    ],
    [formatMessage],
  );

  const directionOptions = useMemo(
    () => [
      { value: SORTING_ASC, label: formatMessage(COMMON_LOCALE_KEYS.ASCENDING) },
      { value: SORTING_DESC, label: formatMessage(COMMON_LOCALE_KEYS.DESCENDING) },
    ],
    [formatMessage],
  );

  const handleColumnChange = (nextValue: DropdownValue | DropdownValue[]) => {
    if (typeof nextValue !== 'string' || nextValue === sort.sortingColumn) {
      return;
    }

    onChange?.({
      sortingColumn: nextValue,
      asc: sort.asc,
    });
  };

  const handleDirectionChange = (nextValue: DropdownValue | DropdownValue[]) => {
    if (nextValue !== SORTING_ASC && nextValue !== SORTING_DESC) {
      return;
    }

    const asc = nextValue === SORTING_ASC;

    if (asc === sort.asc) {
      return;
    }

    onChange?.({
      sortingColumn: sort.sortingColumn,
      asc,
    });
  };

  return (
    <div className={cx('sorting-control')}>
      <div className={cx('column')}>
        <Dropdown
          label={formatMessage(COMMON_LOCALE_KEYS.SORT_BY)}
          options={columnOptions}
          value={sort.sortingColumn}
          onChange={handleColumnChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
          touched={touched}
          menuPortalRoot={menuPortalRoot}
        />
      </div>
      <div className={cx('direction')}>
        <Dropdown
          options={directionOptions}
          value={sort.asc ? SORTING_ASC : SORTING_DESC}
          onChange={handleDirectionChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          menuPortalRoot={menuPortalRoot}
        />
      </div>
    </div>
  );
};
