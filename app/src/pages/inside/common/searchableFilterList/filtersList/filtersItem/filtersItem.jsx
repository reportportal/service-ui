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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { InputRadio } from 'components/inputs/inputRadio';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './filtersItem.scss';

const cx = classNames.bind(styles);

export class FiltersItem extends PureComponent {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    search: PropTypes.string,
    userId: PropTypes.string,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    editable: PropTypes.bool,
    onEdit: PropTypes.func,
  };

  static defaultProps = {
    search: '',
    userId: '',
    activeFilterId: '',
    item: {},
    editable: false,
    onEdit: () => {},
  };

  render() {
    const { activeFilterId, filter, search, onChange, editable, onEdit, userId } = this.props;

    return (
      <div className={cx('filter-item')}>
        <InputRadio
          value={activeFilterId}
          ownValue={String(filter.id)}
          name="filterId"
          onChange={onChange}
          circleAtTop
        >
          <FilterName
            search={search}
            filter={filter}
            userId={userId}
            showDesc={false}
            editable={false}
          />
          <FilterOptions entities={filter.conditions} sort={filter.orders}>
            {userId === filter.owner && editable && (
              <span className={cx('pencil-icon')} onClick={onEdit}>
                {Parser(PencilIcon)}
              </span>
            )}
          </FilterOptions>
        </InputRadio>
      </div>
    );
  }
}
