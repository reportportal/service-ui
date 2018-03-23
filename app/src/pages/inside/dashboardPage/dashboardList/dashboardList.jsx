import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { DashboardGrid } from './dashboardGrid';
import { DashboardTable } from './dashboardTable';

export const DashboardList = ({ gridType, ...rest }) => {
  const DashboardListComponent = gridType === 'table' ? DashboardTable : DashboardGrid;

  return (
    <Fragment>
      <DashboardListComponent {...rest} />
    </Fragment>
  );
};

DashboardList.propTypes = {
  gridType: PropTypes.string,
};
DashboardList.defaultProps = {
  gridType: '',
};
