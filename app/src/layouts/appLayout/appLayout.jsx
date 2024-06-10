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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout } from 'layouts/common/layout';
import { isDemoInstanceSelector } from 'controllers/appInfo';
import { ORGANIZATION_LEVEL, INSTANCE_LEVEL } from 'routes/constants';
import { AppHeader } from './appHeader';
import { ProjectSidebar } from './projectSidebar';
import { OrganizationSidebar } from './organizationSidebar';
import { DemoBanner } from './demoBanner';

const AppLayoutComponent = ({ children, isDemoInstance, rawContent, sidebarType }) => {
  let sidebar;

  switch (sidebarType) {
    case ORGANIZATION_LEVEL: {
      sidebar = OrganizationSidebar;
      break;
    }
    case INSTANCE_LEVEL: {
      break;
    }
    default: {
      sidebar = ProjectSidebar;
    }
  }

  return (
    <Layout
      Header={AppHeader}
      Sidebar={sidebar}
      Banner={isDemoInstance ? DemoBanner : null}
      rawContent={rawContent}
    >
      {children}
    </Layout>
  );
};

AppLayoutComponent.propTypes = {
  children: PropTypes.node,
  isDemoInstance: PropTypes.bool,
  rawContent: PropTypes.bool,
  sidebarType: PropTypes.string,
};
AppLayoutComponent.defaultProps = {
  children: null,
  isDemoInstance: false,
  rawContent: false,
  sidebarType: null,
};

export const AppLayout = connect((state) => ({
  isDemoInstance: isDemoInstanceSelector(state),
}))(AppLayoutComponent);
