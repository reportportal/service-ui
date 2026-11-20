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

import { ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ArrowLeftIcon, Button } from '@reportportal/ui-kit';
import { addFilteringFieldToConditions } from 'controllers/filter';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_POPUP_Z_INDEX } from 'common/constants/zIndex';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroupV2 } from 'components/filterEntities/v2';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
import { FiltersSortingOrder, FiltersSortingV2 } from 'pages/inside/common/filtersSortingV2';
import {
  Filter,
  Condition,
  Order,
} from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';
import { createClassnames } from 'common/utils';
import styles from './addEditFilter.scss';

const cx = createClassnames(styles);
const menuPortalRoot = document.getElementById('tooltip-root') || document.body;

const messages = defineMessages({
  cancelAndGoBack: {
    id: 'AddEditFilter.cancelAndGoBack',
    defaultMessage: 'Cancel and Go Back',
  },
  fillRequiredTooltip: {
    id: 'AddEditFilter.fillRequiredTooltip',
    defaultMessage: 'Fill in all required fields and at least one condition to save the filter.',
  },
});

interface AddEditFilterProps {
  filter: Filter;
  isValid?: boolean;
  blockTitle?: ReactNode;
  submitTitle?: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (filter: Filter) => void;
  customBlock?: ReactNode;
}

export const AddEditFilter = ({
  filter,
  isValid = true,
  blockTitle = null,
  submitTitle = null,
  onSubmit,
  onCancel,
  onChange,
  customBlock = null,
}: AddEditFilterProps) => {
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

  const handleOrdersChange = (order: FiltersSortingOrder) => {
    const { orders = [] } = filter;
    const newOrders: Order[] = [order];
    const numberOrder = orders.find((item) => item.sortingColumn === ENTITY_NUMBER);

    if (numberOrder) {
      newOrders.push(numberOrder);
    }

    onChange({ ...filter, orders: newOrders });
  };

  const { conditions = [] } = filter;
  const hasConditionWithValue = conditions.some((item) => item.value.trim());
  const canSubmit = Boolean(isValid && hasConditionWithValue);

  return (
    <div className={cx('add-edit-filter')}>
      {blockTitle && <h3 className={cx('block-title')}>{blockTitle}</h3>}
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
            <EntitiesGroupV2
              onChange={onFilterChange}
              onValidate={onFilterValidate}
              onRemove={onFilterRemove}
              onAdd={onFilterAdd}
              errors={filterErrors}
              entities={filterEntities}
            />
          )}
        />
        <FiltersSortingV2 filter={filter} onChange={handleOrdersChange} />
        <div className={cx('filter-buttons-block')}>
          <Button
            variant="ghost"
            icon={<ArrowLeftIcon />}
            onClick={onCancel}
            adjustWidthOn="content"
          >
            {formatMessage(messages.cancelAndGoBack)}
          </Button>
          <ConditionalTooltip
            wrapperClassName={cx('tooltip-wrapper')}
            content={canSubmit ? null : formatMessage(messages.fillRequiredTooltip)}
            placement="top"
            portalRoot={menuPortalRoot}
            zIndex={MODAL_POPUP_Z_INDEX}
          >
            <Button variant="primary" onClick={onSubmit} disabled={!canSubmit}>
              {submitTitle ?? formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </Button>
          </ConditionalTooltip>
        </div>
      </div>
    </div>
  );
};
