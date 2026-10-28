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

import { FC, ReactNode } from 'react';
import { useIntl, MessageDescriptor } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import { addFilteringFieldToConditions } from 'controllers/filter';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import { FiltersSorting } from 'pages/inside/common/filtersSorting';
import { Filter, Condition, Order } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';
import { createClassnames } from 'common/utils';
import styles from './addEditFilter.scss';

const cx = createClassnames(styles);

interface AddEditFilterProps {
  filter: Filter;
  isValid?: boolean;
  blockTitle?: MessageDescriptor | null;
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (filter: Filter) => void;
  customBlock?: ReactNode;
}

export const AddEditFilter: FC<AddEditFilterProps> = ({
  filter,
  isValid = true,
  blockTitle = null,
  onSubmit,
  onCancel,
  onChange,
  customBlock = null,
}) => {
  const { formatMessage } = useIntl();

  const getFilterEntities = () => {
    if (filter.conditions) {
      return filter.conditions.reduce<Record<string, Condition>>(
        (prev, current) => ({ ...prev, [current.filteringField]: current }),
        {},
      );
    }
    return {};
  };

  const handleEntitiesChange = (conditions: Record<string, Condition>) => {
    onChange({
      ...filter,
      conditions: addFilteringFieldToConditions(conditions),
    });
  };

  const handleOrdersChange = (newSortingColumn: string) => {
    const { orders = [] } = filter;
    const currentOrder = orders.length ? orders[0] : {};
    const { sortingColumn, isAsc } = currentOrder as Order;

    const sortObject: Order = {
      sortingColumn: newSortingColumn,
      isAsc: sortingColumn === newSortingColumn ? !isAsc : true,
    };

    const newOrders: Order[] = [sortObject];
    const numberColumnIndex = orders.findIndex((o) => o.sortingColumn === ENTITY_NUMBER);
    if (numberColumnIndex >= 0) {
      newOrders.push(orders[numberColumnIndex]);
    }
    onChange({ ...filter, orders: newOrders });
  };

  const isAbleToSubmit = () => {
    const { conditions = [] } = filter;
    const filteredConditions = conditions.filter((item) => item.value.trim());
    return isValid && filteredConditions.length;
  };

  return (
    <div className={cx('add-edit-filter')}>
      {blockTitle && <h2 className={cx('block-title')}>{formatMessage(blockTitle)}</h2>}
      {customBlock}
      <div className={cx('filters-block')}>
        <FilterEntitiesContainer
          level={LEVEL_LAUNCH}
          onChange={handleEntitiesChange}
          entities={getFilterEntities()}
          render={({
            onFilterAdd,
            onFilterRemove,
            onFilterValidate,
            onFilterChange,
            filterErrors,
            filterEntities,
          }) => (
            <EntitiesGroup
              onChange={onFilterChange}
              onValidate={onFilterValidate}
              onRemove={onFilterRemove}
              onAdd={onFilterAdd}
              errors={filterErrors}
              entities={filterEntities}
              entitySmallSize
            />
          )}
        />
        <FiltersSorting filter={filter} onChange={handleOrdersChange} />
        <div className={cx('filter-buttons-block')}>
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={!isAbleToSubmit()}
          >
            {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
          </Button>
        </div>
      </div>
    </div>
  );
};
