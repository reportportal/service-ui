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

import React from 'react';
import PropTypes from 'prop-types';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { getPluginsFilter } from 'common/constants/pluginsFilter';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './pluginsFilter.scss';

const cx = classNames.bind(styles);

export const PluginsFilter = ({ filterItems, onFilterChange, activeItem }) => {
  const { trackEvent } = useTracking();
  const getFilterItems = () => getPluginsFilter(filterItems);

  const changeFilterItem = (e) => {
    e.preventDefault();
    const { id } = e.currentTarget;
    trackEvent(PLUGINS_PAGE_EVENTS.navigatedInPluginsFilterList(id));
    onFilterChange(id);
  };

  return (
    <ul className={cx('plugins-filter-list')}>
      {getFilterItems().map((item) => (
        <li key={item.value} className={cx('plugins-filter-item')}>
          <button
            className={cx('plugins-filter-button', { active: activeItem === item.value })}
            onClick={changeFilterItem}
            id={item.value}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

PluginsFilter.propTypes = {
  filterItems: PropTypes.array.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  activeItem: PropTypes.string.isRequired,
};
