import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PageButtons } from './pageButtons';
import { PageSizeControl } from './pageSizeControl';
import { ItemCounter } from './itemCounter';

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
    {itemCount
      ? <ItemCounter activePage={activePage} pageSize={pageSize} itemCount={itemCount} />
      : null
    }
    {pageCount && pageCount > 1
      ? <PageButtons activePage={activePage} pageCount={pageCount} onChangePage={onChangePage} />
      : null
    }
    {pageSize
      ? <PageSizeControl pageSize={pageSize} onChangePageSize={onChangePageSize} />
      : null
    }
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
