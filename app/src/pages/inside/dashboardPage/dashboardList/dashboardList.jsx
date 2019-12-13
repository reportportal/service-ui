/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
