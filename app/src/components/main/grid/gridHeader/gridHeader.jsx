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
import { columnPropTypes } from '../propTypes';
import { HeaderCell } from './headerCell';
import { CheckboxHeaderCell } from './checkboxHeaderCell';
import styles from './gridHeader.scss';

const cx = classNames.bind(styles);

export const GridHeader = ({
  columns,
  sortingColumn,
  sortingDirection,
  selectable,
  allSelected,
  onChangeSorting,
  onFilterClick,
  onToggleSelectAll,
  hideHeaderForMobile,
  headerClassName,
}) => (
  <div className={cx('grid-header', { 'mobile-hide': hideHeaderForMobile }, headerClassName)}>
    {columns.map((column, i) => (
      <HeaderCell
        key={column.id || i}
        title={column.title}
        align={column.align}
        size={column.size}
        backgroundColor={column.backgroundColor}
        border={column.border}
        sortable={column.sortable}
        id={column.id}
        withFilter={column.withFilter}
        filterEventInfo={column.filterEventInfo}
        sortingEventInfo={column.sortingEventInfo}
        sortingDirection={sortingDirection}
        sortingActive={sortingColumn === column.id}
        onChangeSorting={onChangeSorting}
        onFilterClick={onFilterClick}
      />
    ))}
    {selectable && <CheckboxHeaderCell value={allSelected} onChange={onToggleSelectAll} />}
  </div>
);
GridHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  selectable: PropTypes.bool,
  allSelected: PropTypes.bool,
  hideHeaderForMobile: PropTypes.bool,
  onChangeSorting: PropTypes.func,
  onFilterClick: PropTypes.func,
  onToggleSelectAll: PropTypes.func,
  headerClassName: PropTypes.string,
};
GridHeader.defaultProps = {
  columns: [],
  sortingColumn: '',
  sortingDirection: null,
  selectable: false,
  allSelected: false,
  hideHeaderForMobile: false,
  onChangeSorting: () => {},
  onFilterClick: () => {},
  onToggleSelectAll: () => {},
  headerClassName: '',
};
