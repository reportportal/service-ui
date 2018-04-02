import { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import styles from './membersTable.scss';


const cx = classNames.bind(styles);

export class MembersTable extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    onChangePage: () => {
    },
    onChangePageSize: () => {
    },
  };


  render() {
    return (
      <Fragment>
        <div className={cx('member-table-pagination')}>
          <PaginationToolbar
            activePage={this.props.activePage}
            itemCount={this.props.itemCount}
            pageCount={this.props.pageCount}
            pageSize={this.props.pageSize}
            onChangePage={this.props.onChangePage}
            onChangePageSize={this.props.onChangePageSize}
          />
        </div>
      </Fragment>
    );
  }
}
