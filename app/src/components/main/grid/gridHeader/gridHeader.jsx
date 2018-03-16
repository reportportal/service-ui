import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../propTypes';
import { HeaderCell } from './headerCell';
import styles from './gridHeader.scss';

const cx = classNames.bind(styles);

export const GridHeader = ({
  columns,
  sortingColumn,
  sortingDirection,
  onChangeSorting,
  onFilterClick,
}) => (
  <div className={cx('grid-header')}>
    {
      columns.map((column, i) =>
        (
          <HeaderCell
            key={name || i}
            title={column.title}
            align={column.align}
            sortable={column.sortable}
            name={column.name}
            withFilter={column.withFilter}
            sortingDirection={sortingDirection}
            sortingActive={sortingColumn === column.name}
            onChangeSorting={onChangeSorting}
            onFilterClick={onFilterClick}
          />
        ))
    }
  </div>
);
GridHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  onFilterClick: PropTypes.func,
};
GridHeader.defaultProps = {
  columns: [],
  sortingColumn: '',
  sortingDirection: null,
  onChangeSorting: () => {
  },
  onFilterClick: () => {
  },
};
