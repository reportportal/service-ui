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

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import { Icon } from 'components/main/icon';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import styles from './filtersItem.scss';
import { useCanLockDashboard } from 'common/hooks';

const cx = classNames.bind(styles);

export const FiltersItem = memo(
  ({ filter, onChange, search, activeFilterId, editable, onEdit }) => {
    const canLock = useCanLockDashboard();
    const isDisabled = filter.locked && !canLock;

    return (
      <div className={cx('filter-item')}>
        <InputRadio
          value={activeFilterId}
          ownValue={String(filter.id)}
          name="filterId"
          onChange={onChange}
          circleAtTop
        >
          <FilterName search={search} filter={filter} showDesc={false} editable={false} />
          <FilterOptions entities={filter.conditions} sort={filter.orders}>
            {editable && onEdit && (
              <LockedDashboardTooltip
                locked={filter.locked}
                variant="filter"
                itemId={filter.id}
                wrapperClassName={cx('pencil-icon-wrapper')}
              >
                <Icon
                  className={cx('pencil-icon')}
                  type="icon-pencil"
                  onClick={onEdit}
                  disabled={isDisabled}
                />
              </LockedDashboardTooltip>
            )}
          </FilterOptions>
        </InputRadio>
      </div>
    );
  },
);

FiltersItem.propTypes = {
  filter: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  search: PropTypes.string,
  activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  editable: PropTypes.bool,
  onEdit: PropTypes.func,
};
FiltersItem.defaultProps = {
  search: '',
  activeFilterId: '',
  editable: false,
  onEdit: null,
};
