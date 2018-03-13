import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../constants';
import styles from './gridHeader.scss';

const cx = classNames.bind(styles);

export const GridHeader = ({ columns }) => (
  <div className={cx('grid-header')}>
    {
      columns.map((column, i) =>
        (
          <HeaderCell
            key={i}
            title={column.title}
            width={column.width}
            align={column.align}
          />
        ))
    }
  </div>
);
GridHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.node,
    width: PropTypes.string,
    align: PropTypes.oneOf([ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]),
  })),
};
GridHeader.defaultProps = {
  columns: [],
};

const HeaderCell = ({ title, width, align }) => (
  <div className={cx('grid-header-cell', { [`align-${align}`]: align })} style={{ width }}>
    {title}
  </div>
);
HeaderCell.propTypes = {
  title: PropTypes.node,
  width: PropTypes.string,
  align: PropTypes.oneOf([ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]),
};
HeaderCell.defaultProps = {
  title: '',
  width: 'auto',
  align: ALIGN_LEFT,
};
