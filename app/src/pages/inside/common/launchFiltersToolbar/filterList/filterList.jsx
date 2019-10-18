/*
 * Copyright 2019 EPAM Systems
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { intlShape } from 'react-intl';
import { ALL } from 'common/constants/reservedFilterIds';
import { FilterItem } from './filterItem';
import { filterShape } from '../propTypes';
import styles from './filterList.scss';

const cx = classNames.bind(styles);

export const FilterList = ({
  filters,
  activeFilterId,
  unsavedFilterIds,
  onSelectFilter,
  onRemoveFilter,
  intl,
  allLatest,
}) => (
  <div className={cx('filter-list')}>
    {filters.map((filter) => (
      <div key={filter.id} className={cx('item')}>
        <FilterItem
          name={filter.name}
          description={filter.description}
          active={filter.id === activeFilterId}
          share={filter.share}
          unsaved={unsavedFilterIds.indexOf(filter.id) > -1}
          onClick={() => onSelectFilter(activeFilterId === filter.id ? allLatest : filter.id)}
          onRemove={() => onRemoveFilter(filter)}
          owner={filter.owner}
          intl={intl}
        />
      </div>
    ))}
  </div>
);
FilterList.propTypes = {
  filters: PropTypes.arrayOf(filterShape),
  activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unsavedFilterIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onSelectFilter: PropTypes.func,
  onRemoveFilter: PropTypes.func,
  intl: intlShape.isRequired,
  allLatest: PropTypes.string,
};
FilterList.defaultProps = {
  filters: [],
  unsavedFilterIds: [],
  activeFilterId: null,
  onSelectFilter: () => {},
  onRemoveFilter: () => {},
  allLatest: ALL,
};
