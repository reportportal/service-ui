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
import { ProjectSidebar } from './projectSidebar';
import { DemoBanner } from '../demoBanner';

const ProjectLayoutComponent = ({ children, isDemoInstance, rawContent }) => (
  <Layout
    Header={HeaderLayout}
    Sidebar={ProjectSidebar}
    Banner={isDemoInstance ? DemoBanner : null}
    rawContent={rawContent}
  >
    {children}
  </Layout>
);

ProjectLayoutComponent.propTypes = {
  children: PropTypes.node,
  isDemoInstance: PropTypes.bool,
  rawContent: PropTypes.bool,
};
ProjectLayoutComponent.defaultProps = {
  children: null,
  isDemoInstance: false,
  rawContent: false,
};

export const ProjectLayout = connect((state) => ({
  isDemoInstance: isDemoInstanceSelector(state),
}))(ProjectLayoutComponent);
