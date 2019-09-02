import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { DashboardGridItem } from 'pages/inside/dashboardPage/dashboardList/dashboardGrid/dashboardGridItem';
import { EmptyDashboards } from 'pages/inside/dashboardPage/dashboardList/EmptyDashboards';
import styles from './dashboardGridList.scss';

const cx = classNames.bind(styles);

export const DashboardGridList = ({
  name,
  dashboardList,
  userDashboards,
  onEditItem,
  onDeleteItem,
  onAddItem,
  userInfo,
  loading,
  ...rest
}) => {
  const noItems = loading ? (
    <SpinningPreloader />
  ) : (
    <EmptyDashboards userDashboards={userDashboards} action={onAddItem} />
  );
  return (
    <Fragment>
      <h3 className={cx('headline')}> {name} </h3>
      <div className={cx('dashboard-grid-body')}>
        {!loading && dashboardList.length
          ? dashboardList.map((item) => (
              <DashboardGridItem
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                currentUser={userInfo}
                {...rest}
              />
            ))
          : noItems}
      </div>
    </Fragment>
  );
};

DashboardGridList.propTypes = {
  name: PropTypes.string,
  dashboardList: PropTypes.array,
  userDashboards: PropTypes.bool,
  onEditItem: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onAddItem: PropTypes.func,
  userInfo: PropTypes.object,
  loading: PropTypes.bool,
};
DashboardGridList.defaultProps = {
  name: '',
  dashboardList: [],
  userDashboards: false,
  onEditItem: () => {},
  onDeleteItem: () => {},
  onAddItem: () => {},
  userInfo: () => {},
  loading: false,
};
