import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../propTypes';
import { GridCell } from './gridCell';
import styles from './gridBody.scss';

const cx = classNames.bind(styles);

export const GridBody = ({ columns, data }) =>
  data.map((row, i) => (
    <GridRow key={row.id || i} columns={columns} value={row} />
  ));

const GridRow = ({ columns, value }) => (
  <div className={cx('grid-row')}>
    {
      columns.map((column, i) => (
        <GridCell
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          width={column.width}
          mobileWidth={column.mobileWidth}
          selectors={column.selectors}
          value={value}
          align={column.align}
          component={column.component}
          formatter={column.formatter}
          title={column.title}
        />
      ))
    }
  </div>
);
GridRow.propTypes = {
  columns: PropTypes.arrayOf(columnPropTypes),
  value: PropTypes.object,
};
GridRow.defaultProps = {
  columns: [],
  value: {},
};
