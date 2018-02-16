import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PageButtons } from './pageButtons';
import { PageSizeControl } from './pageSizeControl';

import styles from './paginationToolbar.scss';

const cx = classNames.bind(styles);

export const PaginationToolbar = ({
  activePage,
  pageCount,
  pageSize,
  itemCount,
  onChangePage,
  onChangePageSize,
}) => (
  <div className={cx('pagination-toolbar')}>
    <ItemCounter activePage={activePage} pageSize={pageSize} itemCount={itemCount} />
    <PageButtons activePage={activePage} pageCount={pageCount} onChangePage={onChangePage} />
    <PageSizeControl pageSize={pageSize} onChangePageSize={onChangePageSize} />
  </div>
);
PaginationToolbar.propTypes = {
  activePage: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};
PaginationToolbar.defaultProps = {
  onChangePage: () => {
  },
  onChangePageSize: () => {
  },
};

const ItemCounter = ({ activePage, pageSize, itemCount }) => {
  const endIndex = activePage * pageSize;
  const startIndex = endIndex - pageSize;
  return (
    <div>{`${startIndex + 1} - ${endIndex < itemCount ? endIndex : itemCount}`} of {itemCount}</div>
  );
};
ItemCounter.propTypes = {
  activePage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
};
