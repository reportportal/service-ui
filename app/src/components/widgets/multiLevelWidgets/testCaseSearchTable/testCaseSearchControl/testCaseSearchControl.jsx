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
import { LEVEL_WIDGET_TEST_CASE } from 'common/constants/launchLevels';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './testCaseSearchControl.scss';

const cx = classNames.bind(styles);
export const TestCaseSearchControl = ({ filter = {}, onChange, onClear }) => {
  const handleEntitiesChange = (entity) => {
    if (entity?.name?.value || entity?.compositeAttribute?.value) {
      onChange(entity);
    } else if (entity?.name.value === '' || entity?.compositeAttribute?.value === '') {
      onClear();
    }
  };
  return (
    <div className={cx('filter-controls')}>
      <FilterEntitiesContainer
        level={LEVEL_WIDGET_TEST_CASE}
        onChange={handleEntitiesChange}
        entities={filter}
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
            onValidate={(id, error) => {
              // setIsSearchNameValid(!error);
              onFilterValidate(id, error);
            }}
            onRemove={onFilterRemove}
            onAdd={onFilterAdd}
            errors={filterErrors}
            entities={filterEntities}
            staticMode
          />
        )}
      />
    </div>
  );
};

TestCaseSearchControl.propTypes = {
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
};
