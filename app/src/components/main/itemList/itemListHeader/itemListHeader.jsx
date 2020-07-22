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
import Parser from 'html-react-parser';
import InfoIcon from 'common/img/info-inline.svg';
import { columnShape } from '../columnShape';
import styles from './itemListHeader.scss';

const cx = classNames.bind(styles);

export const ItemListHeader = ({ columns }) => (
  <thead>
    <tr>
      {columns.map((column) => (
        <td className={cx('cell', `align-${column.align}`)} key={column.name}>
          <span>{column.label}</span>
          {column.labelTip && (
            <div className={cx('cell-icon')} title={column.labelTip}>
              {Parser(InfoIcon)}
            </div>
          )}
        </td>
      ))}
    </tr>
  </thead>
);
ItemListHeader.propTypes = {
  columns: PropTypes.arrayOf(columnShape),
};
ItemListHeader.defaultProps = {
  columns: [],
};
