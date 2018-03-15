import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GridHeader } from './gridHeader';
import { GridBody } from './gridBody';
import { columnPropTypes } from './propTypes';
import styles from './grid.scss';

const cx = classNames.bind(styles);

export const Grid = ({
  columns,
  data,
  sortingColumn,
  sortingDirection,
  onChangeSorting,
}) => (
  <div className={cx('grid')}>
    <GridHeader
      columns={columns}
      sortingColumn={sortingColumn}
      sortingDirection={sortingDirection}
      onChangeSorting={onChangeSorting}
    />
    <GridBody columns={columns} data={data} />
  </div>
);
Grid.propTypes = {
  columns: PropTypes.arrayOf(columnPropTypes),
  data: PropTypes.arrayOf(PropTypes.object),
  sortingDirection: PropTypes.string,
  sortingColumn: PropTypes.string,
  onChangeSorting: PropTypes.func,
};
Grid.defaultProps = {
  columns: [],
  data: [],
  sortingDirection: null,
  sortingColumn: null,
  onChangeSorting: () => {
  },
};
