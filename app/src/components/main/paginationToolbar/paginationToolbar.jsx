import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PageButtons } from './pageButtons';
import { PageSizeControl } from './pageSizeControl';
import { ItemCounter } from './itemCounter';
import { NoItemMessage } from './noItemMessage';
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
    {itemCount === 0 && <NoItemMessage />}
    {itemCount > 0 && (
      <ItemCounter activePage={activePage} pageSize={pageSize} itemCount={itemCount} />
    )}
    {pageCount > 1 && (
      <PageButtons activePage={activePage} pageCount={pageCount} onChangePage={onChangePage} />
    )}
    {pageSize &&
      itemCount > 0 && <PageSizeControl pageSize={pageSize} onChangePageSize={onChangePageSize} />}
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
  onChangePage: () => {},
  onChangePageSize: () => {},
};
