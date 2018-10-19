import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../propTypes';
import { HeaderCell } from './headerCell';
import { CheckboxHeaderCell } from './checkboxHeaderCell';
import styles from './gridHeader.scss';
import { HeaderContext } from '../../scrollWrapper/scrollWrapper';

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
  isHidden,
}) => (
  <HeaderContext.Consumer>
    {(value) => (
      <div
        className={cx(
          'grid-header',
          value > 0 && !isHidden ? 'sticky' : '',
          isHidden ? cx('hidden') : '',
          { 'mobile-hide': hideHeaderForMobile },
        )}
      >
        {columns.map((column, i) => (
          <HeaderCell
            key={column.id || i}
            title={column.title}
            align={column.align}
            sortable={column.sortable}
            id={column.id}
            withFilter={column.withFilter}
            sortingDirection={sortingDirection}
            sortingActive={sortingColumn === column.id}
            onChangeSorting={onChangeSorting}
            onFilterClick={onFilterClick}
          />
        ))}
        {selectable && <CheckboxHeaderCell value={allSelected} onChange={onToggleSelectAll} />}
      </div>
    )}
  </HeaderContext.Consumer>
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
  isHidden: PropTypes.bool,
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
  isHidden: true,
};
