import { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { FilterTableItem } from './filterTableItem';
import { FilterTableHeader } from './filterTableHeader';
import { NoFiltersBlock } from './noFiltersBlock';
import styles from './filterTable.scss';

const cx = classNames.bind(styles);

const canDeleteFilter = (item, role, userId) =>
  role === ADMINISTRATOR || role === PROJECT_MANAGER || userId === item.owner;

export class FilterTable extends PureComponent {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    userId: PropTypes.string,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    userFilters: PropTypes.arrayOf(PropTypes.string),
    toggleDisplayFilterOnLaunches: PropTypes.func,
    projectRole: PropTypes.string,
  };

  static defaultProps = {
    filters: [],
    activePage: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 20,
    userId: '',
    onChangePage: () => {},
    onChangePageSize: () => {},
    onDelete: () => {},
    onEdit: () => {},
    userFilters: [],
    toggleDisplayFilterOnLaunches: () => {},
    projectRole: '',
  };

  render() {
    const {
      filters,
      userFilters,
      userId,
      onDelete,
      onEdit,
      toggleDisplayFilterOnLaunches,
      projectRole,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
    } = this.props;
    return (
      <Fragment>
        <div className={cx('filter-table')}>
          <FilterTableHeader />
          {filters && !!filters.length ? (
            filters.map((item) => (
              <FilterTableItem
                key={item.id}
                name={item.name}
                description={item.description}
                owner={item.owner}
                options="(TBD)"
                shared={item.share}
                showOnLaunches={userFilters.indexOf(item.id) !== -1}
                editable={item.owner === userId}
                onDelete={() => onDelete(item)}
                onEdit={() => onEdit(item)}
                onChangeDisplay={() => toggleDisplayFilterOnLaunches(item.id)}
                canBeDeleted={canDeleteFilter(item, projectRole, userId)}
              />
            ))
          ) : (
            <NoFiltersBlock />
          )}
        </div>
        <div className={cx('filter-table-pagination')}>
          <PaginationToolbar
            activePage={activePage}
            itemCount={itemCount}
            pageCount={pageCount}
            pageSize={pageSize}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        </div>
      </Fragment>
    );
  }
}
