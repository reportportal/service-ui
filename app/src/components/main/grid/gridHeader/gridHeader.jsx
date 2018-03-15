import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../propTypes';
import { HeaderCell } from './headerCell';
import styles from './gridHeader.scss';

const cx = classNames.bind(styles);

export const GridHeader = ({ columns, sortingColumn, sortingDirection, onChangeSorting }) => (
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
            sortingDirection={sortingDirection}
            sortingActive={sortingColumn === column.name}
            onChangeSorting={onChangeSorting}
          />
        ))
    }
  </div>
);
GridHeader.propTypes = {
  columns: columnPropTypes,
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
};
GridHeader.defaultProps = {
  columns: [],
  sortingColumn: '',
  sortingDirection: null,
  onChangeSorting: () => {
  },
};
