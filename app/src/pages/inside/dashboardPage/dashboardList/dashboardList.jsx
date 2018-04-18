import React from 'react';
import PropTypes from 'prop-types';
import { DASHBOARDS_TABLE_VIEW } from 'controllers/dashboard';
import { DashboardGrid } from './dashboardGrid';
import { DashboardTable } from './dashboardTable';

export const DashboardList = ({ gridType, ...rest }) => {
  const DashboardListComponent =
    gridType === DASHBOARDS_TABLE_VIEW ? DashboardTable : DashboardGrid;

  return <DashboardListComponent {...rest} />;
};

DashboardList.propTypes = {
  gridType: PropTypes.string,
};
DashboardList.defaultProps = {
  gridType: '',
};
