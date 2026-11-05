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

import { useCallback, useState } from 'react';
import { createClassnames } from 'common/utils';
import { EntityFieldV2 } from '../entityField';
import { EntitiesSelectorV2 } from '../entitiesSelector';
import { FilterEntity, FilterEntityValue } from '../types';
import styles from './entitiesGroupV2.scss';

const cx = createClassnames(styles);

interface EntitiesGroupV2Props {
  entities?: FilterEntity[];
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  browserTooltipTitle?: string;
  onAdd?: (entity: FilterEntity) => void;
  onRemove?: (entityId: string) => void;
  onChange?: (entityId: string, value: FilterEntityValue) => void;
  onValidate?: (entityId: string, error?: string) => void;
}

const getActiveEntities = (entities: FilterEntity[]) => entities.filter((entity) => entity.active);

export const EntitiesGroupV2 = ({
  entities = [],
  errors = {},
  disabled = false,
  browserTooltipTitle = '',
  onAdd = () => undefined,
  onRemove = () => undefined,
  onChange = () => undefined,
  onValidate = () => undefined,
}: EntitiesGroupV2Props) => {
  const [focusId, setFocusId] = useState<string | null>(null);
  const clearFocus = useCallback(() => {
    setFocusId(null);
  }, []);

  const handleAdd = (entityId: string) => {
    const entity = entities.find((item) => item.id === entityId);

    if (!entity || entity.active) {
      return;
    }

    onAdd(entity);
    setFocusId(entityId);
  };

  const handleChange = (
    entity: FilterEntity,
    value: FilterEntityValue,
    isConditionChange = false,
  ) => {
    if (!isConditionChange && entity.validationFunc) {
      onValidate(entity.id, entity.validationFunc({ ...entity, value: value.value }));
    }

    onChange(entity.id, value);
  };

  return (
    <div className={cx('entities-group')}>
      {getActiveEntities(entities).map((entity) => (
        <EntityFieldV2
          key={entity.id}
          entity={entity}
          error={errors[entity.id]}
          disabled={disabled}
          shouldFocus={focusId === entity.id}
          browserTooltipTitle={browserTooltipTitle}
          onRemove={() => onRemove(entity.id)}
          onAutoFocus={clearFocus}
          onChange={(value, isConditionChange) => handleChange(entity, value, isConditionChange)}
        />
      ))}
      <div className={cx('entities-selector')}>
        <EntitiesSelectorV2 entities={entities} onChange={handleAdd} />
      </div>
    </div>
  );
};
