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

import { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, PlusIcon, Popover, SubLevelIcon, Tooltip } from '@reportportal/ui-kit';
import { Scrollbars } from 'rc-scrollbars';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { SearchField } from 'components/fields/searchField';
import { FilterEntity } from '../types';
import styles from './entitiesSelectorV2.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  addCondition: {
    id: 'EntitiesSelectorV2.addCondition',
    defaultMessage: 'Add Condition',
  },
  noResults: {
    id: 'EntitiesSelectorV2.noResults',
    defaultMessage: 'No results',
  },
  allConditionsAdded: {
    id: 'EntitiesSelectorV2.allConditionsAdded',
    defaultMessage: 'All available conditions have been added',
  },
});

interface EntitiesSelectorV2Props {
  entities: FilterEntity[];
  onChange: (entityId: string) => void;
}

interface ConditionOption {
  entity: FilterEntity;
  disabled: boolean;
}

const getEntityLabel = (entity: FilterEntity) => entity.meta?.longName || entity.title;

const isSubItem = (entity: FilterEntity) => Boolean(entity.meta?.subItem);

const getSubtypes = (entities: FilterEntity[], groupIndex: number) => {
  const subtypes: FilterEntity[] = [];

  for (let index = groupIndex + 1; index < entities.length; index += 1) {
    if (!isSubItem(entities[index])) {
      break;
    }

    subtypes.push(entities[index]);
  }

  return subtypes;
};

const isDefectGroup = (entities: FilterEntity[], index: number) =>
  !isSubItem(entities[index]) && index + 1 < entities.length && isSubItem(entities[index + 1]);

const getConditionOptions = (entities: FilterEntity[]): ConditionOption[] => {
  const availableEntities = entities.filter((entity) => !entity.static);
  const options: ConditionOption[] = [];

  availableEntities.forEach((entity, index) => {
    if (isSubItem(entity)) {
      if (!entity.active) {
        options.push({ entity, disabled: false });
      }

      return;
    }

    if (isDefectGroup(availableEntities, index)) {
      const hasAvailableSubtypes = getSubtypes(availableEntities, index).some(
        (subtype) => !subtype.active,
      );

      if (entity.active) {
        if (hasAvailableSubtypes) {
          options.push({ entity, disabled: true });
        }

        return;
      }

      options.push({ entity, disabled: false });

      return;
    }

    if (!entity.active) {
      options.push({ entity, disabled: false });
    }
  });

  return options;
};

const filterConditionOptions = (options: ConditionOption[], searchValue: string) => {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) {
    return options;
  }

  const matchedIds = new Set<string>();

  options.forEach(({ entity }, index) => {
    if (!getEntityLabel(entity).toLowerCase().includes(normalizedSearch)) {
      return;
    }

    matchedIds.add(entity.id);

    if (!isSubItem(entity)) {
      return;
    }

    for (let parentIndex = index - 1; parentIndex >= 0; parentIndex -= 1) {
      if (!isSubItem(options[parentIndex].entity)) {
        matchedIds.add(options[parentIndex].entity.id);
        break;
      }
    }
  });

  return options.filter(({ entity }) => matchedIds.has(entity.id));
};

export const EntitiesSelectorV2 = ({ entities, onChange }: EntitiesSelectorV2Props) => {
  const { formatMessage } = useIntl();
  const [isOpened, setIsOpened] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const conditionOptions = useMemo(() => getConditionOptions(entities), [entities]);
  const visibleOptions = useMemo(
    () => filterConditionOptions(conditionOptions, searchValue),
    [conditionOptions, searchValue],
  );
  const hasSelectableConditions = conditionOptions.some(({ disabled }) => !disabled);

  const handleOpenChange = (opened: boolean) => {
    if (!hasSelectableConditions) {
      setIsOpened(false);
      setSearchValue('');

      return;
    }

    setIsOpened(opened);

    if (!opened) {
      setSearchValue('');
    }
  };

  const handleSelect = (option: ConditionOption) => {
    if (option.disabled || option.entity.active || !option.entity.removable) {
      return;
    }

    onChange(option.entity.id);
    setSearchValue('');
    setIsOpened(false);
  };

  const addConditionButton = (
    <Button
      variant="text"
      adjustWidthOn="content"
      icon={<PlusIcon />}
      className={cx('add-condition')}
      disabled={!hasSelectableConditions}
    >
      {formatMessage(messages.addCondition)}
    </Button>
  );

  return (
    <Popover
      placement="bottom-start"
      fallbackPlacements={['top-start', 'bottom-start']}
      isCentered={false}
      strategy="fixed"
      isOpened={isOpened}
      setIsOpened={handleOpenChange}
      shouldUsePortal
      className={cx('popover')}
      content={
        <div className={cx('content')}>
          <div className={cx('search')}>
            <SearchField
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              filter=""
              onFilterChange={setSearchValue}
              placeholder={formatMessage(COMMON_LOCALE_KEYS.SEARCH)}
              isFullWidth
              isAlwaysActive
            />
          </div>
          {visibleOptions.length ? (
            <div className={cx('list')}>
              <Scrollbars hideTracksWhenNotNeeded>
                {visibleOptions.map((option) => (
                  <button
                    key={option.entity.id}
                    type="button"
                    className={cx('option')}
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                  >
                    {option.entity.meta?.subItem && <SubLevelIcon className={cx('sub-icon')} />}
                    <span className={cx('option-label')}>{getEntityLabel(option.entity)}</span>
                  </button>
                ))}
              </Scrollbars>
            </div>
          ) : (
            <div className={cx('empty')}>{formatMessage(messages.noResults)}</div>
          )}
        </div>
      }
    >
      {hasSelectableConditions ? (
        addConditionButton
      ) : (
        <Tooltip placement="top" content={formatMessage(messages.allConditionsAdded)}>
          <span className={cx('tooltip-wrapper')}>{addConditionButton}</span>
        </Tooltip>
      )}
    </Popover>
  );
};
