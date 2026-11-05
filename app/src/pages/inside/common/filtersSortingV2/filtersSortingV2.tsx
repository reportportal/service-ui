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
import {
  STATS_AB_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_SKIPPED,
  STATS_TI_TOTAL,
  STATS_TOTAL,
} from 'common/constants/statistics';
import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting';
import { ENTITY_NAME, ENTITY_NUMBER, ENTITY_START_TIME } from 'components/filterEntities/constants';
import { createClassnames } from 'common/utils';
import styles from './filtersSortingV2.scss';

const cx = createClassnames(styles);

const menuPortalRoot = typeof document === 'undefined' ? undefined : document.body;

const SORT_COLUMNS = [
  ENTITY_NAME,
  ENTITY_START_TIME,
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
  STATS_PB_TOTAL,
  STATS_AB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
] as const;

type SortColumn = (typeof SORT_COLUMNS)[number];

const SORT_COLUMNS_SET = new Set<string>(SORT_COLUMNS);

const messages = defineMessages({
  sortBy: {
    id: 'FiltersSortingV2.sortBy',
    defaultMessage: 'Sort by',
  },
  ascending: {
    id: 'FiltersSortingV2.ascending',
    defaultMessage: 'Ascending',
  },
  descending: {
    id: 'FiltersSortingV2.descending',
    defaultMessage: 'Descending',
  },
  [ENTITY_NAME]: {
    id: 'FiltersSortingV2.launchName',
    defaultMessage: 'Launch name',
  },
  [ENTITY_START_TIME]: {
    id: 'FiltersSortingV2.startTime',
    defaultMessage: 'Start time',
  },
  [STATS_TOTAL]: {
    id: 'FiltersSortingV2.total',
    defaultMessage: 'Total',
  },
  [STATS_PASSED]: {
    id: 'FiltersSortingV2.passed',
    defaultMessage: 'Passed',
  },
  [STATS_FAILED]: {
    id: 'FiltersSortingV2.failed',
    defaultMessage: 'Failed',
  },
  [STATS_SKIPPED]: {
    id: 'FiltersSortingV2.skipped',
    defaultMessage: 'Skipped',
  },
  [STATS_PB_TOTAL]: {
    id: 'FiltersSortingV2.productBug',
    defaultMessage: 'Product Bug',
  },
  [STATS_AB_TOTAL]: {
    id: 'FiltersSortingV2.autoBug',
    defaultMessage: 'Auto Bug',
  },
  [STATS_SI_TOTAL]: {
    id: 'FiltersSortingV2.systemIssue',
    defaultMessage: 'System Issue',
  },
  [STATS_TI_TOTAL]: {
    id: 'FiltersSortingV2.toInvestigate',
    defaultMessage: 'To Investigate',
  },
});

export interface FiltersSortingOrder {
  sortingColumn: string;
  isAsc: boolean;
}

interface FiltersSortingV2Props {
  filter: {
    orders?: FiltersSortingOrder[];
  };
  onChange: (order: FiltersSortingOrder) => void;
}

const isSortColumn = (column: string): column is SortColumn => SORT_COLUMNS_SET.has(column);

const getOrder = (orders: FiltersSortingOrder[] = []): FiltersSortingOrder => {
  const currentOrder = orders.find((order) => order.sortingColumn !== ENTITY_NUMBER);

  if (!currentOrder || !isSortColumn(currentOrder.sortingColumn)) {
    return {
      sortingColumn: ENTITY_START_TIME,
      isAsc: false,
    };
  }

  return currentOrder;
};

export const FiltersSortingV2 = ({ filter, onChange }: FiltersSortingV2Props) => {
  const { formatMessage } = useIntl();
  const order = getOrder(filter.orders);

  const columnOptions = useMemo(
    () =>
      SORT_COLUMNS.map((column) => ({
        value: column,
        label: formatMessage(messages[column]),
      })),
    [formatMessage],
  );

  const directionOptions = useMemo(
    () => [
      { value: SORTING_ASC, label: formatMessage(messages.ascending) },
      { value: SORTING_DESC, label: formatMessage(messages.descending) },
    ],
    [formatMessage],
  );

  const handleColumnChange = (value: string | number | boolean | (string | number | boolean)[]) => {
    if (typeof value !== 'string' || !isSortColumn(value) || value === order.sortingColumn) {
      return;
    }

    onChange({
      sortingColumn: value,
      isAsc: order.isAsc,
    });
  };

  const handleDirectionChange = (
    value: string | number | boolean | (string | number | boolean)[],
  ) => {
    if (value !== SORTING_ASC && value !== SORTING_DESC) {
      return;
    }

    const isAsc = value === SORTING_ASC;

    if (isAsc === order.isAsc) {
      return;
    }

    onChange({
      sortingColumn: order.sortingColumn,
      isAsc,
    });
  };

  return (
    <div className={cx('filters-sorting')}>
      <div className={cx('column')}>
        <Dropdown
          label={formatMessage(messages.sortBy)}
          options={columnOptions}
          value={order.sortingColumn}
          onChange={handleColumnChange}
          menuPortalRoot={menuPortalRoot}
        />
      </div>
      <div className={cx('direction')}>
        <Dropdown
          options={directionOptions}
          value={order.isAsc ? SORTING_ASC : SORTING_DESC}
          onChange={handleDirectionChange}
          menuPortalRoot={menuPortalRoot}
        />
      </div>
    </div>
  );
};
