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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { getPluginsFilter } from 'common/constants/pluginsFilter';
import styles from './pluginsFilter.scss';

const cx = classNames.bind(styles);

@injectIntl
export class PluginsFilter extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterItems: PropTypes.array.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    activeItem: PropTypes.string.isRequired,
  };

  getFilterItems = () => getPluginsFilter(this.props.filterItems);

  changeFilterItem = (e) => {
    e.preventDefault();
    this.props.onFilterChange(e.currentTarget.id);
  };

  generateItems = () => {
    const { activeItem } = this.props;

    return (
      <ul className={cx('plugins-filter-list')}>
        {this.getFilterItems().map((item) => (
          <li key={item.value} className={cx('plugins-filter-item')}>
            <button
              className={cx('plugins-filter-button', { active: activeItem === item.value })}
              onClick={this.changeFilterItem}
              id={item.value}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  render() {
    return <Fragment>{this.generateItems()}</Fragment>;
  }
}
