/*
 * Copyright 2020 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ItemListHeader } from './itemListHeader';
import { ItemListRow } from './itemListRow';
import { columnShape } from './columnShape';
import styles from './itemList.scss';

const cx = classNames.bind(styles);

export const ItemList = ({ columns, values }) => (
  <table className={cx('item-list')}>
    <ItemListHeader columns={columns} />
    <tbody>
      {values.map((value) => (
        <ItemListRow key={value.id} columns={columns} value={value} />
      ))}
    </tbody>
  </table>
);
ItemList.propTypes = {
  columns: PropTypes.arrayOf(columnShape),
  values: PropTypes.arrayOf(PropTypes.object),
};
ItemList.defaultProps = {
  columns: [],
  values: [],
};
