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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { GridHeader } from './gridHeader';
import { GridBody } from './gridBody';
import { columnPropTypes } from './propTypes';
import styles from './grid.scss';

const cx = classNames.bind(styles);

const isAllItemsSelected = (items, selectedItems, excludeFromSelection) => {
  const excludedIds = excludeFromSelection.map((item) => item.id);
  const selectedIds = selectedItems.map((item) => item.id);
  return items.every((item) => selectedIds.includes(item.id) || excludedIds.includes(item.id));
};

export const Grid = ({
  columns,
  data,
  sortingColumn,
  sortingDirection,
  onChangeSorting,
  onFilterClick,
  selectable,
  selectedItems,
  onToggleSelectAll,
  onToggleSelection,
  className,
  changeOnlyMobileLayout,
  loading,
  rowClassMapper,
  grouped,
  groupHeader,
  groupFunction,
  excludeFromSelection,
  gridRowClassName,
  headerClassName,
  nestedStepHeader,
  nestedView,
  ...rest
}) => (
  <Fragment>
    <div className={cx('grid', className)}>
      <GridHeader
        columns={columns}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
        onFilterClick={onFilterClick}
        selectable={selectable}
        allSelected={
          !!selectedItems.length && isAllItemsSelected(data, selectedItems, excludeFromSelection)
        }
        onToggleSelectAll={onToggleSelectAll}
        hideHeaderForMobile={changeOnlyMobileLayout}
        headerClassName={headerClassName}
      />
      {!loading && (
        <GridBody
          columns={columns}
          data={data}
          selectable={selectable}
          selectedItems={selectedItems}
          onToggleSelection={onToggleSelection}
          changeOnlyMobileLayout={changeOnlyMobileLayout}
          rowClassMapper={rowClassMapper}
          groupHeader={groupHeader}
          groupFunction={groupFunction}
          grouped={grouped}
          excludeFromSelection={excludeFromSelection}
          gridRowClassName={gridRowClassName}
          nestedStepHeader={nestedStepHeader}
          nestedView={nestedView}
          {...rest}
        />
      )}
    </div>
    {loading && (
      <div className={cx('spinner-block')}>
        <SpinningPreloader />
      </div>
    )}
  </Fragment>
);
Grid.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  data: PropTypes.arrayOf(PropTypes.object),
  sortingDirection: PropTypes.string,
  sortingColumn: PropTypes.string,
  onChangeSorting: PropTypes.func,
  onFilterClick: PropTypes.func,
  selectable: PropTypes.bool,
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  onToggleSelection: PropTypes.func,
  onClickRow: PropTypes.func,
  onToggleSelectAll: PropTypes.func,
  className: PropTypes.string,
  changeOnlyMobileLayout: PropTypes.bool,
  loading: PropTypes.bool,
  rowClassMapper: PropTypes.func,
  grouped: PropTypes.bool,
  groupFunction: PropTypes.func,
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  nestedStepHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  rowHighlightingConfig: PropTypes.shape({
    onGridRowHighlighted: PropTypes.func,
    isGridRowHighlighted: PropTypes.bool,
    highlightedRowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  excludeFromSelection: PropTypes.arrayOf(PropTypes.object),
  gridRowClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  nestedView: PropTypes.bool,
};
Grid.defaultProps = {
  columns: [],
  data: [],
  sortingDirection: 'DESC',
  sortingColumn: null,
  onChangeSorting: () => {},
  onFilterClick: () => {},
  selectable: false,
  selectedItems: [],
  onToggleSelectAll: () => {},
  onToggleSelection: () => {},
  onClickRow: null,
  className: '',
  changeOnlyMobileLayout: false,
  loading: false,
  rowClassMapper: null,
  groupFunction: () => {},
  grouped: false,
  groupHeader: null,
  rowHighlightingConfig: {},
  excludeFromSelection: [],
  gridRowClassName: '',
  headerClassName: '',
  nestedStepHeader: null,
  nestedView: false,
};
