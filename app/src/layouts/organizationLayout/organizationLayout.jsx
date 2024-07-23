/*
 * Copyright 2024 EPAM Systems
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
import { HeaderLayout } from '../headerLayout';
import { OrganizationSidebar } from './organizationSidebar';
import { DemoBanner } from '../demoBanner';

const OrganizationLayoutComponent = ({ children, isDemoInstance, rawContent }) => (
  <Layout
    Header={HeaderLayout}
    Sidebar={OrganizationSidebar}
    Banner={isDemoInstance ? DemoBanner : null}
    rawContent={rawContent}
  >
    {children}
  </Layout>
);

OrganizationLayoutComponent.propTypes = {
  children: PropTypes.node,
  isDemoInstance: PropTypes.bool,
  rawContent: PropTypes.bool,
};
OrganizationLayoutComponent.defaultProps = {
  children: null,
  isDemoInstance: false,
  rawContent: false,
};

export const OrganizationLayout = connect((state) => ({
  isDemoInstance: isDemoInstanceSelector(state),
}))(OrganizationLayoutComponent);
