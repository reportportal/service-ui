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
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            title={column.title}
            align={column.align}
          />
        ))
    }
  </div>
);
GridHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.object,
    align: PropTypes.oneOf([ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]),
  })),
};
GridHeader.defaultProps = {
  columns: [],
};

const HeaderCell = ({ title, align }) => (
  <div className={cx('grid-header-cell', { [`align-${align}`]: align })}>
    {title ? title.full : null}
  </div>
);
HeaderCell.propTypes = {
  title: PropTypes.object,
  align: PropTypes.oneOf([ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]),
};
HeaderCell.defaultProps = {
  title: {},
  align: ALIGN_LEFT,
};
