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

import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { ENTITY_NAME, ENTITY_ATTRIBUTE } from 'components/filterEntities/constants';
import { useCallback } from 'react';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  TestCaseSearchAttributeEntity,
  TestCaseSearchNameEntity,
  TestCaseSearchStatusEntity,
} from './entityProvider';
import styles from './testCaseSearchControl.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const TestCaseSearchControl = ({ filter = {}, onSearchChange, onClear, onStatusChange }) => {
  const isFilterEmpty = !filter || (!filter.name && !filter.compositeAttribute);
  const isSearchByAttribute = !isFilterEmpty && filter.compositeAttribute;
  const isSearchByName = !isFilterEmpty && filter.name;
  const { formatMessage } = useIntl();
  const handleEntitiesChange = (entity) => {
    if (entity?.[ENTITY_NAME]?.value || entity?.[ENTITY_ATTRIBUTE]?.value) {
      onSearchChange(entity);
    } else if (entity?.[ENTITY_NAME]?.value === '' || entity?.[ENTITY_ATTRIBUTE]?.value === '') {
      onClear();
    }
  };

  const filterContainer = useCallback(
    ({
      entityProvider,
      isDisabled = false,
      onEntitiesChange = handleEntitiesChange,
      tooltipText = '',
    }) => {
      return (
        <FilterEntitiesContainer
          onChange={onEntitiesChange}
          entities={filter}
          entitiesProvider={entityProvider}
          render={({
            onFilterAdd,
            onFilterRemove,
            onFilterValidate,
            onFilterChange,
            filterErrors,
            filterEntities,
          }) => (
            <EntitiesGroup
              browserTooltipTitle={isDisabled ? tooltipText : ''}
              className={cx('filter-entity')}
              disabled={isDisabled}
              onChange={onFilterChange}
              onValidate={onFilterValidate}
              onRemove={onFilterRemove}
              onAdd={onFilterAdd}
              errors={filterErrors}
              entities={filterEntities}
              staticMode
            />
          )}
        />
      );
    },
    [filter],
  );

  return (
    <div className={cx('filter-controls')}>
      {filterContainer({
        entityProvider: TestCaseSearchNameEntity,
        isDisabled: isSearchByAttribute,
        tooltipText: formatMessage(messages.oneOption),
      })}
      <span className={cx('separator')}>{formatMessage(COMMON_LOCALE_KEYS.OR)}</span>
      {filterContainer({
        entityProvider: TestCaseSearchAttributeEntity,
        isDisabled: isSearchByName,
        tooltipText: formatMessage(messages.oneOption),
      })}
      <span className={cx('separator')}>{formatMessage(COMMON_LOCALE_KEYS.AND)}</span>
      {filterContainer({
        entityProvider: TestCaseSearchStatusEntity,
        isDisabled: isFilterEmpty,
        onEntitiesChange: onStatusChange,
        tooltipText: formatMessage(messages.testNameOrAttributeRequired),
      })}
    </div>
  );
};

TestCaseSearchControl.propTypes = {
  filter: PropTypes.object,
  onSearchChange: PropTypes.func,
  onClear: PropTypes.func,
  onStatusChange: PropTypes.func,
};
